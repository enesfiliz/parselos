// Prisma CLI expects DATABASE_URL to be available at runtime.
// We prefer .env.local for local development, but also fall back to .env.
import dotenv from "dotenv";
import { defineConfig } from "prisma/config";

dotenv.config({ path: ".env" });
dotenv.config({ path: ".env.local", override: true });

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env["DATABASE_URL"],
  },
});
