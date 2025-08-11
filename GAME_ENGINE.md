# Quizino Game Engine

En komplett spillmotor for Quizino - et quizspill med pokerlignende struktur og valuta kalt quizinos.

## 🎮 Spillstruktur

### Faser
1. **Start** - Alle spillere starter med 1000 quizinos
2. **Åpning** - Spilleren med "quizino-button" velger tema
3. **Spørsmål** - Spørsmål leses opp, spillere svarer
4. **Hint 1** - Første hint, spillere kan endre svar og satse
5. **Hint 2** - Andre hint, spillere kan satse (svar låst)
6. **Hint 3** - Tredje hint, spillere kan satse (svar låst)
7. **Avsløring** - Alle svar vises, vinner bestemmes
8. **Eliminering** - Spillere med 0 quizinos elimineres

### Økonomi
- **Startkapital**: 1000 quizinos per spiller
- **Small Blind**: 5 quizinos
- **Big Blind**: 10 quizinos
- **Blind økning**: Hvert 10. minutt (dobler)
- **Mål**: Sitte igjen med alle quizinos

## 🏗️ Arkitektur

### Filer
```
quizino/
├── types/
│   └── game.ts                    # TypeScript interfaces
├── hooks/
│   └── useGameEngine.ts           # Spillmotor hook
├── components/
│   ├── GameEngine.tsx             # Hovedkomponent
│   └── GameClient.tsx             # Spillklient
├── app/
│   └── game/
│       └── [id]/
│           └── page.tsx           # Spillside
└── lib/
    └── firebase.ts                # Firebase konfigurasjon
```

### Database Schema

#### Firestore Collection: `games`
```typescript
interface Game {
  id: string;
  lobbyId: string;
  status: 'waiting' | 'playing' | 'finished';
  phase: PhasePhase;
  currentRound: number;
  players: Player[];
  currentPlayerIndex: number;
  pot: number;
  smallBlind: number;
  bigBlind: number;
  blindLevel: number;
  lastBlindIncrease: Date;
  currentQuestion?: Question;
  currentHintIndex: number;
  roundStartTime: Date;
  createdAt: Date;
}

interface Player {
  uid: string;
  name: string;
  quizinos: number;
  isActive: boolean;
  currentAnswer?: string;
  currentBet: number;
  hasFolded: boolean;
  isAllIn: boolean;
  joinedAt: Date;
}

interface Question {
  id: string;
  text: string;
  correctAnswer: string;
  category: string;
  hints: string[];
  difficulty: 'easy' | 'medium' | 'hard';
}
```

## 🎯 Hovedkomponenter

### `useGameEngine` Hook
- **Real-time oppdateringer** med Firestore `onSnapshot`
- **Automatisk faseovergang** med tidsbaserte timeouts
- **Blind økning** hvert 10. minutt
- **Spillerhandlinger**: svar, satsing, fold, all-in
- **Vinnerberegning** med Levenshtein distance

### `GameEngine` Komponent
- **Fasebasert UI** for hver spillefase
- **Responsivt design** med Tailwind CSS
- **Spillerstatus** i bunnen av skjermen
- **Real-time oppdateringer** av pot og blinds

### `GameClient` Komponent
- **Kobling mellom lobby og spill**
- **Automatisk spillinitialisering**
- **Feilhåndtering** og loading states

## 🎲 Spilllogikk

### Faseoverganger
```typescript
const phaseTimeouts: Record<GamePhase, number> = {
  start: 5000,      // 5 sekunder
  opening: 30000,   // 30 sekunder
  question: 15000,  // 15 sekunder
  hint1: 20000,     // 20 sekunder
  hint2: 20000,     // 20 sekunder
  hint3: 20000,     // 20 sekunder
  reveal: 10000,    // 10 sekunder
  elimination: 5000 // 5 sekunder
};
```

### Satsing
- **Fold**: Spiller trekker seg fra runden
- **Call**: Spiller matcher big blind
- **Raise**: Spiller øker innsatsen
- **All-in**: Spiller satser alle quizinos

### Vinnerberegning
```typescript
const calculateAnswerDistance = (answer1: string, answer2: string): number => {
  // Levenshtein distance algoritme
  // Lavest avstand = beste svar
};
```

## 🎨 UI/UX

### Fargepalett
- **Bakgrunn**: `bg-gray-900` (mørk)
- **Kort**: `bg-gray-800` (mørkegrå)
- **Primær**: `text-yellow-400` (gul)
- **Suksess**: `text-green-400` (grønn)
- **Feil**: `text-red-400` (rød)

### Responsivt Design
- **Desktop**: Grid layout med side-om-side
- **Mobil**: Stack layout med full bredde
- **Spillerstatus**: Fast bunnbar

## 🔧 Tekniske Detaljer

### Real-time Oppdateringer
```typescript
const unsubscribe = onSnapshot(
  gameRef,
  (doc) => {
    // Oppdater spilltilstand
  },
  (err) => {
    // Håndter feil
  }
);
```

### Automatisk Blind Økning
```typescript
useEffect(() => {
  const checkBlinds = () => {
    const timeSinceIncrease = now.getTime() - lastBlindIncrease.getTime();
    if (timeSinceIncrease >= tenMinutes) {
      increaseBlinds();
    }
  };
  const interval = setInterval(checkBlinds, 60000);
  return () => clearInterval(interval);
}, [lastBlindIncrease]);
```

### Spillerhandlinger
```typescript
const placeBet = async (action: 'fold' | 'call' | 'raise' | 'all-in', amount?: number) => {
  // Valider handling
  // Oppdater spiller og pot
  // Lagre til Firestore
};
```

## 🚀 Bruk

### Starte et spill
1. **Opprett lobby** med `/lobby/[id]`
2. **Vent på spillere** og ready status
3. **Start spill** som host
4. **Automatisk overgang** til GameEngine

### Spillflyt
1. **Start**: Viser alle spillere og startkapital
2. **Åpning**: Host velger tema
3. **Spørsmål**: Alle svarer på spørsmål
4. **Hint-runder**: Satsing og hint avsløres
5. **Avsløring**: Vinner bestemmes
6. **Eliminering**: Spillere med 0 quizinos fjernes

## 🔮 Fremtidige Utvidelser

### Planlagte Funksjoner
- **Chat-system** i lobbies
- **Spørsmål-database** med flere kategorier
- **Turnering-modus** med flere runder
- **Statistikk** og leaderboards
- **Lyd og animasjoner**

### Tekniske Forbedringer
- **Offline-støtte** med service workers
- **Caching-strategier** for bedre ytelse
- **WebRTC** for direkte kommunikasjon
- **Push-notifikasjoner** for spillinvitasjoner

## 🐛 Feilsøking

### Vanlige Problemer
- **"Firebase not initialized"**: Sjekk miljøvariabler
- **"Game not found"**: Verifiser game ID
- **"Permission denied"**: Sjekk Firestore regler
- **Real-time ikke fungerer**: Verifiser Firestore er aktivert

### Debug Tips
- Sjekk browser console for feil
- Verifiser Firebase konfigurasjon
- Test med flere brukere/enheter
- Overvåk Firestore bruk i konsollen

## 📝 Miljøvariabler

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

## 🎯 Neste Steg

1. **QuestionManager** - Administrere spørsmål og kategorier
2. **BettingInterface** - Forbedret satsing UI
3. **ChatSystem** - Kommunikasjon mellom spillere
4. **Statistics** - Spillstatistikk og historikk
5. **TournamentMode** - Turneringer med flere runder 