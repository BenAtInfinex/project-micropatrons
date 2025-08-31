# Micropatrons Project Commands

# Default command - show available commands
default:
    @just --list

# Install all dependencies
install:
    pnpm install
    cd backend && pnpm install
    cd frontend && pnpm install

# Quick setup - install dependencies and seed database
setup:
    just install
    just seed

# Seed the database with sample users
seed:
    cd backend && pnpm run seed

# Start both backend and frontend in development mode
dev:
    pnpm run kill-ports
    pnpm run dev

# Kill processes on ports 3000 and 5000
kill-ports:
    pnpm run kill-ports

# Start backend only
backend:
    cd backend && pnpm run dev

# Start frontend only
frontend:
    cd frontend && pnpm start

# Build backend TypeScript
build-backend:
    cd backend && pnpm run build

# Build frontend for production
build-frontend:
    cd frontend && pnpm run build

# Build everything
build: build-backend build-frontend

# Clean all build artifacts and dependencies
clean:
    rm -rf node_modules
    rm -rf backend/node_modules backend/dist backend/*.db backend/*.db-journal
    rm -rf frontend/node_modules frontend/build

# Reset database (delete and reseed)
reset-db:
    rm -f backend/*.db backend/*.db-journal
    just seed

# View database in terminal (requires sqlite3)
db:
    sqlite3 backend/micropatrons.db

# Run a SQL query on the database
query sql:
    sqlite3 backend/micropatrons.db "{{sql}}"

# Show all users and their balances
users:
    @sqlite3 backend/micropatrons.db "SELECT username, printf('%,d', balance) as balance, substr(id, 1, 8) || '...' as id FROM users ORDER BY username;" -column -header

# Show total micropatrons in circulation
total:
    @sqlite3 backend/micropatrons.db "SELECT printf('%,d', SUM(balance)) as 'Total Micropatrons' FROM users;"

# Check a specific user's balance
balance username:
    @sqlite3 backend/micropatrons.db "SELECT username, printf('%,d', balance) as balance, id FROM users WHERE username = '{{username}}';" -column -header

# Show recent activity
activity:
    @sqlite3 backend/micropatrons.db "SELECT u1.username as 'From', u2.username as 'To', printf('%,d', a.amount) as 'Amount', datetime(a.timestamp, 'localtime') as 'Time' FROM activity a JOIN users u1 ON a.from_user_id = u1.id JOIN users u2 ON a.to_user_id = u2.id ORDER BY a.timestamp DESC LIMIT 20;" -column -header

# Show activity for a specific user
user-activity username:
    @sqlite3 backend/micropatrons.db "SELECT CASE WHEN u1.username = '{{username}}' THEN 'Sent to ' || u2.username ELSE 'Received from ' || u1.username END as 'Transfer', printf('%,d', a.amount) as 'Amount', datetime(a.timestamp, 'localtime') as 'Time' FROM activity a JOIN users u1 ON a.from_user_id = u1.id JOIN users u2 ON a.to_user_id = u2.id WHERE u1.username = '{{username}}' OR u2.username = '{{username}}' ORDER BY a.timestamp DESC LIMIT 20;" -column -header

# Open VS Code workspace
code:
    code micropatrons.code-workspace

# Git status
status:
    git status

# Create a new git commit
commit message:
    git add -A
    git commit -m "{{message}}"

# Check TypeScript types in backend
check-backend:
    cd backend && npx tsc --noEmit

# Check TypeScript types in frontend
check-frontend:
    cd frontend && npx tsc --noEmit

# Check all TypeScript types
check: check-backend check-frontend

# Show backend logs (if running)
logs-backend:
    tail -f backend/logs/*.log 2>/dev/null || echo "No log files found"

# Open database in DBeaver (Mac)
dbeaver-mac:
    open -a DBeaver backend/micropatrons.db

# Database connection info for DBeaver
db-info:
    @echo "DBeaver SQLite Connection Info:"
    @echo "================================"
    @echo "Database Type: SQLite"
    @echo "Database Path: $(pwd)/backend/micropatrons.db"
    @echo ""
    @echo "Steps to connect in DBeaver:"
    @echo "1. Click 'New Database Connection'"
    @echo "2. Select 'SQLite'"
    @echo "3. Click 'Browse' and navigate to:"
    @echo "   $(pwd)/backend/micropatrons.db"
    @echo "4. Click 'Test Connection' then 'OK'"
