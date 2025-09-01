import { useState } from "react";
import { Skeleton, SkeletonText } from "@infinex/ui/components";
import { useUsers } from "../hooks/queries";
import { formatWithDollars } from "../utils/formatters";
import { PersonIcon } from "@infinex/ui/icons";

interface UserListProps {
  refreshTrigger?: number; // Keep for compatibility but not used with TanStack Query
}

export const UserList: React.FC<UserListProps> = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const { data: users = [], isLoading, error } = useUsers();

  const filteredUsers = users.filter((user) =>
    user.username.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const totalBalance = users.reduce((sum, user) => sum + user.balance, 0);

  return (
    <div className="bg-surface rounded-3xl p-6">
      <div className="flex items-center gap-2 mb-6">
        <PersonIcon />
        <h2 className="title-lg-semibold text-emphasis">All Users</h2>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-surfaceTwo rounded-xl">
        <div className="flex flex-col items-center">
          <span className="body-xs-normal text-secondary">Total Users</span>
          {isLoading ? (
            <Skeleton className="mt-1">
              <SkeletonText size="base" width={0.6} />
            </Skeleton>
          ) : (
            <span className="title-base-semibold text-primary">
              {users.length}
            </span>
          )}
        </div>
        <div className="flex flex-col items-center">
          <span className="body-xs-normal text-secondary">Total µPatrons</span>
          {isLoading ? (
            <Skeleton className="mt-1">
              <SkeletonText size="base" width={0.8} />
            </Skeleton>
          ) : (
            <span className="title-base-semibold text-primary">
              {formatWithDollars(totalBalance)}
            </span>
          )}
        </div>
      </div>

      <div className="relative mb-6">
        <input
          type="text"
          placeholder="Search users..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-3 pl-10 bg-background border border-subtle rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
          disabled={isLoading}
        />
        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary">
          🔍
        </span>
      </div>

      {error && (
        <div className="text-center py-8 body-base-normal text-critical">
          Failed to fetch users
        </div>
      )}

              <div className="space-y-2 max-h-[400px] overflow-y-auto">
        {isLoading ? (
          // Skeleton loading state
          Array.from({ length: 8 }).map((_, index) => (
            <div
              key={index}
              className="bg-surfaceTwo border border-subtle rounded-xl p-3"
            >
              <div className="flex items-center justify-between">
                <Skeleton>
                  <SkeletonText size="sm" width={[0.4, 0.7]} />
                </Skeleton>
                <Skeleton>
                  <SkeletonText size="xs" width={0.3} />
                </Skeleton>
              </div>
            </div>
          ))
        ) : (
          <>
            {filteredUsers.map((user) => (
              <div
                key={user.id}
                className="bg-surfaceTwo border border-subtle rounded-xl p-3 hover:border-subtle-hover hover:shadow-sm transition-all"
              >
                <div className="flex items-center justify-between">
                  <h3 className="body-sm-semibold text-emphasis truncate">
                    {user.username}
                  </h3>
                  <span className="body-xs-normal text-primary font-mono">
                    {formatWithDollars(user.balance)}
                  </span>
                </div>
              </div>
            ))}

            {filteredUsers.length === 0 && searchTerm && (
              <div className="text-center py-8 body-sm-normal text-secondary italic">
                No users found matching "{searchTerm}"
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
