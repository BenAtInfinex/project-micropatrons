import sqlite3 from "sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Centralized database path - always in packages/db/
export const DATABASE_PATH = path.join(__dirname, "..", "micropatrons.db");

export function getDatabase() {
  return new sqlite3.Database(DATABASE_PATH);
}

export function getDatabaseInfo() {
  console.log(`Database location: ${DATABASE_PATH}`);
  return DATABASE_PATH;
}
