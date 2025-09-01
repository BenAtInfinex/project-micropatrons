import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { api } from '../api/api';
import { formatWithDollars } from '../utils/formatters';

interface UserListProps {
  refreshTrigger: number;
}

export const UserList: React.FC<UserListProps> = ({ refreshTrigger }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchUsers();
  }, [refreshTrigger]);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const results = await api.getUsers();
      setUsers(results);
    } catch (err) {
      setError('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user =>
    user.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalBalance = users.reduce((sum, user) => sum + user.balance, 0);

  return (
    <div className="user-list">
      <h2>All Users</h2>
      
      <div className="stats">
        <div className="stat-item">
          <span className="stat-label">Total Users:</span>
          <span className="stat-value">{users.length}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Total µPatrons:</span>
          <span className="stat-value">{formatWithDollars(totalBalance)}</span>
        </div>
      </div>

      <input
        type="text"
        placeholder="Filter users..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="filter-input"
      />

      {loading && <div className="loading">Loading users...</div>}
      {error && <div className="error">{error}</div>}
      
      {!loading && !error && (
        <div className="users-grid">
          {filteredUsers.map((user) => (
            <div key={user.id} className="user-card">
              <h3>{user.username}</h3>
              <p className="balance">{formatWithDollars(user.balance)}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
