import "server-only";

import { TOTP, Secret } from "otpauth";
import QRCode from "qrcode";
import { encryptField, decryptField } from "../crypto/field";

const ISSUER = "ASMC Portal";
const ALGO = "SHA1"; // SHA1 is the only widely-compatible algo for Google Authenticator
const DIGITS = 6;
const PERIOD = 30; // seconds
const WINDOW = 1; // accept ±1 step (i.e. 30s drift each way)

/**
 * Make a fresh TOTP secret for a user. Returns the otpauth:// URI for the QR
 * code, the encrypted secret blob to store, and a PNG data URL for inline
 * rendering.
 */
export async function makeTotp(label: string) {
  const secret = new Secret({ size: 20 });
  const totp = new TOTP({
    issuer: ISSUER,
    label,
    algorithm: ALGO,
    digits: DIGITS,
    period: PERIOD,
    secret,
  });
  const uri = totp.toString();
  const qrDataUrl = await QRCode.toDataURL(uri, {
    errorCorrectionLevel: "M",
    margin: 1,
    width: 240,
  });
  const enc = encryptField(secret.base32);
  if (!enc) throw new Error("Failed to encrypt TOTP secret.");
  return { uri, qrDataUrl, secretEnc: enc };
}

/** Verify a 6-digit code against the stored encrypted secret. */
export function verifyTotp(secretEnc: string, code: string): boolean {
  const cleaned = code.replace(/\s+/g, "");
  if (!/^\d{6}$/.test(cleaned)) return false;
  const base32 = decryptField(secretEnc);
  if (!base32) return false;
  const totp = new TOTP({
    issuer: ISSUER,
    label: "verify",
    algorithm: ALGO,
    digits: DIGITS,
    period: PERIOD,
    secret: Secret.fromBase32(base32),
  });
  const delta = totp.validate({ token: cleaned, window: WINDOW });
  return delta !== null;
}
