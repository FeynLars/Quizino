import { useState, useEffect, useCallback, useRef } from 'react';
import { doc, getDoc, setDoc, onSnapshot, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Game, Player, Question } from '../types/game';
import { useAuthContext } from '../contexts/AuthContext';

interface UseGameEngineOptions {
  gameId: string;
  lobbyId: string;
}

export function useGameEngine({ gameId, lobbyId }: UseGameEngineOptions) {
  const { user } = useAuthContext();
  const [game, setGame] = useState<Game | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const phaseTimerRef = useRef<NodeJS.Timeout | null>(null);

  const gameRef = doc(db, 'games', gameId);

  // Phase durations in milliseconds
  const PHASE_DURATIONS = {
    opening: 10000,    // 10 seconds countdown
    question: 60000,   // 60 seconds to answer
    hint1: 30000,      // 30 seconds betting after hint
    hint2: 30000,      // 30 seconds betting after hint
    hint3: 30000,      // 30 seconds betting after hint
    reveal: 10000,     // 10 seconds to show results
    elimination: 5000  // 5 seconds before next round
  };

  useEffect(() => {
    const unsubscribe = onSnapshot(
      gameRef,
      (snapshot) => {
        const data = snapshot.data() as Game;
        if (data) {
          setGame(data);
          
          // Start phase timer if we're the host and game is playing
          if (data.status === 'playing' && isHost(data) && data.phase !== 'start') {
            startPhaseTimer(data.phase, data.roundStartTime);
          }
        } else {
          setError('Spilldata ikke funnet.');
        }
        setLoading(false);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      }
    );
    return () => {
      unsubscribe();
      if (timerRef.current) clearInterval(timerRef.current);
      if (phaseTimerRef.current) clearTimeout(phaseTimerRef.current);
    };
  }, [gameId]);

  const isHost = (gameData?: Game) => {
    const currentGame = gameData || game;
    return currentGame?.players[0]?.uid === user?.uid;
  };

  const startPhaseTimer = (phase: string, startTime: number) => {
    if (!isHost()) return;
    
    const duration = PHASE_DURATIONS[phase as keyof typeof PHASE_DURATIONS];
    if (!duration) return;

    const elapsed = Date.now() - startTime;
    const remaining = Math.max(0, duration - elapsed);

    // Clear existing timers
    if (phaseTimerRef.current) clearTimeout(phaseTimerRef.current);
    if (timerRef.current) clearInterval(timerRef.current);

    // Start countdown timer for UI
    const updateTimer = () => {
      const now = Date.now();
      const timeRemaining = Math.max(0, Math.ceil((startTime + duration - now) / 1000));
      setTimeLeft(timeRemaining);
      
      if (timeRemaining <= 0) {
        if (timerRef.current) clearInterval(timerRef.current);
      }
    };

    updateTimer();
    timerRef.current = setInterval(updateTimer, 1000);

    // Set timer for automatic phase advancement
    if (remaining > 0) {
      phaseTimerRef.current = setTimeout(() => {
        advancePhase();
      }, remaining);
    }
  };

  const getRandomCategory = async () => {
    try {
      const categoriesRef = collection(db, 'categories');
      const snapshot = await getDocs(categoriesRef);
      
      if (snapshot.empty) {
        // Fallback to hardcoded categories if database is empty
        const fallbackCategories = ['Sport', 'Historie', 'Musikk', 'Film', 'Vitenskap', 'Geografi'];
        return fallbackCategories[Math.floor(Math.random() * fallbackCategories.length)];
      }
      
      const categories = snapshot.docs.map(doc => doc.data());
      const randomCategory = categories[Math.floor(Math.random() * categories.length)];
      return randomCategory.id;
    } catch (error) {
      console.error('Error fetching categories:', error);
      return 'sport'; // fallback
    }
  };

  const getRandomQuestion = async (categoryId: string) => {
    try {
      const questionsRef = collection(db, 'questions');
      const q = query(questionsRef, where('category', '==', categoryId));
      const snapshot = await getDocs(q);
      
      if (snapshot.empty) {
        // Fallback to hardcoded question if no questions found
        const fallbackQuestion: Question = {
          id: 'fallback_1',
          category: categoryId,
          question: 'Hva er 2 + 2?',
          answer: '4',
          hints: ['Det er et enkelt regnestykke', 'Svaret er mindre enn 10', 'Det er et partall'],
          type: 'number'
        };
        return fallbackQuestion;
      }
      
      const questions = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Question));
      const randomQuestion = questions[Math.floor(Math.random() * questions.length)];
      return randomQuestion;
    } catch (error) {
      console.error('Error fetching questions:', error);
      // Return fallback question
      return {
        id: 'error_fallback',
        category: categoryId,
        question: 'Hva er hovedstaden i Norge?',
        answer: 'Oslo',
        hints: ['Det er den største byen i Norge', 'Kongen bor her', 'Byen ligger ved Oslofjorden'],
        type: 'text'
      } as Question;
    }
  };

  const initializeGame = useCallback(
    async (lobbyId: string, initialPlayers: Player[]) => {
      const now = Date.now();

      const gameData: Game = {
        id: gameId,
        lobbyId,
        status: 'waiting',
        phase: 'start',
        currentRound: 1,
        players: initialPlayers.map(p => ({ ...p, quizinos: 1000 })), // Start with 1000 quizinos
        currentPlayerIndex: 0,
        pot: 0,
        smallBlind: 10,
        bigBlind: 20,
        blindLevel: 1,
        currentHintIndex: 0,
        lastBlindIncrease: now,
        roundStartTime: now,
        createdAt: now,
        selectedCategory: null,
        currentQuestion: null,
      };

      await setDoc(gameRef, gameData);
    },
    [gameId]
  );

  const startGame = useCallback(async () => {
    if (!game || !isHost()) return;

    const now = Date.now();
    const category = await getRandomCategory();
    
    await updateDoc(gameRef, {
      phase: 'opening',
      roundStartTime: now,
      status: 'playing',
      selectedCategory: category,
    });
  }, [gameRef, game]);

  const advancePhase = useCallback(async () => {
    if (!game || !isHost()) return;
    
    const phases = ['start', 'opening', 'question', 'hint1', 'hint2', 'hint3', 'reveal', 'elimination'];
    const currentIndex = phases.indexOf(game.phase);
    let nextPhase = phases[(currentIndex + 1) % phases.length];
    
    const now = Date.now();
    const updates: any = { 
      phase: nextPhase, 
      roundStartTime: now 
    };

    // Special logic for phase transitions
    if (game.phase === 'opening' && nextPhase === 'question') {
      // Select question when moving to question phase
      if (game.selectedCategory) {
        const question = await getRandomQuestion(game.selectedCategory);
        updates.currentQuestion = question.question;
        updates.currentAnswer = question.answer;
        updates.currentHints = question.hints;
        updates.currentQuestionType = question.type;
      }
    } else if (game.phase === 'elimination') {
      // Start new round
      updates.currentRound = game.currentRound + 1;
      updates.currentHintIndex = 0;
      updates.selectedCategory = null;
      updates.currentQuestion = null;
      updates.currentAnswer = null;
      updates.currentHints = null;
      nextPhase = 'opening';
      updates.phase = nextPhase;
      
      // Reset player states for new round
      const resetPlayers = game.players.map(p => ({
        ...p,
        currentAnswer: null,
        currentBet: 0,
        hasFolded: false,
        isAllIn: false
      }));
      updates.players = resetPlayers;
      updates.pot = 0;
      
      // Select new category for next round
      const newCategory = await getRandomCategory();
      updates.selectedCategory = newCategory;
    } else if (game.phase.startsWith('hint')) {
      // Update hint index when moving through hint phases
      const hintNumber = parseInt(game.phase.replace('hint', ''));
      updates.currentHintIndex = hintNumber - 1;
    }

    await updateDoc(gameRef, updates);
  }, [game, gameRef]);

  const submitAnswer = useCallback(
    async (answer: string) => {
      if (!user || !game) return { success: false, error: 'Ingen bruker eller spillstate' };

      const updatedPlayers = game.players.map((p) =>
        p.uid === user.uid ? { ...p, currentAnswer: answer } : p
      );
      await updateDoc(gameRef, { players: updatedPlayers });
      return { success: true };
    },
    [user, game, gameRef]
  );

  const placeBet = useCallback(
    async (action: 'fold' | 'call' | 'raise' | 'all-in', amount?: number) => {
      if (!user || !game) return { success: false, error: 'Ingen bruker eller spillstate' };

      const currentPlayer = game.players.find(p => p.uid === user.uid);
      if (!currentPlayer) return { success: false, error: 'Spiller ikke funnet' };

      const updatedPlayers = game.players.map((p) => {
        if (p.uid !== user.uid) return p;

        let newQuizinos = p.quizinos;
        let newBet = p.currentBet || 0;
        let hasFolded = false;
        let isAllIn = false;

        switch (action) {
          case 'fold':
            hasFolded = true;
            break;
          case 'call':
            const callAmount = game.bigBlind - newBet;
            newQuizinos = Math.max(0, newQuizinos - callAmount);
            newBet = game.bigBlind;
            break;
          case 'raise':
            if (amount && amount > newBet) {
              const raiseAmount = amount - newBet;
              newQuizinos = Math.max(0, newQuizinos - raiseAmount);
              newBet = amount;
            }
            break;
          case 'all-in':
            newBet += newQuizinos;
            newQuizinos = 0;
            isAllIn = true;
            break;
        }

        return {
          ...p,
          quizinos: newQuizinos,
          currentBet: newBet,
          hasFolded,
          isAllIn,
        };
      });

      // Calculate new pot
      const newPot = updatedPlayers.reduce((sum, p) => sum + (p.currentBet || 0), 0);

      await updateDoc(gameRef, {
        players: updatedPlayers,
        pot: newPot,
      });

      return { success: true };
    },
    [user, game, gameRef]
  );

  const setSelectedCategory = useCallback(async (category: string) => {
    if (!isHost()) return;
    
    await updateDoc(gameRef, {
      selectedCategory: category,
    });
  }, [gameRef]);

  const currentPlayer = game?.players.find((p) => p.uid === user?.uid);
  const canChangeAnswer = game?.phase === 'question' || game?.phase.startsWith('hint');
  const isGameHost = isHost();

  return {
    game,
    loading,
    error,
    timeLeft,
    initializeGame,
    startGame,
    advancePhase,
    submitAnswer,
    placeBet,
    currentPlayer,
    canChangeAnswer,
    isHost: isGameHost,
    setSelectedCategory,
  };
}

