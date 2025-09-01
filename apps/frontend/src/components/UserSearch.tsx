import React, { useState, useEffect, useCallback } from 'react';
import { User } from '../types';
import { api } from '../api/api';
import { formatMicropatrons } from '../utils/formatters';

interface UserSearchProps {
  onUserSelect: (username: string) => void;
  placeholder?: string;
  label?: string;
  currentValue?: string;
}

export const UserSearch: React.FC<UserSearchProps> = ({ 
  onUserSelect, 
  placeholder = 'Search users...', 
  label,
  currentValue = ''
}) => {
  const [search, setSearch] = useState(currentValue);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = useCallback(async (searchTerm: string) => {
    if (!searchTerm.trim()) {
      setUsers([]);
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const results = await api.getUsers(searchTerm);
      setUsers(results);
    } catch (err) {
      setError('Failed to fetch users');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      fetchUsers(search);
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [search, fetchUsers]);

  useEffect(() => {
    setSearch(currentValue);
  }, [currentValue]);

  const handleSelect = (username: string) => {
    setSearch(username);
    onUserSelect(username);
    setShowDropdown(false);
  };

  return (
    <div className="space-y-2">
      {label && <label className="body-sm-semibold text-emphasis block">{label}</label>}
      <div className="relative">
        <input
          type="text"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setShowDropdown(true);
          }}
          onFocus={() => setShowDropdown(true)}
          onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
          placeholder={placeholder}
          className="w-full px-4 py-3 bg-background border border-subtle rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
        />
        
        {showDropdown && search && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-surface border border-subtle rounded-xl shadow-lg overflow-hidden z-10">
            {loading && (
              <div className="px-4 py-3 body-sm-normal text-secondary">Loading...</div>
            )}
            {error && (
              <div className="px-4 py-3 body-sm-normal text-negative">{error}</div>
            )}
            {!loading && !error && users.length === 0 && (
              <div className="px-4 py-3 body-sm-normal text-secondary">No users found</div>
            )}
            {!loading && !error && users.map((user) => (
              <div
                key={user.id}
                className="px-4 py-3 hover:bg-surfaceTwo cursor-pointer transition-colors flex justify-between items-center"
                onClick={() => handleSelect(user.username)}
              >
                <span className="body-base-semibold text-emphasis">{user.username}</span>
                <span className="body-sm-normal text-secondary">{formatMicropatrons(user.balance)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
