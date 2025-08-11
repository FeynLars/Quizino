'use client';

import { useState, useEffect } from 'react';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  onSnapshot,
  arrayUnion,
  arrayRemove,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuthContext } from '@/contexts/AuthContext';
import { Lobby, LobbyUser, LobbyData } from '@/types/lobby';

export function useLobby(lobbyId: string) {
  const [lobby, setLobby] = useState<Lobby | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuthContext();

  useEffect(() => {
    if (!db || !lobbyId) {
      setLoading(false);
      return;
    }

    const lobbyRef = doc(db, 'lobbies', lobbyId);

    const unsubscribe = onSnapshot(
      lobbyRef,
      (doc) => {
        if (doc.exists()) {
          const data = doc.data() as LobbyData;
          const lobbyData: Lobby = {
            id: doc.id,
            users: data.users || [],
            createdAt: data.createdAt?.toMillis() || Date.now(),
            status: data.status || 'waiting',
            maxPlayers: data.maxPlayers || 8,
          };
          setLobby(lobbyData);
        } else {
          setLobby(null);
        }
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching lobby:', err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [lobbyId]);

  const joinLobby = async () => {
    if (!db || !user || !lobbyId) {
      return { success: false, error: 'Missing required data' };
    }

    try {
      const lobbyRef = doc(db, 'lobbies', lobbyId);
      const lobbyDoc = await getDoc(lobbyRef);

      if (!lobbyDoc.exists()) {
        // Create new lobby
        const newUser: LobbyUser = {
          uid: user.uid,
          name: user.displayName || user.email || 'Anonymous',
          ready: false,
          isHost: true,
          joinedAt: Date.now(),
        };

        await setDoc(lobbyRef, {
          users: [newUser],
          createdAt: serverTimestamp(),
          status: 'waiting',
          maxPlayers: 8,
        });
      } else {
        // Join existing lobby
        const data = lobbyDoc.data() as LobbyData;
        const existingUser = data.users?.find(u => u.uid === user.uid);

        if (existingUser) {
          return { success: true, message: 'Already in lobby' };
        }

        if (data.users?.length >= (data.maxPlayers || 8)) {
          return { success: false, error: 'Lobby is full' };
        }

        const newUser: LobbyUser = {
          uid: user.uid,
          name: user.displayName || user.email || 'Anonymous',
          ready: false,
          isHost: data.users?.length === 0,
          joinedAt: Date.now(),
        };

        await updateDoc(lobbyRef, {
          users: arrayUnion(newUser),
        });
      }

      return { success: true };
    } catch (err: any) {
      console.error('Error joining lobby:', err);
      return { success: false, error: err.message };
    }
  };

  const leaveLobby = async () => {
    if (!db || !user || !lobbyId) {
      return { success: false, error: 'Missing required data' };
    }

    try {
      const lobbyRef = doc(db, 'lobbies', lobbyId);
      const lobbyDoc = await getDoc(lobbyRef);

      if (!lobbyDoc.exists()) {
        return { success: false, error: 'Lobby not found' };
      }

      const data = lobbyDoc.data() as LobbyData;
      const currentUser = data.users?.find(u => u.uid === user.uid);

      if (!currentUser) {
        return { success: false, error: 'User not in lobby' };
      }

      // Remove user from lobby
      await updateDoc(lobbyRef, {
        users: arrayRemove(currentUser),
      });

      // If no users left, delete the lobby
      if (data.users?.length === 1) {
        await setDoc(lobbyRef, { users: [] });
      }

      return { success: true };
    } catch (err: any) {
      console.error('Error leaving lobby:', err);
      return { success: false, error: err.message };
    }
  };

  const toggleReady = async () => {
    if (!db || !user || !lobbyId || !lobby) {
      return { success: false, error: 'Missing required data' };
    }

    try {
      const lobbyRef = doc(db, 'lobbies', lobbyId);
      const currentUser = lobby.users.find(u => u.uid === user.uid);

      if (!currentUser) {
        return { success: false, error: 'User not in lobby' };
      }

      const updatedUser: LobbyUser = {
        ...currentUser,
        ready: !currentUser.ready,
      };

      await updateDoc(lobbyRef, {
        users: arrayRemove(currentUser),
      });

      await updateDoc(lobbyRef, {
        users: arrayUnion(updatedUser),
      });

      return { success: true };
    } catch (err: any) {
      console.error('Error toggling ready status:', err);
      return { success: false, error: err.message };
    }
  };

  const startGame = async () => {
    if (!db || !user || !lobbyId || !lobby) {
      return { success: false, error: 'Missing required data' };
    }

    try {
      const currentUser = lobby.users.find(u => u.uid === user.uid);

      if (!currentUser?.isHost) {
        return { success: false, error: 'Only host can start the game' };
      }

      const allReady = lobby.users.every(u => u.ready);
      if (!allReady) {
        return { success: false, error: 'All players must be ready' };
      }

      const lobbyRef = doc(db, 'lobbies', lobbyId);
      await updateDoc(lobbyRef, {
        status: 'playing',
      });

      return { success: true };
    } catch (err: any) {
      console.error('Error starting game:', err);
      return { success: false, error: err.message };
    }
  };

  const isHost = lobby?.users.find(u => u.uid === user?.uid)?.isHost || false;
  const currentUser = lobby?.users.find(u => u.uid === user?.uid);
  const allReady = lobby?.users.every(u => u.ready) || false;

  return {
    lobby,
    loading,
    error,
    joinLobby,
    leaveLobby,
    toggleReady,
    startGame,
    isHost,
    currentUser,
    allReady,
  };
}
