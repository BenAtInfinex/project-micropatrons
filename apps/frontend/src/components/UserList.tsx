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
      <div className="flex items-center gap-2 mb-6">
        <span className="text-xl">👥</span>
        <h2 className="title-lg-semibold text-emphasis">All Users</h2>
      </div>
      
      <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-surfaceTwo rounded-xl">
        <div className="flex flex-col items-center">
          <span className="body-xs-normal text-secondary">Total Users</span>
          <span className="title-base-semibold text-primary">{users.length}</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="body-xs-normal text-secondary">Total µPatrons</span>
          <span className="title-base-semibold text-primary">{formatWithDollars(totalBalance)}</span>
        </div>
      </div>

      <div className="relative mb-6">
        <input
          type="text"
          placeholder="Search users..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-3 pl-10 bg-background border border-subtle rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
        />
        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary">🔍</span>
      </div>

      {loading && <div className="text-center py-8 body-base-normal text-secondary">Loading users...</div>}
      {error && <div className="text-center py-8 body-base-normal text-critical">{error}</div>}
      
      {!loading && !error && (
        <div className="space-y-2 max-h-[600px] overflow-y-auto">
          {filteredUsers.map((user) => (
            <div key={user.id} className="bg-surfaceTwo border border-subtle rounded-xl p-3 hover:border-subtle-hover hover:shadow-sm transition-all">
              <div className="flex items-center justify-between">
                <h3 className="body-sm-semibold text-emphasis truncate">{user.username}</h3>
                <span className="body-xs-normal text-primary font-mono">{formatWithDollars(user.balance)}</span>
              </div>
            </div>
          ))}
          
          {filteredUsers.length === 0 && searchTerm && (
            <div className="text-center py-8 body-sm-normal text-secondary italic">
              No users found matching "{searchTerm}"
            </div>
          )}
        </div>
      )}
    </div>
  );
};
