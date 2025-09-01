import express, { Request, Response } from "express";
import sqlite3 from "sqlite3";
import cors from "cors";
import path from "path";
import crypto from "crypto";

const app = express();
const PORT = process.env.PORT || 5173;

// Middleware
app.use(cors());
app.use(express.json());

// Types
interface User {
  id: string; // UUID
  username: string;
  balance: number;
  created_at: string;
}

interface Activity {
  id: string; // UUID
  from_user_id: string;
  to_user_id: string;
  amount: number;
  timestamp: string;
}

interface TransferRequest {
  sender: string;
  receiver: string;
  amount: number;
}

interface TransferResponse {
  success: boolean;
  message: string;
  sender?: User;
  receiver?: User;
  activity?: Activity;
}

// Database setup
const db = new sqlite3.Database(path.join(__dirname, "..", "micropatrons.db"));

// Create tables if they don't exist
db.serialize(() => {
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
});

// API Routes

// Get all users or search by username
app.get("/api/users", (req: Request, res: Response) => {
  const { search } = req.query;
  let query = "SELECT * FROM users";
  const params: string[] = [];

  if (search && typeof search === "string") {
    query += " WHERE username LIKE ?";
    params.push(`%${search}%`);
  }

  query += " ORDER BY username";

  db.all<User>(query, params, (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// Get a specific user by username
app.get("/api/users/:username", (req: Request, res: Response) => {
  const { username } = req.params;

  db.get<User>(
    "SELECT * FROM users WHERE username = ?",
    [username],
    (err, row) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (!row) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json(row);
    },
  );
});

// Transfer micropatrons between users
app.post(
  "/api/transfer",
  (req: Request<{}, {}, TransferRequest>, res: Response) => {
    const { sender, receiver, amount } = req.body;

    // Validate input
    if (!sender || !receiver || !amount) {
      return res
        .status(400)
        .json({ error: "Sender, receiver, and amount are required" });
    }

    if (amount <= 0) {
      return res.status(400).json({ error: "Amount must be greater than 0" });
    }

    if (!Number.isInteger(amount)) {
      return res.status(400).json({ error: "Amount must be a whole number" });
    }

    if (sender === receiver) {
      return res.status(400).json({ error: "Cannot transfer to yourself" });
    }

    // Start transaction
    db.serialize(() => {
      db.run("BEGIN TRANSACTION");

      // Check sender balance
      db.get<User>(
        "SELECT * FROM users WHERE username = ?",
        [sender],
        (err, senderRow) => {
          if (err) {
            db.run("ROLLBACK");
            return res.status(500).json({ error: err.message });
          }

          if (!senderRow) {
            db.run("ROLLBACK");
            return res.status(404).json({ error: "Sender not found" });
          }

          if (senderRow.balance < amount) {
            db.run("ROLLBACK");
            return res.status(400).json({ error: "Insufficient balance" });
          }

          // Check receiver exists
          db.get<User>(
            "SELECT * FROM users WHERE username = ?",
            [receiver],
            (err, receiverRow) => {
              if (err) {
                db.run("ROLLBACK");
                return res.status(500).json({ error: err.message });
              }

              if (!receiverRow) {
                db.run("ROLLBACK");
                return res.status(404).json({ error: "Receiver not found" });
              }

              // Create activity record
              const activityId = crypto.randomUUID();
              const activityTimestamp = new Date().toISOString();

              db.run(
                "INSERT INTO activity (id, from_user_id, to_user_id, amount, timestamp) VALUES (?, ?, ?, ?, ?)",
                [
                  activityId,
                  senderRow.id,
                  receiverRow.id,
                  amount,
                  activityTimestamp,
                ],
                function (err) {
                  if (err) {
                    db.run("ROLLBACK");
                    return res.status(500).json({ error: err.message });
                  }

                  // Update sender balance
                  db.run(
                    "UPDATE users SET balance = balance - ? WHERE id = ?",
                    [amount, senderRow.id],
                    function (err) {
                      if (err) {
                        db.run("ROLLBACK");
                        return res.status(500).json({ error: err.message });
                      }

                      // Update receiver balance
                      db.run(
                        "UPDATE users SET balance = balance + ? WHERE id = ?",
                        [amount, receiverRow.id],
                        function (err) {
                          if (err) {
                            db.run("ROLLBACK");
                            return res.status(500).json({ error: err.message });
                          }

                          // Commit transaction
                          db.run("COMMIT", (err) => {
                            if (err) {
                              return res
                                .status(500)
                                .json({ error: err.message });
                            }

                            // Get updated balances
                            db.all<User>(
                              "SELECT * FROM users WHERE username IN (?, ?)",
                              [sender, receiver],
                              (err, rows) => {
                                if (err) {
                                  return res
                                    .status(500)
                                    .json({ error: err.message });
                                }

                                const senderData = rows.find(
                                  (r) => r.username === sender,
                                );
                                const receiverData = rows.find(
                                  (r) => r.username === receiver,
                                );

                                const activity: Activity = {
                                  id: activityId,
                                  from_user_id: senderRow.id,
                                  to_user_id: receiverRow.id,
                                  amount: amount,
                                  timestamp: activityTimestamp,
                                };

                                const response: TransferResponse = {
                                  success: true,
                                  message: `Successfully transferred ${amount} micropatrons from ${sender} to ${receiver}`,
                                  sender: senderData,
                                  receiver: receiverData,
                                  activity: activity,
                                };

                                res.json(response);
                              },
                            );
                          });
                        },
                      );
                    },
                  );
                },
              );
            },
          );
        },
      );
    });
  },
);

// Get activity history
app.get("/api/activity", (req: Request, res: Response) => {
  const { limit = 50, offset = 0 } = req.query;

  const query = `
    SELECT 
      a.*,
      u1.username as from_username,
      u2.username as to_username
    FROM activity a
    JOIN users u1 ON a.from_user_id = u1.id
    JOIN users u2 ON a.to_user_id = u2.id
    ORDER BY a.timestamp DESC
    LIMIT ? OFFSET ?
  `;

  db.all(query, [Number(limit), Number(offset)], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// Get activity for a specific user
app.get("/api/users/:username/activity", (req: Request, res: Response) => {
  const { username } = req.params;
  const { limit = 50, offset = 0 } = req.query;

  const query = `
    SELECT 
      a.*,
      u1.username as from_username,
      u2.username as to_username,
      CASE 
        WHEN u1.username = ? THEN 'sent'
        ELSE 'received'
      END as type
    FROM activity a
    JOIN users u1 ON a.from_user_id = u1.id
    JOIN users u2 ON a.to_user_id = u2.id
    WHERE u1.username = ? OR u2.username = ?
    ORDER BY a.timestamp DESC
    LIMIT ? OFFSET ?
  `;

  db.all(
    query,
    [username, username, username, Number(limit), Number(offset)],
    (err, rows) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json(rows);
    },
  );
});

// Get activity statistics over time
app.get("/api/activity/stats", (req: Request, res: Response) => {
  const { days = 7 } = req.query;

  const query = `
    SELECT 
      DATE(timestamp) as date,
      COUNT(*) as transfers,
      SUM(amount) as volume
    FROM activity
    WHERE timestamp >= DATE('now', '-' || ? || ' days')
    GROUP BY DATE(timestamp)
    ORDER BY date ASC
  `;

  db.all(query, [Number(days)], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
