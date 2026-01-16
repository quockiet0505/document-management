
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "postgresql",
  //  CSDL
  schema: "./drizzle/schema.ts",
  //  OUTPUT MIGRATION
  out: "./drizzle/migrations",

});
