import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/infra/schema/*",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.NEON_DATABASE_URL!,
  },
});
