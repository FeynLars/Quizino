'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthContext } from '@contexts/AuthContext';
import { useLobby } from '@hooks/useLobby';
import LobbyUserList from './LobbyUserList';
import LobbyControls from './LobbyControls';

interface LobbyClientProps {
  lobbyId: string;
}

export default function LobbyClient({ lobbyId }: LobbyClientProps) {
  const { user, loading: authLoading } = useAuthContext();
  const router = useRouter();
  const [hasJoined, setHasJoined] = useState(false);
  
  const {
    lobby,
    loading: lobbyLoading,
    error,
    joinLobby,
    leaveLobby,
    toggleReady,
    startGame,
    isHost,
    currentUser,
    allReady,
  } = useLobby(lobbyId);

  const handleJoinLobby = useCallback(async () => {
    if (!user) return;
    
    const result = await joinLobby();
    if (result.success) {
      setHasJoined(true);
    } else {
      console.error('Failed to join lobby:', result.error);
    }
  }, [user, joinLobby]);

  // Auto-join lobby when component mounts
  useEffect(() => {
    if (!authLoading && user && !hasJoined && !lobbyLoading) {
      handleJoinLobby();
    }
  }, [authLoading, user, hasJoined, lobbyLoading, handleJoinLobby]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/');
    }
  }, [authLoading, user, router]);

  const handleLeaveLobby = async () => {
    const result = await leaveLobby();
    if (result.success) {
      router.push('/');
    } else {
      console.error('Failed to leave lobby:', result.error);
    }
  };

  const handleToggleReady = async () => {
    const result = await toggleReady();
    if (!result.success) {
      console.error('Failed to toggle ready status:', result.error);
    }
  };

  const handleStartGame = async () => {
    const result = await startGame();
    if (result.success) {
      // Navigate to game page (you'll implement this later)
      router.push(`/game/${lobbyId}`);
    } else {
      console.error('Failed to start game:', result.error);
    }
  };

  if (authLoading || lobbyLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to home
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white shadow rounded-lg p-8 max-w-md w-full">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Error</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={() => router.push('/')}
              className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
            >
              Go Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!lobby) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white shadow rounded-lg p-8 max-w-md w-full">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Lobby Not Found</h2>
            <p className="text-gray-600 mb-6">The lobby you&apos;re looking for doesn&apos;t exist.</p>
            <button
              onClick={() => router.push('/')}
              className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
            >
              Go Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Quizino Lobby</h1>
              <p className="text-gray-600 mt-1">Lobby ID: {lobbyId}</p>
              <p className="text-sm text-gray-500 mt-1">
                {lobby.users.length} / {lobby.maxPlayers} players
              </p>
            </div>
            <div className="flex items-center space-x-4">
              {isHost && (
                <div className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">
                  Host
                </div>
              )}
              <button
                onClick={handleLeaveLobby}
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
              >
                Leave Lobby
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* User List */}
          <div className="lg:col-span-2">
            <LobbyUserList 
              users={lobby.users}
            />
          </div>

          {/* Controls */}
          <div className="lg:col-span-1">
            <LobbyControls
              currentUser={currentUser}
              isHost={isHost}
              allReady={allReady}
              onToggleReady={handleToggleReady}
              onStartGame={handleStartGame}
            />
          </div>
        </div>
      </div>
    </div>
  );
} 