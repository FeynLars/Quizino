'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useGameEngine } from '../hooks/useGameEngine';
import { useAuthContext } from '../contexts/AuthContext';
import GameView from './GameView';

interface GameClientProps {
  gameId: string;
  lobbyId: string;
}

export default function GameClient({ gameId, lobbyId }: GameClientProps) {
  const { user } = useAuthContext();
  const router = useRouter();
  
  const {
    game,
    loading,
    error,
    timeLeft,
    submitAnswer,
    placeBet,
    advancePhase,
    currentPlayer,
    canChangeAnswer,
    isHost
  } = useGameEngine({ gameId, lobbyId });

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
  }, [user, router]);

  useEffect(() => {
    // Redirect back to lobby if game ends or is not found
    if (error && error.includes('ikke funnet')) {
      router.push(`/lobby/${lobbyId}`);
    }
  }, [error, router, lobbyId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-900 via-green-800 to-green-900 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto mb-4"></div>
          <div className="text-lg">Laster spill...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-900 via-green-800 to-green-900 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="text-red-400 text-lg mb-4">Feil: {error}</div>
          <button
            onClick={() => router.push(`/lobby/${lobbyId}`)}
            className="px-6 py-2 bg-yellow-600 hover:bg-yellow-700 rounded-lg font-semibold transition-colors"
          >
            Tilbake til lobby
          </button>
        </div>
      </div>
    );
  }

  if (!game) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-900 via-green-800 to-green-900 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="text-lg mb-4">Spill ikke funnet</div>
          <button
            onClick={() => router.push(`/lobby/${lobbyId}`)}
            className="px-6 py-2 bg-yellow-600 hover:bg-yellow-700 rounded-lg font-semibold transition-colors"
          >
            Tilbake til lobby
          </button>
        </div>
      </div>
    );
  }

  return (
    <GameView
      game={game}
      currentPlayer={currentPlayer}
      timeLeft={timeLeft}
      onSubmitAnswer={submitAnswer}
      onPlaceBet={placeBet}
      onAdvancePhase={advancePhase}
      isHost={isHost}
      canChangeAnswer={canChangeAnswer}
    />
  );
}

