// components/GameEngine.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { useGameEngine } from '@hooks/useGameEngine';
import { useAuthContext } from '@contexts/AuthContext';
import { Player } from '@/types/game';

interface GameEngineProps {
  gameId: string;
  lobbyId: string;
  initialPlayers: Player[];
}

const GameEngine: React.FC<GameEngineProps> = ({ gameId, lobbyId, initialPlayers }) => {
  const { user } = useAuthContext();
  const [isInitialized, setIsInitialized] = useState(false);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [betAmount, setBetAmount] = useState(0);

  const {
    game,
    loading,
    error,
    initializeGame,
    submitAnswer,
    placeBet,
    currentPlayer,
    canChangeAnswer,
    isHost,
    startGame
  } = useGameEngine({ gameId, lobbyId });

  useEffect(() => {
    if (!isInitialized && !loading && !game) {
      initializeGame(lobbyId, initialPlayers);
      setIsInitialized(true);
    }
  }, [isInitialized, loading, game, initializeGame, lobbyId, initialPlayers]);

  if (loading) return <div>Laster...</div>;
  if (error) return <div>Feil: {error}</div>;
  if (!game) return <div>Spill ikke funnet</div>;

  return (
    <div>
      <h1>Quizino</h1>
      <p>Runde {game.currentRound} – Fase: {game.phase}</p>
      <p>Kategori: {game.selectedCategory}</p>
      
      {currentPlayer && <p>Du er: {currentPlayer.name}</p>}

      {isHost && (
        <button onClick={startGame}>Start Spill</button>
      )}
    </div>
  );
};

export default GameEngine;
