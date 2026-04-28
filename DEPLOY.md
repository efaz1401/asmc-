# Deploying `asmc.com.sa`

Three ways to ship the marketing site. Pick one.

| Path | Cost | Difficulty | Contact form works? | Full JS features? |
|---|---|---|---|---|
| **[A. Vercel](#a--vercel-recommended)** | Free tier fine | Easiest (5 min) | Yes (native) | Yes |
| **[B. Hostinger VPS (KVM)](#b--hostinger-vps-kvm)** | VPS plan | Medium (30–60 min) | Yes | Yes |
| **[C. Hostinger shared hosting (static export)](#c--hostinger-shared-hosting-static-export)** | Included with your plan | Medium | No — use Formspree/Web3Forms | Mostly |

Pointing the `asmc.com.sa` domain is covered in **[D. DNS & custom domain](#d--dns--custom-domain)** — same steps regardless of where the site is hosted.

---

## A — Vercel (recommended)

Zero-config. Best if you just want it live and don't want to babysit servers.

### Steps

1. Sign in at https://vercel.com with your GitHub account.
2. Click **Add New → Project** and pick `efaz1401/asmc-` from the list.
3. Framework preset should auto-detect **Next.js**. Leave everything else default (root dir `.`, build `next build`, output `.next`).
4. (Optional) Add env vars under **Environment Variables**:
   - `RESEND_API_KEY` — your Resend key (get one free at https://resend.com). Without this the contact form endpoint returns 202 and just logs.
   - `CONTACT_TO` — `contact@asmc.com.sa` (or wherever you want leads to land).
5. Click **Deploy**. First build takes ~60 seconds. You'll get a `*.vercel.app` preview URL.
6. (Optional, but you'll want it) Go to **Project → Settings → Domains**, add `asmc.com.sa` **and** `www.asmc.com.sa`. Vercel will tell you exactly which DNS records to set — see [D. DNS](#d--dns--custom-domain).

### What you get

- Global edge network, automatic HTTPS (Let's Encrypt), automatic HTTP/2.
- `/api/contact` runs as a serverless function — no extra config.
- Dynamic OG image + favicon routes work out of the box.
- Every future PR gets a preview URL; every push to `master` redeploys prod.

### When not to use Vercel

- You don't want your DNS / TLS / CI to depend on a third party.
- You want everything on one server you control (→ go to [B](#b--hostinger-vps-kvm)).

---

## B — Hostinger VPS (KVM)

Runs the same Next.js server as Vercel, just on a box you own. Best if you'll also run the employee portal on the same box (the employee portal requires Postgres which Hostinger shared can't provide).

**What goes on the box**: nginx → Node.js → Next.js, with a systemd service that auto-restarts on crash or reboot, and a TLS cert from Let's Encrypt.

### One-time setup (fresh Ubuntu 24.04 VPS, as `root`)

```bash
# 1. Base hardening + deps
apt update && apt upgrade -y
apt install -y curl git build-essential nginx certbot python3-certbot-nginx ufw fail2ban unattended-upgrades
dpkg-reconfigure -plow unattended-upgrades
ufw default deny incoming && ufw default allow outgoing
ufw allow OpenSSH && ufw allow 'Nginx Full'
ufw --force enable
systemctl enable --now fail2ban

# 2. Non-root deploy user
adduser --disabled-password --gecos "" deploy
usermod -aG sudo deploy
mkdir -p /home/deploy/.ssh
cp ~/.ssh/authorized_keys /home/deploy/.ssh/ 2>/dev/null || true
chown -R deploy:deploy /home/deploy/.ssh
chmod 700 /home/deploy/.ssh && chmod 600 /home/deploy/.ssh/authorized_keys 2>/dev/null || true

# 3. Disable root SSH + password auth (do this AFTER verifying `ssh deploy@...` works)
# sed -i 's/^#\?PermitRootLogin.*/PermitRootLogin no/' /etc/ssh/sshd_config
# sed -i 's/^#\?PasswordAuthentication.*/PasswordAuthentication no/' /etc/ssh/sshd_config
# systemctl restart ssh

# 4. Node 20 LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# 5. Clone + build the site as `deploy`
su - deploy -c "
  git clone https://github.com/efaz1401/asmc-.git /home/deploy/asmc
  cd /home/deploy/asmc
  npm ci
  npm run build
"

# 6. systemd unit
cat > /etc/systemd/system/asmc-site.service <<'UNIT'
[Unit]
Description=ASMC marketing site (Next.js)
After=network.target

[Service]
Type=simple
User=deploy
WorkingDirectory=/home/deploy/asmc
Environment=NODE_ENV=production
Environment=PORT=3010
# Optional: Environment=RESEND_API_KEY=...  CONTACT_TO=contact@asmc.com.sa
ExecStart=/usr/bin/node node_modules/next/dist/bin/next start --port 3010
Restart=on-failure
RestartSec=5
LimitNOFILE=65536

[Install]
WantedBy=multi-user.target
UNIT
systemctl daemon-reload
systemctl enable --now asmc-site

# 7. nginx reverse proxy
cat > /etc/nginx/sites-available/asmc.conf <<'NGX'
server {
    listen 80;
    listen [::]:80;
    server_name asmc.com.sa www.asmc.com.sa;

    location /_next/static/ {
        proxy_pass http://127.0.0.1:3010;
        proxy_cache_valid 200 1y;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }

    location / {
        proxy_pass http://127.0.0.1:3010;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
NGX
ln -sf /etc/nginx/sites-available/asmc.conf /etc/nginx/sites-enabled/asmc.conf
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx

# 8. TLS — point DNS first (see section D), then:
certbot --nginx -d asmc.com.sa -d www.asmc.com.sa --agree-tos -m contact@asmc.com.sa --redirect -n
```

### Deploying a new version

Once the above is in place, future deploys are one command:

```bash
ssh deploy@YOUR_VPS_IP '
  cd ~/asmc && git pull && npm ci && npm run build && sudo systemctl restart asmc-site
'
```

I can wire this into a GitHub Action on `push to master` if you want — say the word.

### Minimum VPS size

- **KVM 1** (1 vCPU, 4 GB RAM, 50 GB SSD) is more than enough for just the marketing site. Plenty of headroom to add the portal + Postgres later on the same box.

---

## C — Hostinger shared hosting (static export)

Use this only if you want to host on your existing Hostinger Business / Cloud plan without a VPS. You'll lose the contact-form server endpoint and have to use a third-party form service.

### 1. Enable static export

In `next.config.ts`, add:

```ts
const nextConfig: NextConfig = {
  output: "export",
  images: { unoptimized: true },   // shared hosting has no image optimizer
  trailingSlash: true,             // makes Apache happy with /about/index.html
};
```

### 2. Replace the contact form target

Open https://formspree.io (or https://web3forms.com — both have free tiers) and create a form that delivers to `contact@asmc.com.sa`. Change the contact form `action` in `src/app/contact/page.tsx` from `/api/contact` to the endpoint they give you (e.g. `https://formspree.io/f/abcd1234`). **Delete `src/app/api/contact/route.ts`** — static export can't include server routes.

### 3. Build

```bash
npm ci
npm run build
# Produces a static site in ./out
```

### 4. Upload `out/` to Hostinger

- Hostinger panel → **File Manager** → `public_html/`
- Drag everything inside `out/` into `public_html/`
- Add a `.htaccess` with clean-URL rewrites (Hostinger uses Apache):

```apache
# public_html/.htaccess
RewriteEngine On
RewriteRule ^([^.]+)/?$ $1.html [L]
ErrorDocument 404 /404.html
```

### What doesn't work in static export

- `/api/contact` (use Formspree as above).
- The dynamic `/opengraph-image` route — ship a static PNG at `/public/og.png` instead and reference it from `metadata.openGraph.images`.
- The dynamic `/icon.tsx` — rename to `/public/favicon.ico`.
- `robots.txt` and `sitemap.xml` still work (they're pre-rendered at build).

---

## D — DNS & custom domain

Wherever `asmc.com.sa` currently has DNS (Hostinger, Namecheap, Cloudflare, etc.), you need to point it at your hosting target.

### For Vercel

In your DNS provider's panel, set:

| Type | Name | Value | TTL |
|---|---|---|---|
| A | `@` | `76.76.21.21` | 3600 |
| CNAME | `www` | `cname.vercel-dns.com` | 3600 |

Then in Vercel → Project → Settings → Domains, click **Refresh** until both `asmc.com.sa` and `www.asmc.com.sa` are green.

### For Hostinger VPS

In your DNS provider's panel:

| Type | Name | Value | TTL |
|---|---|---|---|
| A | `@` | `YOUR_VPS_IP` | 3600 |
| A | `www` | `YOUR_VPS_IP` | 3600 |

Then run `certbot` on the box (step 8 in section B).

### For Hostinger shared hosting

If your domain is already registered with Hostinger, go to **Hosting → asmc.com.sa → Domains** and it's wired automatically. If DNS is elsewhere, Hostinger's panel shows the exact records to copy.

### Verifying

```bash
dig +short asmc.com.sa
dig +short www.asmc.com.sa
curl -I https://asmc.com.sa | head
```

Expect a `200` or `301`/`308` (HTTPS redirect), `strict-transport-security` header present, and a valid TLS cert.

---

## After deploy — quick sanity checks

Regardless of path, verify:

- [ ] https://asmc.com.sa loads the dark homepage with the big hero.
- [ ] https://asmc.com.sa/ar loads the Arabic RTL version.
- [ ] https://asmc.com.sa/services shows 5 numbered service cards.
- [ ] https://asmc.com.sa/sitemap.xml lists all 12+ URLs and `https://asmc.com.sa/ar`.
- [ ] https://asmc.com.sa/robots.txt returns `User-agent: *` + `Sitemap:`.
- [ ] Submitting the contact form returns success (check email arrives if you wired `RESEND_API_KEY`; check Formspree dashboard if you used that path).
- [ ] Google's Rich Results Test — https://search.google.com/test/rich-results?url=https://asmc.com.sa — detects Organization, WebSite, FAQPage, and Service.
- [ ] Google Search Console — add the property and submit `sitemap.xml`.

---

## What to do when you're ready for the portal

Portal PR: https://github.com/efaz1401/asmc-/pull/2 (stays draft until you merge this marketing PR).

- Vercel path: same Vercel project can serve both. Add `portal.asmc.com.sa` as a second domain. `ENCRYPTION_KEY` / `DATABASE_URL` / `R2_*` go in the same Environment Variables panel.
- VPS path: same box, add Postgres, add `portal.asmc.com.sa` as a second nginx vhost. Happy to handle end-to-end.
- Shared hosting: **not viable** for the portal (no Postgres, no Node server).
