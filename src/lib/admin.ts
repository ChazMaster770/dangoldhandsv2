import { createHash } from "crypto";
import { cookies } from "next/headers";
import type { NextRequest } from "next/server";

const COOKIE_NAME = "dg_admin";
const SALT = "dan-gold-hands-salt";
const SEVEN_DAYS = 60 * 60 * 24 * 7;

function adminPassword() {
  // Fallback keeps working even if .env is reset by the platform.
  return process.env.ADMIN_PASSWORD || "1607";
}

export function sessionValue(password: string) {
  return createHash("sha256").update(password + SALT).digest("hex");
}

export function expectedSessionValue() {
  return sessionValue(adminPassword());
}

export function checkPassword(pw: string) {
  return pw === adminPassword();
}

/** Use inside route handlers */
export function isAdminRequest(req: NextRequest) {
  return req.cookies.get(COOKIE_NAME)?.value === expectedSessionValue();
}

/** Use inside server components */
export async function isAdminCookies() {
  const store = await cookies();
  return store.get(COOKIE_NAME)?.value === expectedSessionValue();
}

export const adminCookie = {
  name: COOKIE_NAME,
  maxAge: SEVEN_DAYS,
};
