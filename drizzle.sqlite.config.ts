import { defineConfig } from "drizzle-kit";

const dbPath = process.env.NODE_ENV === 'production' ? './database.db' : './dev-database.db';

export default defineConfig({
  out: "./sqlite-migrations",
  schema: "./shared/simple-sqlite-schema.ts",
  dialect: "sqlite",
  dbCredentials: {
    url: dbPath,
  },
});