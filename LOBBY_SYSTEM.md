# Quizino Lobby System

A complete multiplayer lobby system for the Quizino quiz game, built with Next.js, Firebase Firestore, and real-time updates.

## Features

### ✅ Implemented Features
- **Unique Lobby IDs**: Each lobby has a unique 6-character ID (e.g., `/lobby/ABC123`)
- **Real-time Updates**: Live updates using Firestore `onSnapshot`
- **User Management**: Join, leave, and track user status
- **Ready System**: Users can toggle ready status
- **Host Controls**: Only the host (first user) can start the game
- **Auto-join**: Users automatically join when visiting a lobby URL
- **Responsive Design**: Works on desktop and mobile
- **Error Handling**: Graceful error handling and user feedback

### 🎮 User Flow
1. **Create Lobby**: Click "Create New Quiz Game" to generate a random lobby ID
2. **Join Lobby**: Enter a lobby ID to join an existing game
3. **Ready Up**: Toggle your ready status
4. **Start Game**: Host can start when all players are ready

## File Structure

```
quizino/
├── types/
│   └── lobby.ts                    # TypeScript interfaces
├── hooks/
│   └── useLobby.ts                 # Custom hook for lobby management
├── components/
│   ├── LobbyClient.tsx             # Main lobby component
│   ├── LobbyUserList.tsx           # User list display
│   ├── LobbyControls.tsx           # Ready/start controls
│   ├── CreateLobbyButton.tsx       # Lobby creation
│   └── JoinLobbyForm.tsx           # Lobby joining
├── app/
│   └── lobby/
│       └── [id]/
│           └── page.tsx            # Dynamic lobby page
└── lib/
    └── firebase.ts                 # Firebase configuration
```

## Database Schema

### Firestore Collection: `lobbies`

```typescript
interface LobbyData {
  users: LobbyUser[];
  createdAt: Timestamp;
  status: 'waiting' | 'playing' | 'finished';
  maxPlayers?: number;
}

interface LobbyUser {
  uid: string;
  name: string;
  ready: boolean;
  isHost: boolean;
  joinedAt: Date;
}
```

## Key Components

### `useLobby` Hook
- Manages lobby state and real-time updates
- Handles join/leave operations
- Manages ready status and game start
- Provides lobby data and user status

### `LobbyClient`
- Main lobby interface
- Auto-joins users when they visit
- Handles navigation and error states
- Coordinates between user list and controls

### `LobbyUserList`
- Displays all users in the lobby
- Shows ready status with visual indicators
- Highlights current user and host
- Shows join times and player count

### `LobbyControls`
- Ready toggle button for users
- Start game button for host
- Game requirements and instructions
- Different views for host vs players

## Real-time Features

### Firestore Listeners
- `onSnapshot` for live lobby updates
- Automatic reconnection on network issues
- Optimistic updates for better UX

### User Synchronization
- Real-time ready status updates
- Live user join/leave notifications
- Host transfer when host leaves

## Security & Validation

### Client-side Validation
- Lobby ID format validation
- User authentication checks
- Ready status validation
- Host permission checks

### Firestore Rules (Recommended)
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /lobbies/{lobbyId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## Usage Examples

### Creating a Lobby
```typescript
// Automatically generates lobby ID and redirects
<CreateLobbyButton />
```

### Joining a Lobby
```typescript
// User enters lobby ID and joins
<JoinLobbyForm />
```

### Using the Lobby Hook
```typescript
const { lobby, joinLobby, toggleReady, startGame } = useLobby(lobbyId);
```

## Next Steps

### Game Integration
- Connect lobby to actual quiz game
- Implement game state management
- Add score tracking and results

### Enhanced Features
- Lobby chat system
- Custom lobby settings
- Player limits and restrictions
- Lobby discovery/search

### Performance Optimizations
- Implement pagination for large lobbies
- Add offline support
- Optimize Firestore queries
- Add caching strategies

## Testing

### Manual Testing
1. Create a new lobby
2. Join with multiple browser tabs
3. Test ready status toggles
4. Verify host controls
5. Test leave/join scenarios

### Automated Testing
- Unit tests for lobby logic
- Integration tests for Firestore
- E2E tests for user flows

## Deployment

### Environment Variables
Ensure your `.env.local` has Firebase configuration:
```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project
# ... other Firebase config
```

### Firestore Setup
1. Enable Firestore in Firebase Console
2. Set up security rules
3. Configure indexes if needed
4. Test real-time listeners

## Troubleshooting

### Common Issues
- **"Firebase not initialized"**: Check environment variables
- **"Lobby not found"**: Verify lobby ID format
- **"Permission denied"**: Check Firestore security rules
- **Real-time not working**: Verify Firestore is enabled

### Debug Tips
- Check browser console for errors
- Verify Firebase configuration
- Test with multiple users/devices
- Monitor Firestore usage in console 