import { describe, it, expect, beforeEach, afterEach } from "vitest";

describe("Environment Configuration", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
    delete process.env.NEON_DATABASE_URL;
    delete process.env.BETTER_AUTH_SECRET;
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("throws when NEON_DATABASE_URL is missing", async () => {
    const { getConfig } = await import("./env");
    expect(() => getConfig()).toThrow("NEON_DATABASE_URL");
  });

  it("throws when BETTER_AUTH_SECRET is missing", async () => {
    process.env.NEON_DATABASE_URL = "postgresql://test:test@localhost/test";
    const { getConfig } = await import("./env");
    expect(() => getConfig()).toThrow("BETTER_AUTH_SECRET");
  });

  it("returns config with valid environment", async () => {
    process.env.NEON_DATABASE_URL = "postgresql://test:test@localhost/test";
    process.env.BETTER_AUTH_SECRET = "test-secret-12345";
    const { getConfig } = await import("./env");
    const config = getConfig();
    expect(config.databaseUrl).toBe("postgresql://test:test@localhost/test");
    expect(config.betterAuthSecret).toBe("test-secret-12345");
  });
});
