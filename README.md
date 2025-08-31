# 💰 Micropatrons

A simple single-page application (SPA) for transferring virtual currency (micropatrons) between users. Built with TypeScript, React, Express, and SQLite.

## 🚀 Features

- **User Balance Tracking**: Each user starts with 200,000 micropatrons
- **UUID-based User IDs**: Secure unique identifiers for all users
- **Activity History**: Complete transaction log with timestamps
- **Real-time Search**: Search for users by username with autocomplete
- **Instant Transfers**: Transfer micropatrons between users with validation
- **Live Updates**: See updated balances and activity immediately after transfers
- **Beautiful UI**: Modern, responsive design with smooth animations

## 📋 Prerequisites

- Node.js (v14 or higher)
- npm

## 🛠️ Quick Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd project-micropatrons
   ```

2. **Install all dependencies and seed the database**
   ```bash
   npm run setup
   ```

   This single command will:
   - Install root dependencies
   - Install backend dependencies
   - Install frontend dependencies
   - Seed the database with 20 sample users

3. **Start the application**
   ```bash
   npm start
   ```

   This will run both the backend (on port 5000) and frontend (on port 3000) concurrently.

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
project-micropatrons/
├── backend/                 # Express TypeScript API
│   ├── src/
│   │   ├── server.ts       # Main server file
│   │   └── seed.ts         # Database seeding script
│   ├── micropatrons.db     # SQLite database (created after seeding)
│   └── package.json
├── frontend/               # React TypeScript SPA
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── api/           # API service
│   │   └── types.ts       # TypeScript interfaces
│   └── package.json
├── package.json           # Root package with convenience scripts
└── README.md
```

## 📜 Available Scripts

### Root Level
- `npm run setup` - One-time setup: installs all dependencies and seeds database
- `npm start` or `npm run dev` - Starts both backend and frontend
- `npm run install-all` - Installs dependencies for all packages
- `npm run seed` - Seeds the database with sample users

### Backend
- `npm run dev` - Starts backend with hot reload
- `npm run build` - Compiles TypeScript to JavaScript
- `npm run start` - Runs compiled JavaScript

### Frontend
- `npm start` - Starts React development server
- `npm run build` - Creates production build

## 🎮 How to Use

1. **Search for Users**: Use the search fields to find users by typing their username
2. **Select Sender**: Choose who will send micropatrons
3. **Select Receiver**: Choose who will receive micropatrons
4. **Enter Amount**: Specify how many micropatrons to transfer
5. **Transfer**: Click the Transfer button to complete the transaction

## 💾 Database Schema

### Users Table
```sql
CREATE TABLE users (
  id TEXT PRIMARY KEY,              -- UUID
  username TEXT UNIQUE NOT NULL,
  balance INTEGER NOT NULL DEFAULT 200000,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
```

### Activity Table
```sql
CREATE TABLE activity (
  id TEXT PRIMARY KEY,              -- UUID
  from_user_id TEXT NOT NULL,
  to_user_id TEXT NOT NULL,
  amount INTEGER NOT NULL,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (from_user_id) REFERENCES users(id),
  FOREIGN KEY (to_user_id) REFERENCES users(id)
)
```

## 🔧 API Endpoints

- `GET /api/users?search={query}` - Get all users or search by username
- `GET /api/users/:username` - Get a specific user
- `GET /api/activity?limit={n}&offset={n}` - Get recent activity (default limit: 50)
- `GET /api/users/:username/activity?limit={n}&offset={n}` - Get activity for a specific user
- `POST /api/transfer` - Transfer micropatrons between users
  ```json
  {
    "sender": "username1",
    "receiver": "username2",
    "amount": 1000
  }
  ```

## 🧪 Sample Data

The seed script creates:
- 20 users with usernames from 'alice' to 'tina', each starting with 200,000 micropatrons
- 5 sample transfers to demonstrate the activity history:
  - alice → bob: 1,000 micropatrons
  - bob → charlie: 500 micropatrons
  - charlie → diana: 2,000 micropatrons
  - diana → edward: 1,500 micropatrons
  - edward → alice: 3,000 micropatrons

## 🛡️ Validation Rules

- All fields are required for transfers
- Amount must be greater than 0
- Amount must be a whole number
- Cannot transfer to yourself
- Sender must have sufficient balance
- Both sender and receiver must exist

## 🎨 Technologies Used

- **Frontend**: React, TypeScript, CSS3
- **Backend**: Express, TypeScript, Node.js
- **Database**: SQLite3
- **Development**: Concurrently, TSX, Nodemon

## 🤝 Contributing

Feel free to submit issues and enhancement requests!

## 📝 License

This project is open source and available under the MIT License.
