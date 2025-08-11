// components/StartGameButton.tsx
'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/firebase';
import {
  doc,
  writeBatch,
  serverTimestamp,
} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

function generateLobbyId(len = 6) {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // uten lett forvekslbare tegn
  let out = '';
  for (let i = 0; i < len; i++) out += alphabet[Math.floor(Math.random() * alphabet.length)];
  return out;
}

export default function StartGameButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleCreate = useCallback(async () => {
    if (loading) return;

    setLoading(true);
    const lobbyId = generateLobbyId(6);
    console.log('[StartGameButton] creating lobby/game with id:', lobbyId);

    try {
      const auth = getAuth();
      const user = auth.currentUser;

      const host = {
        uid: user?.uid ?? 'anon',
        name: user?.displayName ?? 'Host',
        score: 0,
        quizinos: 1000,
        currentBet: 0,
        hasFolded: false,
        ready: true,
        currentAnswer: '',
        joinedAt: serverTimestamp(),
        isHost: true,
      };

      const batch = writeBatch(db);
      const lobbyRef = doc(db, 'lobbies', lobbyId);
      const gameRef = doc(db, 'games', lobbyId);

      // 1) Lobby-doc
      batch.set(lobbyRef, {
        createdAt: serverTimestamp(),
        status: 'waiting',
        maxPlayers: 8,
        users: [host],
      });

      // 2) Game-doc (matcher det GameClient/useGameEngine vanligvis forventer)
      batch.set(gameRef, {
        id: lobbyId,
        lobbyId,
        phase: 'opening',
        createdAt: serverTimestamp(),
        lastBlindIncrease: serverTimestamp(),
        currentRound: 1,
        currentPlayerIndex: 0,
        currentHintIndex: 0,
        blindLevel: 1,
        bigBlind: 20,
        players: [host],
        // trygge default-felter så typer/hook ikke feiler:
        selectedCategory: '',
        currentQuestionId: '',
      });

      await batch.commit();
      console.log('[StartGameButton] batch committed for id:', lobbyId);

      router.push(`/game/${lobbyId}`);
    } catch (err) {
      console.error('[StartGameButton] failed to create:', err);
      alert('Kunne ikke opprette spill. Sjekk konsollen for detaljer.');
    } finally {
      setLoading(false);
    }
  }, [loading, router]);

  return (
    <button
      onClick={handleCreate}
      disabled={loading}
      className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
        loading
          ? 'bg-gray-400 text-white cursor-not-allowed'
          : 'bg-yellow-600 hover:bg-yellow-700 text-black'
      }`}
      aria-busy={loading}
    >
      {loading ? 'Oppretter…' : 'Create New Quiz'}
    </button>
  );
}
