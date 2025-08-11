# Quizino

Quizino er et flerspiller-quizspill med poker-inspirert spillmekanikk. Spillet kombinerer tradisjonell quiz med innsats, hint, bluffing og eliminering, med sanntidsoppdatering via Firebase.

## 🚀 Funksjoner
- **Lobby-system**: Spillere kan opprette eller bli med i en lobby via kode.
- **Automatisk spillflyt**: Faser `opening → question → hint1 → hint2 → hint3 → reveal → elimination`.
- **Betting**: Fold, call, raise, all-in.
- **Spørsmålsbank**: Kategorier og spørsmål hentes automatisk fra Firestore.
- **Sanntidssynk**: Oppdateringer skjer live via Firestore onSnapshot.

## 🛠 Teknisk stack
- **Next.js 15** (App Router, TypeScript)
- **React 19**
- **Firebase** (Auth, Firestore, Hosting)
- **TailwindCSS**
- Egendefinert game engine (`useGameEngine.ts`) for fasehåndtering

## 📦 Kom i gang

### 1. Klon repoet
```bash
git clone https://github.com/FeynLars/Quizino.git
cd Quizino
```

### 2. Installer avhengigheter
```bash
npm install
```

### 3. Miljøvariabler
- Kopier `.env.local.sample` til `.env.local`
- Fyll inn dine egne Firebase-nøkler (finnes i Firebase Console → Project settings → General → Your apps)

### 4. Kjør utviklingsserveren
```bash
npm run dev
```
- Åpne [http://localhost:3000](http://localhost:3000) i nettleseren.

## 🔑 Miljøvariabler
Se `.env.local.sample` for hvilke variabler som trengs.

## 🔒 Sikkerhet
## 🔐 Security (Dev)
Dette repoet er offentlig. For utvikling bruker vi trygge, men åpne nok Firestore-regler:

### Firestore rules (dev)
// Firestore security rules – safe for development
rules_version = '2';
service cloud.firestore {
match /databases/{database}/documents {

function isAuthed() { return request.auth != null; }

// PUBLIC READ-ONLY CONTENT
match /categories/{id} { allow read: if true; allow write: if false; }
match /questions/{id}  { allow read: if true; allow write: if false; }

// LOBBIES (requires auth to write)
match /lobbies/{lobbyId} {
  allow read: if true;
  allow create, update: if isAuthed();
  allow delete: if false;
}

// GAMES (requires auth to write)
match /games/{gameId} {
  allow read: if true;
  allow create, update: if isAuthed();
  allow delete: if false;
}

// PLAYERS (example: user can only write own record)
match /players/{playerId} {
  allow read: if isAuthed();
  allow create: if isAuthed() && request.resource.data.uid == request.auth.uid;
  allow update: if isAuthed() && resource.data.uid == request.auth.uid;
  allow delete: if false;
}

// Deny everything else
match /{document=**} { allow read, write: if false; }


### Auth for enkel testing
Aktivér **Anonymous Auth** i Firebase Console → Authentication → Sign-in method.  
Det gjør at skriving (create/update) fungerer uten å sette opp full brukerflyt i dev.

### Secrets
- Ikke push `.env.local` eller `admin/*.json`.
- `.env.local.sample` viser hvilke variabler som kreves.


## 📋 Prioriteringsliste til videre utvikling (Lovable audit)
1. **Imports og alias**  
   - Konsolider til én `components/`-mappe.  
   - Sett `tsconfig.json` med:
     ```json
     "baseUrl": ".",
     "paths": { "@/*": ["./*"] }
     ```
   - Oppdater alle imports til `@/…`.

2. **Lobby → Game opprettelse**  
   - `CreateLobbyButton` skal opprette **både** `lobbies/{id}` og `games/{id}` med samme ID (writeBatch).
   - Felter i `games` må matche `GameClient`/`useGameEngine`:
     ```
     id, lobbyId, phase:"opening", players[], currentRound, currentPlayerIndex,
     currentHintIndex, blindLevel, bigBlind, lastBlindIncrease, selectedCategory:"", currentQuestionId:""
     ```

3. **Next 15 params**  
   - `app/game/[lobbyId]/page.tsx` sender både `lobbyId` og `gameId` til `GameClient`.

4. **Realtime & game flow**  
   - `useGameEngine` skal lytte på `games/{id}` via `onSnapshot`.
   - Fase-timer må fungere for alle spillere i sanntid.
   - Hint og spørsmål hentes fra Firestore.

5. **Opprydding & DX**  
   - Fjern duplikatmapper (`app/components/` vs `components/`).
   - Lås `firebase` til v10 (kompatibel med `firebaseui@6`).
   - Legg til dokumentasjon for `scripts/seedFirestoreAdmin.mjs`.
   - `.env.local.sample` er inkludert i repo.

## ✅ Akseptansekriterier for demo
- Klikk “Create New Quiz” → Oppretter lobby + game (samme ID) → Redirect til `/game/{id}`.
- Automatisk kategori og spørsmål vises → Hint 1–3 → Reveal.
- To klienter ser samme faser i sanntid.
- Ingen “Spilldata ikke funnet”-feil.

---
