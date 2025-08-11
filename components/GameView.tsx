'use client';

import React, { useState } from 'react';
import { Game, Player } from '../types/game';

interface GameViewProps {
  game: Game;
  currentPlayer: Player | undefined;
  timeLeft: number;
  onSubmitAnswer: (answer: string) => Promise<{ success: boolean; error?: string }>;
  onPlaceBet: (action: 'fold' | 'call' | 'raise' | 'all-in', amount?: number) => Promise<{ success: boolean; error?: string }>;
  onAdvancePhase: () => Promise<void>;
  isHost: boolean;
  canChangeAnswer: boolean;
}

export default function GameView({
  game,
  currentPlayer,
  timeLeft,
  onSubmitAnswer,
  onPlaceBet,
  onAdvancePhase,
  isHost,
  canChangeAnswer
}: GameViewProps) {
  const [answer, setAnswer] = useState('');
  const [betAmount, setBetAmount] = useState(game.bigBlind);
  const [showBetInput, setShowBetInput] = useState(false);

  const handleSubmitAnswer = async () => {
    if (!answer.trim()) return;
    
    const result = await onSubmitAnswer(answer.trim());
    if (result.success) {
      // Answer submitted successfully
    }
  };

  const handleBet = async (action: 'fold' | 'call' | 'raise' | 'all-in') => {
    if (action === 'raise') {
      setShowBetInput(true);
      return;
    }
    
    const result = await onPlaceBet(action, action === 'raise' ? betAmount : undefined);
    if (result.success) {
      setShowBetInput(false);
    }
  };

  const handleRaise = async () => {
    const result = await onPlaceBet('raise', betAmount);
    if (result.success) {
      setShowBetInput(false);
    }
  };

  const getPhaseTitle = () => {
    switch (game.phase) {
      case 'start': return 'Venter på start';
      case 'opening': return 'Spillet starter snart...';
      case 'question': return 'Svar på spørsmålet';
      case 'hint1': return 'Første hint';
      case 'hint2': return 'Andre hint';
      case 'hint3': return 'Tredje hint';
      case 'reveal': return 'Svaret avsløres';
      case 'elimination': return 'Eliminering';
      default: return game.phase;
    }
  };

  const getCurrentHint = () => {
    if (!game.currentHints || game.currentHintIndex === undefined) return null;
    return game.currentHints[game.currentHintIndex];
  };

  const canBet = () => {
    return ['hint1', 'hint2', 'hint3'].includes(game.phase) && 
           currentPlayer && 
           !currentPlayer.hasFolded && 
           !currentPlayer.isAllIn;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-green-800 to-green-900 text-white">
      {/* Header */}
      <div className="bg-black/30 p-4 border-b border-yellow-500/30">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-yellow-400">Quizino</h1>
            <p className="text-sm text-gray-300">Runde {game.currentRound}</p>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold">{getPhaseTitle()}</div>
            {timeLeft > 0 && (
              <div className="text-2xl font-bold text-yellow-400">{timeLeft}s</div>
            )}
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-300">Pot</div>
            <div className="text-xl font-bold text-yellow-400">{game.pot} Q</div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-4">
        {/* Category and Question */}
        {game.selectedCategory && (
          <div className="bg-black/40 rounded-lg p-6 mb-6 border border-yellow-500/30">
            <div className="text-center">
              <div className="text-sm text-yellow-400 mb-2">Kategori</div>
              <div className="text-lg font-semibold mb-4 capitalize">{game.selectedCategory}</div>
              
              {game.currentQuestion && (
                <div className="bg-black/30 rounded-lg p-4 mb-4">
                  <div className="text-xl font-medium">{game.currentQuestion}</div>
                </div>
              )}

              {/* Hint Display */}
              {game.phase.startsWith('hint') && getCurrentHint() && (
                <div className="bg-blue-900/30 rounded-lg p-4 border border-blue-400/30">
                  <div className="text-sm text-blue-300 mb-1">Hint {game.currentHintIndex + 1}</div>
                  <div className="text-lg text-blue-100">{getCurrentHint()}</div>
                </div>
              )}

              {/* Answer Reveal */}
              {game.phase === 'reveal' && game.currentAnswer && (
                <div className="bg-green-900/30 rounded-lg p-4 border border-green-400/30">
                  <div className="text-sm text-green-300 mb-1">Riktig svar</div>
                  <div className="text-xl font-bold text-green-100">{game.currentAnswer}</div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Answer Input */}
        {canChangeAnswer && (
          <div className="bg-black/40 rounded-lg p-6 mb-6 border border-yellow-500/30">
            <div className="text-center">
              <div className="text-lg font-semibold mb-4">Ditt svar</div>
              <div className="flex gap-4 max-w-md mx-auto">
                <input
                  type="text"
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  placeholder="Skriv ditt svar..."
                  className="flex-1 px-4 py-2 bg-black/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-yellow-500 focus:outline-none"
                  onKeyPress={(e) => e.key === 'Enter' && handleSubmitAnswer()}
                />
                <button
                  onClick={handleSubmitAnswer}
                  disabled={!answer.trim()}
                  className="px-6 py-2 bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg font-semibold transition-colors"
                >
                  Send
                </button>
              </div>
              {currentPlayer?.currentAnswer && (
                <div className="mt-4 text-green-400">
                  Ditt svar: <span className="font-semibold">{currentPlayer.currentAnswer}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Betting Controls */}
        {canBet() && (
          <div className="bg-black/40 rounded-lg p-6 mb-6 border border-yellow-500/30">
            <div className="text-center">
              <div className="text-lg font-semibold mb-4">Betting</div>
              {!showBetInput ? (
                <div className="flex gap-4 justify-center flex-wrap">
                  <button
                    onClick={() => handleBet('fold')}
                    className="px-6 py-2 bg-red-600 hover:bg-red-700 rounded-lg font-semibold transition-colors"
                  >
                    Fold
                  </button>
                  <button
                    onClick={() => handleBet('call')}
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition-colors"
                  >
                    Call ({game.bigBlind} Q)
                  </button>
                  <button
                    onClick={() => handleBet('raise')}
                    className="px-6 py-2 bg-green-600 hover:bg-green-700 rounded-lg font-semibold transition-colors"
                  >
                    Raise
                  </button>
                  <button
                    onClick={() => handleBet('all-in')}
                    className="px-6 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg font-semibold transition-colors"
                  >
                    All-in
                  </button>
                </div>
              ) : (
                <div className="flex gap-4 justify-center items-center">
                  <input
                    type="number"
                    value={betAmount}
                    onChange={(e) => setBetAmount(parseInt(e.target.value) || 0)}
                    min={game.bigBlind}
                    max={currentPlayer?.quizinos || 0}
                    className="w-24 px-3 py-2 bg-black/50 border border-gray-600 rounded-lg text-white focus:border-yellow-500 focus:outline-none"
                  />
                  <button
                    onClick={handleRaise}
                    className="px-6 py-2 bg-green-600 hover:bg-green-700 rounded-lg font-semibold transition-colors"
                  >
                    Raise
                  </button>
                  <button
                    onClick={() => setShowBetInput(false)}
                    className="px-6 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg font-semibold transition-colors"
                  >
                    Avbryt
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Players Table */}
        <div className="bg-black/40 rounded-lg p-6 border border-yellow-500/30">
          <div className="text-lg font-semibold mb-4 text-center">Spillere</div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {game.players.map((player, index) => (
              <div
                key={player.uid}
                className={`bg-black/30 rounded-lg p-4 border ${
                  player.hasFolded 
                    ? 'border-red-500/30 opacity-50' 
                    : player.uid === currentPlayer?.uid
                    ? 'border-yellow-500 bg-yellow-500/10'
                    : 'border-gray-600'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <div className="font-semibold">{player.name}</div>
                    {index === 0 && (
                      <div className="text-xs text-yellow-400">Host</div>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="text-yellow-400 font-bold">{player.quizinos} Q</div>
                    {player.currentBet && player.currentBet > 0 && (
                      <div className="text-sm text-green-400">Bet: {player.currentBet}</div>
                    )}
                  </div>
                </div>
                
                <div className="flex gap-2 text-xs">
                  {player.currentAnswer && (
                    <span className="bg-green-600/30 px-2 py-1 rounded">Svart</span>
                  )}
                  {player.hasFolded && (
                    <span className="bg-red-600/30 px-2 py-1 rounded">Foldet</span>
                  )}
                  {player.isAllIn && (
                    <span className="bg-purple-600/30 px-2 py-1 rounded">All-in</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Host Controls */}
        {isHost && (
          <div className="bg-black/40 rounded-lg p-6 mt-6 border border-yellow-500/30">
            <div className="text-center">
              <div className="text-lg font-semibold mb-4">Host-kontroller</div>
              <button
                onClick={onAdvancePhase}
                className="px-6 py-2 bg-yellow-600 hover:bg-yellow-700 rounded-lg font-semibold transition-colors"
              >
                Neste fase
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

