'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { db } from '../../lib/firebase'; // ✅ Riktig sti siden vi er i app/components
import { doc, writeBatch, serverTimestamp } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

export default function CreateLobbyButton() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const createLobby = useCallback(async () => {
    setLoading(true);
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) {
        alert('Du må være logget inn for å opprette en lobby.');
        setLoading(false);
        return;
      }

      const lobbyId = Math.random().toString(36).substring(2, 8).toUpperCase();
      const gameId = lobbyId; // Bruker samme ID for enkelhets skyld

      const batch = writeBatch(db);

      // Opprett lobby
      batch.set(doc(db, 'lobbies', lobbyId), {
        createdAt: serverTimestamp(),
        maxPlayers: 8,
        status: 'waiting',
        users: [
          {
            uid: user.uid,
            name: user.displayName || 'Ukjent spiller',
            isHost: true,
            ready: false,
            joinedAt: serverTimestamp(),
          },
        ],
      });

      // Opprett game
      batch.set(doc(db, 'games', gameId), {
        id: gameId,
        lobbyId: lobbyId,
        createdAt: serverTimestamp(),
        phase: 'opening',
        players: [],
        currentRound: 1,
        currentPlayerIndex: 0,
        currentHintIndex: 0,
        bigBlind: 100,
        blindLevel: 1,
        lastBlindIncrease: serverTimestamp(),
      });

      await batch.commit();

      router.push(`/game/${lobbyId}`);
    } catch (error) {
      console.error('Feil ved oppretting av lobby:', error);
      alert('Kunne ikke opprette lobby. Prøv igjen.');
    } finally {
      setLoading(false);
    }
  }, [router]);

  return (
    <button
      onClick={createLobby}
      disabled={loading}
      className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
    >
      {loading ? 'Oppretter...' : 'Opprett ny lobby'}
    </button>
  );
}
