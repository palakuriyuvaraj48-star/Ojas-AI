/**
 * Cryptographic helpers for the admin platform.
 * - HMAC-signed session tokens (admin cookies)
 * - AES-256-GCM encryption for sensitive configuration
 * Uses only Node's built-in crypto module (no external dependencies).
 */
import crypto from "crypto";

const SESSION_SECRET = process.env.ADMIN_SESSION_SECRET || "titan-admin-dev-secret-change-me";
const CONFIG_SECRET = process.env.ADMIN_CONFIG_SECRET || "titan-admin-config-dev-secret";

export interface SignedToken {
  userId: string;
  role: string;
  email: string;
  iat: number;
  exp: number;
}

export function signToken(payload: Omit<SignedToken, "iat" | "exp">, ttlSeconds = 60 * 60 * 8): string {
  const header = { alg: "HS256", typ: "JT" };
  const iat = Math.floor(Date.now() / 1000);
  const exp = iat + ttlSeconds;
  const body = { ...payload, iat, exp };
  const data = `${base64url(JSON.stringify(header))}.${base64url(JSON.stringify(body))}`;
  const sig = crypto.createHmac("sha256", SESSION_SECRET).update(data).digest("base64url");
  return `${data}.${sig}`;
}

export function verifyToken(token: string): SignedToken | null {
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [h, b, sig] = parts;
  const expected = crypto.createHmac("sha256", SESSION_SECRET).update(`${h}.${b}`).digest("base64url");
  if (sig !== expected) return null;
  let body: SignedToken;
  try {
    body = JSON.parse(base64urlDecode(b));
  } catch {
    return null;
  }
  if (body.exp * 1000 < Date.now()) return null;
  return body;
}

export function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(`titan::${password}`).digest("hex");
}

export function verifyPassword(password: string, hash: string): boolean {
  return hashPassword(password) === hash;
}

export function randomToken(bytes = 24): string {
  return crypto.randomBytes(bytes).toString("base64url");
}

// ─── AES-256-GCM for sensitive config ───────────────────────────────────────

function deriveKey(secret: string): Buffer {
  return crypto.createHash("sha256").update(secret).digest();
}

export function encryptSecret(plaintext: string): string {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", deriveKey(CONFIG_SECRET), iv);
  const enc = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${iv.toString("base64url")}.${tag.toString("base64url")}.${enc.toString("base64url")}`;
}

export function decryptSecret(payload: string): string {
  const [iv, tag, enc] = payload.split(".");
  if (!iv || !tag || !enc) throw new Error("Malformed encrypted payload");
  const decipher = crypto.createDecipheriv("aes-256-gcm", deriveKey(CONFIG_SECRET), Buffer.from(iv, "base64url"));
  decipher.setAuthTag(Buffer.from(tag, "base64url"));
  const dec = Buffer.concat([decipher.update(Buffer.from(enc, "base64url")), decipher.final()]);
  return dec.toString("utf8");
}

function base64url(input: string): string {
  return Buffer.from(input).toString("base64url");
}

function base64urlDecode(input: string): string {
  return Buffer.from(input, "base64url").toString("utf8");
}
