import { db } from './firebase';
import { doc, getDoc } from 'firebase/firestore';

export const fetchLobbyData = async (lobbyId: string) => {
  const lobbyRef = doc(db, 'lobbies', lobbyId);
  const lobbySnap = await getDoc(lobbyRef);
  if (lobbySnap.exists()) {
    return lobbySnap.data();
  }
  throw new Error('Lobby not found');
};
