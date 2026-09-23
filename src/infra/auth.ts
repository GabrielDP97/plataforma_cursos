import { betterAuth } from "better-auth";
import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { username } from "better-auth/plugins";

// Lazy initialization — only creates auth instance when first needed
let _auth: any = null;

function getAuth(): any {
  if (!_auth) {
    const secret = process.env.BETTER_AUTH_SECRET;
    if (!secret) {
      throw new Error(
        "Missing BETTER_AUTH_SECRET. Copy .dev.vars.example to .dev.vars and configure a secret."
      );
    }

    // Dynamic import to avoid top-level db initialization
    const { db } = require("./db");

    _auth = betterAuth({
      database: drizzleAdapter(db, { provider: "pg" }),
      advanced: {
        database: {
          generateId: "uuid",
        },
      },
      emailAndPassword: {
        enabled: true,
        requireEmailVerification: false,
        minPasswordLength: 5, // Allow 5-digit temporary passwords for admin-provisioned accounts
        maxPasswordLength: 128,
      },
      session: {
        expiresIn: 60 * 60 * 24 * 7, // 7 days
        updateAge: 60 * 60 * 24, // 1 day
      },
      user: {
        additionalFields: {
          role: {
            type: "string",
            defaultValue: "student",
          },
          mustChangePassword: {
            type: "boolean",
            defaultValue: false,
          },
        },
      },
      plugins: [
        username({
          // Disable username availability endpoint — usernames are admin-provisioned
          // and should not be enumerable by unauthenticated users
        }),
      ],
      disabledPaths: ["/is-username-available", "/sign-up/email"],
      baseURL: process.env.BETTER_AUTH_URL || "http://localhost:8787",
      trustedOrigins: [
        "http://localhost:5173",
        "http://localhost:8787",
        process.env.CORS_ORIGIN || "",
      ].filter(Boolean),
    });
  }
  return _auth;
}

// Export a lazy accessor — callers use auth.api.signInEmail(...) etc.
// The first call initializes Better Auth + DB connection
export const auth = new Proxy({} as any, {
  get(_target, prop) {
    return (getAuth() as any)[prop];
  },
});
