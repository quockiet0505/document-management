import { SQLDatabase } from "encore.dev/storage/sqldb";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

export const DocumentDB = new SQLDatabase("documentdb", {
  migrations: {
    path: "migrations",
    source: "drizzle",
  },
});

const pool = new Pool({
  connectionString: DocumentDB.connectionString,
});

export const db = drizzle(pool);
export const connectionString = DocumentDB.connectionString;