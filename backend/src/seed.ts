import sqlite3 from 'sqlite3';
import path from 'path';
import crypto from 'crypto';

const db = new sqlite3.Database(path.join(__dirname, '..', 'micropatrons.db'));

// Sample usernames
const sampleUsers = [
  'alice',
  'bob',
  'charlie',
  'diana',
  'edward',
  'fiona',
  'george',
  'hannah',
  'ian',
  'julia',
  'kevin',
  'laura',
  'michael',
  'natalie',
  'oliver',
  'patricia',
  'quentin',
  'rachel',
  'samuel',
  'tina'
];

console.log('Seeding database...');

db.serialize(() => {
  // Create tables if they don't exist
  console.log('Creating tables...');
  
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
  db.run('DELETE FROM activity', (err) => {
    if (err) {
      console.error('Error clearing activity table:', err);
    }
    
    db.run('DELETE FROM users', (err) => {
      if (err) {
        console.error('Error clearing users table:', err);
        process.exit(1);
      }
      
      console.log('Cleared existing data');
      
      // Insert sample users with UUIDs
      const stmt = db.prepare('INSERT INTO users (id, username, balance) VALUES (?, ?, ?)');
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
              console.log('\nCreating sample transfers...');
              
              // Create some sample transfers
              const transfers = [
                { from: 'alice', to: 'bob', amount: 1000 },
                { from: 'bob', to: 'charlie', amount: 500 },
                { from: 'charlie', to: 'diana', amount: 2000 },
                { from: 'diana', to: 'edward', amount: 1500 },
                { from: 'edward', to: 'alice', amount: 3000 }
              ];
              
              const activityStmt = db.prepare('INSERT INTO activity (id, from_user_id, to_user_id, amount) VALUES (?, ?, ?, ?)');
              const updateStmt = db.prepare('UPDATE users SET balance = balance + ? WHERE id = ?');
              
              transfers.forEach((transfer, tIndex) => {
                const activityId = crypto.randomUUID();
                const fromUserId = userIds[transfer.from];
                const toUserId = userIds[transfer.to];
                
                // Create activity record
                activityStmt.run(activityId, fromUserId, toUserId, transfer.amount);
                
                // Update balances
                updateStmt.run(-transfer.amount, fromUserId);
                updateStmt.run(transfer.amount, toUserId);
                
                console.log(`Created transfer: ${transfer.from} → ${transfer.to}: ${transfer.amount} micropatrons`);
                
                if (tIndex === transfers.length - 1) {
                  activityStmt.finalize();
                  updateStmt.finalize(() => {
                    db.close(() => {
                      console.log('\nDatabase seeded successfully!');
                      console.log(`Created ${sampleUsers.length} users and ${transfers.length} sample transfers`);
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
