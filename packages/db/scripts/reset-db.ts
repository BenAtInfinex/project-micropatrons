import { getDatabase, DATABASE_PATH, getDatabaseInfo } from "../src/database.js";

console.log("Resetting database...");
getDatabaseInfo();

// Get database instance
const db = getDatabase();

// Clear all data from tables
db.serialize(() => {
  console.log("Clearing all data from tables...");

  // Enable foreign key constraints
  db.run(`PRAGMA foreign_keys = ON`);

  // Delete from activity table first due to foreign key constraints
  db.run("DELETE FROM activity", (err) => {
    if (err) {
      console.error("Error clearing activity table:", err);
    } else {
      console.log("Cleared activity table");
    }

    // Then delete from users table
    db.run("DELETE FROM users", (err) => {
      if (err) {
        console.error("Error clearing users table:", err);
      } else {
        console.log("Cleared users table");
      }

      // Reset autoincrement counters (if any)
      db.run("DELETE FROM sqlite_sequence", (err) => {
        if (err && err.message !== "no such table: sqlite_sequence") {
          console.error("Error resetting autoincrement:", err);
        }

        // Vacuum to reclaim space
        db.run("VACUUM", (err) => {
          if (err) {
            console.error("Error vacuuming database:", err);
          } else {
            console.log("Database vacuumed");
          }

          db.close((err) => {
            if (err) {
              console.error("Error closing database:", err);
            }

            console.log("\nDatabase reset complete!");
            console.log("All tables have been cleared.");
            console.log("Run the seed script to populate with sample data.");
            console.log("\nDBeaver connection info:");
            console.log(`Database Type: SQLite`);
            console.log(`Database Path: ${DATABASE_PATH}`);
          });
        });
      });
    });
  });
});
