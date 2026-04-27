import "server-only";

import { hash, verify } from "@node-rs/argon2";

/**
 * argon2id with OWASP-recommended params (m=64MiB, t=3, p=4) is overkill on a
 * Vercel function but cheap on a long-running server. The cost is paid only on
 * login and password change, which are rate-limited.
 *
 * Algorithm.Argon2id == 2 in @node-rs/argon2; we hard-code so we don't pull
 * the const enum (forbidden under isolatedModules).
 */
const PARAMS = {
  algorithm: 2,
  memoryCost: 64 * 1024, // 64 MiB
  timeCost: 3,
  parallelism: 4,
} as const;

export async function hashPassword(plain: string): Promise<string> {
  return hash(plain, PARAMS);
}

export async function verifyPassword(
  hashStr: string,
  plain: string,
): Promise<boolean> {
  try {
    return await verify(hashStr, plain);
  } catch {
    return false;
  }
}

/** Local password policy. We pair this with an HIBP k-anonymity check. */
export function passwordPolicyError(pw: string): string | null {
  if (pw.length < 12) return "Password must be at least 12 characters.";
  if (pw.length > 256) return "Password must be at most 256 characters.";
  const classes = [
    /[a-z]/.test(pw),
    /[A-Z]/.test(pw),
    /[0-9]/.test(pw),
    /[^A-Za-z0-9]/.test(pw),
  ].filter(Boolean).length;
  if (classes < 3)
    return "Password must mix at least three of: lower, upper, digit, symbol.";
  return null;
}

/**
 * HIBP k-anonymity check: send only the first 5 SHA-1 hex chars to HIBP,
 * compare the suffix locally. The full password never leaves the server.
 *
 * Returns the breach count, or null if the network call failed.
 */
export async function hibpBreachCount(pw: string): Promise<number | null> {
  const { createHash } = await import("node:crypto");
  const sha1 = createHash("sha1").update(pw, "utf8").digest("hex").toUpperCase();
  const prefix = sha1.slice(0, 5);
  const suffix = sha1.slice(5);
  try {
    const res = await fetch(
      `https://api.pwnedpasswords.com/range/${prefix}`,
      { headers: { "Add-Padding": "true" }, cache: "no-store" },
    );
    if (!res.ok) return null;
    const text = await res.text();
    for (const line of text.split("\n")) {
      const [hashSuffix, count] = line.trim().split(":");
      if (hashSuffix === suffix) return Number(count) || 0;
    }
    return 0;
  } catch {
    return null;
  }
}
