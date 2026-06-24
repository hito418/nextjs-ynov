import { scryptSync, randomBytes, timingSafeEqual } from "node:crypto";

// Minimal password hashing with Node's built-in scrypt — no external deps.
// Stored format is "salt:hash" (both hex). For a real app you'd likely reach
// for argon2/bcrypt, but scrypt is solid and dependency-free for the workshop.

const KEYLEN = 64;

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, KEYLEN).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const expected = Buffer.from(hash, "hex");
  const actual = scryptSync(password, salt, KEYLEN);
  // Constant-time comparison to avoid timing leaks.
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}
