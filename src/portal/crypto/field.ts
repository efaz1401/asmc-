import "server-only";

import {
  randomBytes,
  createCipheriv,
  createDecipheriv,
  timingSafeEqual,
  createHash,
} from "node:crypto";

/**
 * Field-level encryption for sensitive PII (Iqama, passport, IBAN, salary…).
 *
 * AES-256-GCM with a fresh 96-bit IV per call. The wire format is:
 *   "v1:" + base64url(iv ‖ ciphertext ‖ tag)
 *
 * The 32-byte key comes from the env var ENCRYPTION_KEY, which must be
 * exactly 32 bytes encoded as base64. Generate with:
 *   node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
 *
 * The key is *separate* from the password-hashing salt and from the database
 * password. A DB dump alone leaks nothing.
 */

const VERSION = "v1";

let cachedKey: Buffer | null = null;
function key(): Buffer {
  if (cachedKey) return cachedKey;
  const raw = process.env.ENCRYPTION_KEY;
  if (!raw) throw new Error("ENCRYPTION_KEY env var is not set.");
  const buf = Buffer.from(raw, "base64");
  if (buf.length !== 32) {
    throw new Error(
      `ENCRYPTION_KEY must decode to 32 bytes (got ${buf.length}). Generate with: node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"`,
    );
  }
  cachedKey = buf;
  return buf;
}

function b64uEncode(buf: Buffer): string {
  return buf
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}
function b64uDecode(s: string): Buffer {
  const pad = s.length % 4 === 0 ? "" : "=".repeat(4 - (s.length % 4));
  return Buffer.from(s.replace(/-/g, "+").replace(/_/g, "/") + pad, "base64");
}

export function encryptField(plain: string | null | undefined): string | null {
  if (plain == null || plain === "") return null;
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key(), iv);
  const ct = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${VERSION}:${b64uEncode(Buffer.concat([iv, ct, tag]))}`;
}

export function decryptField(blob: string | null | undefined): string | null {
  if (!blob) return null;
  const [ver, body] = blob.split(":");
  if (ver !== VERSION || !body) {
    throw new Error("Unsupported ciphertext version.");
  }
  const buf = b64uDecode(body);
  if (buf.length < 12 + 16) throw new Error("Ciphertext too short.");
  const iv = buf.subarray(0, 12);
  const tag = buf.subarray(buf.length - 16);
  const ct = buf.subarray(12, buf.length - 16);
  const decipher = createDecipheriv("aes-256-gcm", key(), iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(ct), decipher.final()]).toString("utf8");
}

/** sha256 hex of arbitrary bytes — used for session ids, invite ids, etc. */
export function sha256Hex(input: string | Buffer): string {
  return createHash("sha256")
    .update(typeof input === "string" ? Buffer.from(input, "utf8") : input)
    .digest("hex");
}

/** Constant-time string comparison. */
export function timingSafeEqualStr(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) return false;
  return timingSafeEqual(ab, bb);
}

/** Cryptographically random URL-safe token. */
export function randomToken(bytes = 32): string {
  return b64uEncode(randomBytes(bytes));
}
