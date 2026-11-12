import "server-only";

/**
 * Environment validation.
 *
 * Fails fast and loudly in production instead of silently falling back to an
 * insecure default. Called lazily (never at build time) so `next build` works
 * without secrets.
 */
let checked = false;

export function assertEnv() {
  if (checked) return;
  checked = true;

  const isProd = process.env.NODE_ENV === "production";
  const secret = process.env.AUTH_SECRET?.trim() ?? "";

  if (isProd && secret.length < 32) {
    throw new Error(
      "AUTH_SECRET is missing or too short (min 32 chars). " +
        "Generate one with: node -e \"console.log(require('crypto').randomBytes(32).toString('hex'))\"",
    );
  }

  if (isProd && secret.includes("dev-only-insecure")) {
    throw new Error("AUTH_SECRET is still the development placeholder. Set a real secret.");
  }

  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set.");
  }
}

/** True when the app is served over HTTPS (directly or behind a proxy/tunnel). */
export function isSecureRequest(proto: string | null | undefined, host: string | null | undefined) {
  const override = process.env.COOKIE_SECURE?.trim().toLowerCase();
  if (override === "true") return true;
  if (override === "false") return false;

  if (proto) return proto.split(",")[0].trim() === "https";
  return host?.startsWith("localhost") || host?.startsWith("127.0.0.1") ? false : false;
}
