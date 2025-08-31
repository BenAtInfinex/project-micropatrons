# Connecting to Micropatrons Database in DBeaver

## Database Information
- **Database Type**: SQLite
- **Database File**: `backend/micropatrons.db`
- **Full Path**: `/Users/ben/Desktop/work/infinex/project-micropatrons/backend/micropatrons.db`

## Steps to Connect in DBeaver

### 1. Create New Connection
1. Open DBeaver
2. Click on the **"New Database Connection"** button (plug icon) or go to **Database → New Database Connection**

### 2. Select Database Type
1. In the connection wizard, select **SQLite**
2. Click **Next**

### 3. Configure Connection
1. In the **Path** field, click the **"Browse..."** button
2. Navigate to your project directory: `/Users/ben/Desktop/work/infinex/project-micropatrons/backend/`
3. Select the file `micropatrons.db`
4. The path should now show: `/Users/ben/Desktop/work/infinex/project-micropatrons/backend/micropatrons.db`

### 4. Test and Connect
1. Click **"Test Connection"** to verify the connection works
2. You should see "Connected" message
3. Click **"OK"** to save the connection

## Viewing Data

Once connected, you can:

1. **Browse Tables**:
   - Expand your connection in the Database Navigator
   - Expand "Tables"
   - You'll see the `users` table

2. **View User Data**:
   - Double-click on the `users` table
   - Or right-click → "View Data"

3. **Run Custom Queries**:
   - Right-click on the database → "SQL Editor" → "New SQL Editor"
   - Try these queries:

```sql
-- View all users and their balances
SELECT * FROM users ORDER BY username;

-- Check total micropatrons in circulation
SELECT SUM(balance) as total_micropatrons FROM users;

-- Find users with most micropatrons
SELECT username, balance 
FROM users 
ORDER BY balance DESC 
LIMIT 10;

-- Search for specific user
SELECT * FROM users WHERE username LIKE '%alice%';

-- View recent activity
SELECT 
    u1.username as sender,
    u2.username as receiver,
    a.amount,
    a.timestamp
FROM activity a
JOIN users u1 ON a.from_user_id = u1.id
JOIN users u2 ON a.to_user_id = u2.id
ORDER BY a.timestamp DESC
LIMIT 20;

-- View activity for a specific user
SELECT 
    CASE 
        WHEN u1.username = 'alice' THEN 'Sent to ' || u2.username
        ELSE 'Received from ' || u1.username
    END as transfer_type,
    a.amount,
    a.timestamp
FROM activity a
JOIN users u1 ON a.from_user_id = u1.id
JOIN users u2 ON a.to_user_id = u2.id
WHERE u1.username = 'alice' OR u2.username = 'alice'
ORDER BY a.timestamp DESC;

-- Get user balance history (net flow)
SELECT 
    username,
    balance as current_balance,
    (SELECT COALESCE(SUM(amount), 0) FROM activity WHERE to_user_id = users.id) as total_received,
    (SELECT COALESCE(SUM(amount), 0) FROM activity WHERE from_user_id = users.id) as total_sent
FROM users
ORDER BY username;
```

## Quick Access via Terminal

If you have the `just` command installed, you can also:

```bash
# Show database connection info
just db-info

# View all users in terminal
just users

# Check total micropatrons
just total

# Query specific user balance
just balance alice

# View recent activity
just activity

# View activity for a specific user
just user-activity alice
```

## Troubleshooting

1. **Database file not found**: Make sure you've run the seed script first:
   ```bash
   npm run seed
   # or
   just seed
   ```

2. **Permission denied**: Ensure you have read/write access to the database file

3. **Database locked**: Make sure the backend server can access the database. If you get locking errors, try stopping the backend server temporarily.

## Database Schema

### Users Table
- `id` (TEXT PRIMARY KEY) - UUID
- `username` (TEXT UNIQUE NOT NULL)
- `balance` (INTEGER NOT NULL DEFAULT 200000)
- `created_at` (TIMESTAMP DEFAULT CURRENT_TIMESTAMP)

### Activity Table
- `id` (TEXT PRIMARY KEY) - UUID
- `from_user_id` (TEXT NOT NULL) - Foreign key to users.id
- `to_user_id` (TEXT NOT NULL) - Foreign key to users.id
- `amount` (INTEGER NOT NULL)
- `timestamp` (TIMESTAMP DEFAULT CURRENT_TIMESTAMP)
