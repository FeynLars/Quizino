'use client';

import { useAuthContext } from '@/contexts/AuthContext';
import Image from 'next/image';

export default function UserProfile() {
  const { user, logout } = useAuthContext();

  const handleLogout = async () => {
    const result = await logout();
    if (!result.success) {
      console.error('Logout failed:', result.error);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex items-center space-x-4">
        {user.photoURL && (
          <Image
            className="h-12 w-12 rounded-full"
            src={user.photoURL}
            alt={user.displayName || 'User avatar'}
            width={48}
            height={48}
          />
        )}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">
            {user.displayName || 'Anonymous User'}
          </p>
          <p className="text-sm text-gray-500 truncate">
            {user.email}
          </p>
        </div>
        <button
          onClick={handleLogout}
          className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Sign out
        </button>
      </div>
      
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="text-sm text-gray-600">
          <p>Account created: {user.metadata.creationTime ? new Date(user.metadata.creationTime).toLocaleDateString() : 'Unknown'}</p>
          <p>Last sign in: {user.metadata.lastSignInTime ? new Date(user.metadata.lastSignInTime).toLocaleDateString() : 'Unknown'}</p>
        </div>
      </div>
    </div>
  );
} 