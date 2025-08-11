// lib/lobby.ts

import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';
import { User } from 'firebase/auth';

export async function createLobbyInFirestore(lobbyId: string, user: User) {
  if (!user || !user.uid) {
    throw new Error('Missing user data');
  }

  const lobbyRef = doc(db, 'lobbies', lobbyId);

  await setDoc(lobbyRef, {
    id: lobbyId,
    createdAt: serverTimestamp(),
    host: {
      uid: user.uid,
      name: user.displayName ?? user.email ?? 'Unknown',
    },
    players: [
      {
        uid: user.uid,
        name: user.displayName ?? user.email ?? 'Unknown',
        chips: 1000, // 🚫 Ikke serverTimestamp() i array – dette er nå OK
      },
    ],
    status: 'waiting',
    bigBlind: 10,
    smallBlind: 5,
    round: 1,
  });
}
