// seed.ts
import crypto from "crypto";
import { getDatabase, getDatabaseInfo } from "../src/database.js";

// Get database instance
const db = getDatabase();

// Show where we're seeding
console.log("Database information:");
getDatabaseInfo();

// Sample usernames
const sampleUsers = [
  "Axe",
  "Beanie",
  "Ben",
  "Bingo",
  "Blue",
  "Bob",
  "Britt",
  "Cuz",
  "Dicey",
  "Disco",
  "Donny",
  "Dre",
  "Dune",
  "Dynamo",
  "Egor",
  "Equinox",
  "Goblinlackey",
  "Hatake",
  "Hocho",
  "Ibex",
  "Jed",
  "Jimmy",
  "Joseph",
  "Kain",
  "Khaleesi",
  "Kirsty",
  "Leafygreens",
  "Lionlamb",
  "Malves",
  "Margo",
  "Min",
  "Oiiaoiia",
  "Opaque",
  "Pandas",
  "Quantumflux",
  "R3M3",
  "Rambo",
  "Raz",
  "Redy",
  "Riva",
  "Roscoe",
  "Sneed",
  "Snowwhite",
  "Spud",
  "Taobao",
  "Thor",
  "Tuna",
  "Vader",
  "Walker",
  "Wren",
  "Yamen",
  "Yingli",
];

console.log("Seeding database...");

db.serialize(() => {
  console.log("Creating tables...");

  // Keep FK constraints honest
  db.run(`PRAGMA foreign_keys = ON`);

  // Users table with starting balance 200,000
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      balance INTEGER NOT NULL DEFAULT 200000,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Activity table for tracking transfers
  db.run(`
    CREATE TABLE IF NOT EXISTS activity (
      id TEXT PRIMARY KEY,
      from_user_id TEXT NOT NULL,
      to_user_id TEXT NOT NULL,
      amount INTEGER NOT NULL,
      timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (from_user_id) REFERENCES users(id),
      FOREIGN KEY (to_user_id) REFERENCES users(id)
    )
  `);

  db.run(`
    CREATE INDEX IF NOT EXISTS idx_activity_timestamp 
    ON activity(timestamp DESC)
  `);

  // Clear existing data
  db.run("DELETE FROM activity", (err) => {
    if (err) {
      console.error("Error clearing activity table:", err);
    }

    db.run("DELETE FROM users", (err) => {
      if (err) {
        console.error("Error clearing users table:", err);
        process.exit(1);
      }

      console.log("Cleared existing data");

      // Begin atomic write
      db.exec("BEGIN TRANSACTION", (beginErr) => {
        if (beginErr) {
          console.error("Error beginning transaction:", beginErr);
          process.exit(1);
        }

        // Insert sample users with UUIDs and starting balance 200,000
        const insertUser = db.prepare(
          "INSERT INTO users (id, username, balance) VALUES (?, ?, ?)",
        );
        const userIds: Record<string, string> = {};

        sampleUsers.forEach((username, index) => {
          const userId = crypto.randomUUID();
          userIds[username] = userId;

          insertUser.run(userId, username, 200000, (err2) => {
            if (err2) {
              console.error(`Error inserting user ${username}:`, err2);
            } else {
              console.log(`Inserted user: ${username} (ID: ${userId})`);
            }

            if (index === sampleUsers.length - 1) {
              insertUser.finalize(() => {
                console.log("\nCreating 5 transfers to Ben...");

                const transfers = [
                  { from: "Hatake", to: "Ben", amount: 20000 },
                  { from: "Pandas", to: "Ben", amount: 20000 },
                  { from: "Dune", to: "Ben", amount: 20000 },
                  { from: "Thor", to: "Ben", amount: 20000 },
                  { from: "Equinox", to: "Ben", amount: 20000 },
                ];

                const insertActivity = db.prepare(
                  "INSERT INTO activity (id, from_user_id, to_user_id, amount) VALUES (?, ?, ?, ?)",
                );
                const updateBalance = db.prepare(
                  "UPDATE users SET balance = balance + ? WHERE id = ?",
                );

                transfers.forEach((t, tIndex) => {
                  const fromId = userIds[t.from];
                  const toId = userIds[t.to];

                  if (!fromId || !toId) {
                    console.error(
                      `Missing user ID(s) for transfer ${t.from} -> ${t.to}`,
                    );
                    return;
                  }

                  const activityId = crypto.randomUUID();

                  // Record activity
                  insertActivity.run(activityId, fromId, toId, t.amount);

                  // Adjust balances
                  updateBalance.run(-t.amount, fromId);
                  updateBalance.run(t.amount, toId);

                  console.log(
                    `Created transfer: ${t.from} → ${t.to}: ${t.amount} µPatrons`,
                  );

                  if (tIndex === transfers.length - 1) {
                    insertActivity.finalize();
                    updateBalance.finalize(() => {
                      // Commit atomic write
                      db.exec("COMMIT", (commitErr) => {
                        if (commitErr) {
                          console.error(
                            "Error committing transaction:",
                            commitErr,
                          );
                          // Try to roll back if commit failed
                          db.exec("ROLLBACK", () => {
                            db.close();
                          });
                          return;
                        }

                        db.close(() => {
                          console.log("\nDatabase seeded successfully!");
                          console.log(
                            `Created ${sampleUsers.length} users and ${transfers.length} total transfers`,
                          );
                          console.log(
                            "All users start at 200,000; Ben receives 100,000 from 5 senders.",
                          );
                        });
                      });
                    });
                  }
                });
              });
            }
          });
        });
      });
    });
  });
});
