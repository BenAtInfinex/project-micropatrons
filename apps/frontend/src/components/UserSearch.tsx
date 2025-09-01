import { useState, useEffect } from "react";
import { useUsers } from "../hooks/queries";
import { Skeleton, SkeletonText } from "@infinex/ui/components";
import { formatMicropatrons } from "../utils/formatters";

interface UserSearchProps {
  onUserSelect: (username: string) => void;
  placeholder?: string;
  label?: string;
  currentValue?: string;
}

export const UserSearch: React.FC<UserSearchProps> = ({
  onUserSelect,
  placeholder = "Search users...",
  label,
  currentValue = "",
}) => {
  const [search, setSearch] = useState(currentValue);
  const [debouncedSearch, setDebouncedSearch] = useState(currentValue);
  const [showDropdown, setShowDropdown] = useState(false);

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);

    return () => clearTimeout(timer);
  }, [search]);

  // Use TanStack Query to fetch users with search
  const {
    data: users = [],
    isLoading,
    error,
  } = useUsers(debouncedSearch.trim() || undefined);

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
      {label && (
        <label className="body-sm-semibold text-emphasis block">{label}</label>
      )}
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
            {isLoading && (
              <>
                {Array.from({ length: 3 }).map((_, index) => (
                  <div
                    key={index}
                    className="px-4 py-3 flex justify-between items-center"
                  >
                    <Skeleton>
                      <SkeletonText size="base" width={[0.4, 0.7]} />
                    </Skeleton>
                    <Skeleton>
                      <SkeletonText size="sm" width={0.3} />
                    </Skeleton>
                  </div>
                ))}
              </>
            )}
            {error && (
              <div className="px-4 py-3 body-sm-normal text-negative">
                Failed to fetch users
              </div>
            )}
            {!isLoading && !error && users.length === 0 && debouncedSearch && (
              <div className="px-4 py-3 body-sm-normal text-secondary">
                No users found
              </div>
            )}
            {!isLoading &&
              !error &&
              users.map((user) => (
                <div
                  key={user.id}
                  className="px-4 py-3 hover:bg-surfaceTwo cursor-pointer transition-colors flex justify-between items-center"
                  onClick={() => handleSelect(user.username)}
                >
                  <span className="body-base-semibold text-emphasis">
                    {user.username}
                  </span>
                  <span className="body-sm-normal text-secondary">
                    {formatMicropatrons(user.balance)}
                  </span>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
};
