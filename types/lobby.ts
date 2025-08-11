export interface LobbyUser {
  uid: string;
  name: string;
  ready: boolean;
  isHost: boolean;
  joinedAt: number; // ← Endret fra Date til number
}

export interface Lobby {
  id: string;
  users: LobbyUser[];
  createdAt: number; // ← Endret fra Date til number
  status: 'waiting' | 'playing' | 'finished';
  maxPlayers?: number;
}

export interface LobbyData {
  users: LobbyUser[];
  createdAt: any; // fortsatt Firestore Timestamp
  status: 'waiting' | 'playing' | 'finished';
  maxPlayers?: number;
}
