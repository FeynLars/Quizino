'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function JoinLobbyForm() {
  const [lobbyId, setLobbyId] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const router = useRouter();

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedId = lobbyId.trim().toUpperCase();
    
    if (trimmedId.length < 3) {
      alert('Please enter a valid lobby ID (at least 3 characters)');
      return;
    }

    setIsJoining(true);
    setTimeout(() => {
      router.push(`/lobby/${trimmedId}`);
    }, 500);
  };

  return (
    <form onSubmit={handleJoin} className="flex space-x-2">
      <input
        type="text"
        placeholder="Enter Lobby ID"
        value={lobbyId}
        onChange={(e) => setLobbyId(e.target.value)}
        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
        disabled={isJoining}
      />
      <button 
        type="submit"
        disabled={isJoining || !lobbyId.trim()}
        className="bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isJoining ? (
          <div className="flex items-center space-x-1">
            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
            <span>Joining...</span>
          </div>
        ) : (
          'Join'
        )}
      </button>
    </form>
  );
} 