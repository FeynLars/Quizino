'use client';

import { useParams } from 'next/navigation';
import { useGameEngine } from '@/hooks/useGameEngine';
import React from 'react';
import GameClient from '@/components/GameClient';

export default function GamePage() {
  const params = useParams();
  const lobbyId = params?.lobbyId as string;

  const { game, loading, error } = useGameEngine({ gameId: lobbyId, lobbyId });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p>Laster spill...</p>
      </div>
    );
  }

  if (error || !game) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-100">
        <div className="bg-white p-8 rounded shadow text-center">
          <h2 className="text-2xl font-bold text-red-700">Feil</h2>
          <p className="text-gray-600 mt-2">{error || 'Spillet ble ikke funnet.'}</p>
        </div>
      </div>
    );
  }

  return (
    <GameClient
      gameId={game.id}
      lobbyId={game.lobbyId}
      initialPlayers={game.players}
    />
  );
}
