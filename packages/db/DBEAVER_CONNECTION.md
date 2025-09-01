# DBeaver Database Connection Guide

## Database Location

The SQLite database is located at:
```
/Users/ben/Desktop/work/infinex/project-micropatrons/packages/db/micropatrons.db
```

## Important: Database Location Changed!

With the monorepo restructuring, the database is now located in `packages/db/` instead of the root directory. You need to update your DBeaver connection!

## Steps to Update DBeaver Connection

1. **Close any existing connections** to the old database in DBeaver

2. **Create a new connection** or update the existing one:
   - Right-click on your old connection and select "Edit Connection"
   - Or create a new SQLite connection

3. **Update the database path**:
   - Click "Browse" next to the Path field
   - Navigate to: `/Users/ben/Desktop/work/infinex/project-micropatrons/packages/db/`
   - Select `micropatrons.db`

4. **Test the connection** and click "OK"

## Verifying the Database Location

Run this command to see the exact database path:
```bash
cd /Users/ben/Desktop/work/infinex/project-micropatrons
npx turbo run db-info --filter=@infinex/micropatrons-db
```

## Common Issues

### "Database not updating after seed"
- Make sure DBeaver is connected to the correct database file in `packages/db/`
- The old database might still exist in the root directory - ignore it
- Click the refresh button in DBeaver after running seed

### "Tables not showing"
- Right-click on the database in DBeaver and select "Refresh"
- Check that the database file exists: `ls -la packages/db/micropatrons.db`

## Database Management Commands

```bash
# Check database location
npx turbo run db-info --filter=@infinex/micropatrons-db

# Reset database (delete it)
npx turbo run reset --filter=@infinex/micropatrons-db

# Seed with sample data
npx turbo run seed --filter=@infinex/micropatrons-db

# Reset and seed in one command
npx turbo run reset-and-seed --filter=@infinex/micropatrons-db
```

## SQL to Test Connection

Once connected, run this query to verify you're seeing the latest data:
```sql
SELECT COUNT(*) as user_count FROM users;
SELECT * FROM users WHERE username = 'Ben';
SELECT COUNT(*) as activity_count FROM activity;
```
