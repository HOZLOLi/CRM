import "server-only";
import { cookies, headers } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { db } from "./db";
import { assertEnv, isSecureRequest } from "./env";

const COOKIE = "crm_session";

function secretKey() {
  assertEnv();
  return new TextEncoder().encode(
    process.env.AUTH_SECRET ?? "dev-only-insecure-secret-change-me-please-32",
  );
}

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: string;
  title: string | null;
  avatarHue: number;
}

export async function hashPassword(plain: string) {
  return bcrypt.hash(plain, 10);
}

export async function verifyPassword(plain: string, hash: string) {
  return bcrypt.compare(plain, hash);
}

export async function createSession(userId: string) {
  const token = await new SignJWT({ sub: userId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(secretKey());

  // The cookie must be `Secure` only when the browser is actually on HTTPS.
  // A shop LAN runs on http://192.168.x.x — a Secure cookie there is silently
  // dropped by the browser and every login fails.
  const h = await headers();
  const secure = isSecureRequest(h.get("x-forwarded-proto"), h.get("host"));

  const store = await cookies();
  store.set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure,
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function destroySession() {
  const store = await cookies();
  store.delete(COOKIE);
}

export async function getSession(): Promise<SessionUser | null> {
  const store = await cookies();
  const token = store.get(COOKIE)?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, secretKey());
    const id = payload.sub;
    if (!id) return null;

    const user = await db.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        title: true,
        avatarHue: true,
        isActive: true,
      },
    });
    if (!user || !user.isActive) return null;
    const { isActive: _isActive, ...session } = user;
    return session;
  } catch {
    return null;
  }
}

export async function requireUser(): Promise<SessionUser> {
  const user = await getSession();
  if (!user) throw new Error("UNAUTHORIZED");
  return user;
}
