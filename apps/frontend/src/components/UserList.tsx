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
    <div className="bg-surface rounded-3xl p-6">
      <h2 className="title-lg-semibold text-emphasis mb-6">All Users</h2>
      
      <div className="flex gap-6 mb-6 p-4 bg-surfaceTwo rounded-xl">
        <div className="flex flex-col">
          <span className="body-sm-normal text-secondary">Total Users:</span>
          <span className="title-base-semibold text-primary">{users.length}</span>
        </div>
        <div className="flex flex-col">
          <span className="body-sm-normal text-secondary">Total µPatrons:</span>
          <span className="title-base-semibold text-primary">{formatWithDollars(totalBalance)}</span>
        </div>
      </div>

      <input
        type="text"
        placeholder="Filter users..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full px-4 py-3 mb-6 bg-background border border-subtle rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
      />

      {loading && <div className="text-center py-8 body-base-normal text-secondary">Loading users...</div>}
      {error && <div className="text-center py-8 body-base-normal text-negative">{error}</div>}
      
      {!loading && !error && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 max-h-[600px] overflow-y-auto">
          {filteredUsers.map((user) => (
            <div key={user.id} className="bg-surfaceTwo border border-subtle rounded-2xl p-4 hover:border-subtle-hover hover:shadow-sm transition-all">
              <h3 className="body-base-semibold text-emphasis mb-1">{user.username}</h3>
              <p className="body-sm-normal text-primary">{formatWithDollars(user.balance)}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
