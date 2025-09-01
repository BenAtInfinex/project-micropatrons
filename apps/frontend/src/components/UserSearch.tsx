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
    <div className="user-search">
      {label && <label>{label}</label>}
      <div className="search-container">
        <input
          type="text"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setShowDropdown(true);
          }}
          onFocus={() => setShowDropdown(true)}
          placeholder={placeholder}
          className="search-input"
        />
        
        {showDropdown && search && (
          <div className="dropdown">
            {loading && <div className="dropdown-item">Loading...</div>}
            {error && <div className="dropdown-item error">{error}</div>}
            {!loading && !error && users.length === 0 && (
              <div className="dropdown-item">No users found</div>
            )}
            {!loading && !error && users.map((user) => (
              <div
                key={user.id}
                className="dropdown-item"
                onClick={() => handleSelect(user.username)}
              >
                <span className="username">{user.username}</span>
                <span className="balance">{formatMicropatrons(user.balance)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
