'use client';

import { LobbyUser } from '@/types/lobby';

interface LobbyControlsProps {
  currentUser: LobbyUser | undefined;
  isHost: boolean;
  allReady: boolean;
  onToggleReady: () => void;
  onStartGame: () => void;
}

export default function LobbyControls({
  currentUser,
  isHost,
  allReady,
  onToggleReady,
  onStartGame,
}: LobbyControlsProps) {
  if (!currentUser) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="text-center">
          <p className="text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Controls</h2>
      
      <div className="space-y-4">
        {/* Ready Toggle */}
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div>
            <h3 className="font-medium text-gray-900">Ready Status</h3>
            <p className="text-sm text-gray-500">
              {currentUser.ready ? 'You are ready to play!' : 'Click to mark yourself as ready'}
            </p>
          </div>
          <button
            onClick={onToggleReady}
            className={`px-4 py-2 rounded-md font-medium transition-colors ${
              currentUser.ready
                ? 'bg-green-600 text-white hover:bg-green-700'
                : 'bg-gray-600 text-white hover:bg-gray-700'
            }`}
          >
            {currentUser.ready ? 'Ready ✓' : 'Not Ready'}
          </button>
        </div>

        {/* Host Controls */}
        {isHost && (
          <div className="border-t pt-4">
            <h3 className="font-medium text-gray-900 mb-3">Host Controls</h3>
            
            <div className="space-y-3">
              {/* Start Game Button */}
              <button
                onClick={onStartGame}
                disabled={!allReady}
                className={`w-full py-3 px-4 rounded-md font-medium transition-colors ${
                  allReady
                    ? 'bg-green-600 text-white hover:bg-green-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {allReady ? 'Start Game 🎮' : 'Waiting for all players...'}
              </button>

              {/* Status Info */}
              <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
                <p className="font-medium mb-1">Game Start Requirements:</p>
                <ul className="space-y-1">
                  <li>• All players must be ready</li>
                  <li>• Minimum 2 players recommended</li>
                  <li>• Only host can start the game</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Player Info */}
        {!isHost && (
          <div className="border-t pt-4">
            <div className="text-sm text-gray-600 bg-yellow-50 p-3 rounded-lg">
              <p className="font-medium mb-1">Waiting for host to start...</p>
              <p>Make sure you&apos;re ready and the host will start the game when everyone is prepared!</p>
            </div>
          </div>
        )}

        {/* Game Info */}
        <div className="border-t pt-4">
          <h3 className="font-medium text-gray-900 mb-2">Game Info</h3>
          <div className="text-sm text-gray-600 space-y-1">
            <p>• Quizino is a multiplayer quiz game</p>
            <p>• Questions will appear one by one</p>
            <p>• Fastest correct answer wins points</p>
            <p>• Have fun and good luck! 🍀</p>
          </div>
        </div>
      </div>
    </div>
  );
} 