import sqlite3 from "sqlite3";
import path from "path";
import crypto from "crypto";

const db = new sqlite3.Database(path.join(__dirname, "..", "micropatrons.db"));

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
  "Thor", // Adding Thor for the transfer
  "Tuna",
  "Vader",
  "Walker",
  "Wren",
  "Yamen",
  "Yingli",
];

console.log("Seeding database...");

db.serialize(() => {
  // Create tables if they don't exist
  console.log("Creating tables...");

  // Users table with UUID
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

  // Create index on activity timestamp for faster queries
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

      // Insert sample users with UUIDs
      const stmt = db.prepare(
        "INSERT INTO users (id, username, balance) VALUES (?, ?, ?)",
      );
      const userIds: { [username: string]: string } = {};

      sampleUsers.forEach((username, index) => {
        const userId = crypto.randomUUID();
        userIds[username] = userId;

        stmt.run(userId, username, 200000, (err) => {
          if (err) {
            console.error(`Error inserting user ${username}:`, err);
          } else {
            console.log(`Inserted user: ${username} (ID: ${userId})`);
          }

          // After all users are inserted, create some sample activities
          if (index === sampleUsers.length - 1) {
            stmt.finalize(() => {
              console.log("\nCreating sample transfers...");

              // Create transfers to Ben
              const transfers = [
                { from: "Hatake", to: "Ben", amount: 20000 },
                { from: "Pandas", to: "Ben", amount: 20000 },
                { from: "Dune", to: "Ben", amount: 20000 },
                { from: "Thor", to: "Ben", amount: 20000 },
                { from: "Equinox", to: "Ben", amount: 20000 },
              ];

              const activityStmt = db.prepare(
                "INSERT INTO activity (id, from_user_id, to_user_id, amount) VALUES (?, ?, ?, ?)",
              );
              const updateStmt = db.prepare(
                "UPDATE users SET balance = balance + ? WHERE id = ?",
              );

              transfers.forEach((transfer, tIndex) => {
                const activityId = crypto.randomUUID();
                const fromUserId = userIds[transfer.from];
                const toUserId = userIds[transfer.to];

                // Create activity record
                activityStmt.run(
                  activityId,
                  fromUserId,
                  toUserId,
                  transfer.amount,
                );

                // Update balances
                updateStmt.run(-transfer.amount, fromUserId);
                updateStmt.run(transfer.amount, toUserId);

                console.log(
                  `Created transfer: ${transfer.from} → ${transfer.to}: ${transfer.amount} micropatrons`,
                );

                if (tIndex === transfers.length - 1) {
                  activityStmt.finalize();
                  updateStmt.finalize(() => {
                    console.log("\nCreating historical activity data...");

                    // Create some historical transfers for the past 30 days
                    const historicalTransfers = [];
                    const usernames = Object.keys(userIds);

                    // Generate 3-10 random transfers per day for the past 30 days
                    for (let daysAgo = 30; daysAgo >= 0; daysAgo--) {
                      const transfersPerDay = Math.floor(Math.random() * 8) + 3;

                      for (let i = 0; i < transfersPerDay; i++) {
                        const fromUser =
                          usernames[
                            Math.floor(Math.random() * usernames.length)
                          ];
                        let toUser =
                          usernames[
                            Math.floor(Math.random() * usernames.length)
                          ];

                        // Ensure sender and receiver are different
                        while (toUser === fromUser) {
                          toUser =
                            usernames[
                              Math.floor(Math.random() * usernames.length)
                            ];
                        }

                        const amount = Math.floor(Math.random() * 5000) + 100; // 100-5100 µPatrons
                        const date = new Date();
                        date.setDate(date.getDate() - daysAgo);
                        date.setHours(
                          Math.floor(Math.random() * 24),
                          Math.floor(Math.random() * 60),
                          Math.floor(Math.random() * 60),
                        );

                        historicalTransfers.push({
                          id: crypto.randomUUID(),
                          from: fromUser,
                          to: toUser,
                          amount: amount,
                          timestamp: date.toISOString(),
                        });
                      }
                    }

                    // Insert historical transfers
                    const histStmt = db.prepare(
                      "INSERT INTO activity (id, from_user_id, to_user_id, amount, timestamp) VALUES (?, ?, ?, ?, ?)",
                    );
                    let insertedCount = 0;

                    historicalTransfers.forEach((transfer, index) => {
                      const fromUserId = userIds[transfer.from];
                      const toUserId = userIds[transfer.to];

                      histStmt.run(
                        transfer.id,
                        fromUserId,
                        toUserId,
                        transfer.amount,
                        transfer.timestamp,
                        (err) => {
                          if (!err) {
                            insertedCount++;
                          }

                          if (index === historicalTransfers.length - 1) {
                            histStmt.finalize(() => {
                              db.close(() => {
                                console.log(
                                  `Created ${insertedCount} historical transfers`,
                                );
                                console.log("\nDatabase seeded successfully!");
                                console.log(
                                  `Created ${sampleUsers.length} users and ${transfers.length + insertedCount} total transfers`,
                                );
                              });
                            });
                          }
                        },
                      );
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
