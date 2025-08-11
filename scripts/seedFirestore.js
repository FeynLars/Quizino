// scripts/seedFirestore.mjs
// Seed Firestore med kategorier og spørsmål
// Kjør: node scripts/seedFirestore.mjs

import 'dotenv/config';
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';

// Bruker verdier fra .env.local
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

if (!firebaseConfig.projectId) {
  console.error('❌ Mangler Firebase config (sjekk .env.local)');
  process.exit(1);
}

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ----- DATA -----
const categories = [
  { id: 'sport',    name: 'Sport',     description: 'Spørsmål om sport og idrett' },
  { id: 'historie', name: 'Historie',  description: 'Spørsmål om verdenshistorie og norsk historie' },
  { id: 'musikk',   name: 'Musikk',    description: 'Spørsmål om musikk og artister' },
  { id: 'film',     name: 'Film',      description: 'Spørsmål om filmer og skuespillere' },
  { id: 'vitenskap',name: 'Vitenskap', description: 'Spørsmål om vitenskap og teknologi' },
  { id: 'geografi', name: 'Geografi',  description: 'Spørsmål om land, byer og geografi' },
];

const questions = [
  // Sport
  { id: 'sport_1', category: 'sport', question: 'Hvilket år vant Norge mest gull i vinter-OL?', answer: '2018',
    hints: ['Det var i dette tiåret','Det var i Pyeongchang','Norge vant 14 gull'], type: 'number', difficulty: 'medium' },
  { id: 'sport_2', category: 'sport', question: 'Hvor mange spillere er det på et fotballag på banen samtidig?', answer: '11',
    hints: ['Det er mer enn 10','Det er mindre enn 15','Inkluderer keeper'], type: 'number', difficulty: 'easy' },
  { id: 'sport_3', category: 'sport', question: "Hvem vant Ballon d'Or i 2023?", answer: 'Lionel Messi',
    hints: ['Han spiller for Inter Miami','Han er fra Argentina','Han vant VM i 2022'], type: 'text', difficulty: 'medium' },

  // Historie
  { id: 'historie_1', category: 'historie', question: 'Hvilket år ble Berlin-muren revet?', answer: '1989',
    hints: ['Det var på slutten av 80-tallet','Sovjetunionen begynte å kollapse','28 år etter at muren ble bygget'],
    type: 'number', difficulty: 'medium' },
  { id: 'historie_2', category: 'historie', question: 'Hvilket år ble Norge selvstendig fra Sverige?', answer: '1905',
    hints: ['Begynnelsen av 1900-tallet','Einstein publiserte relativitetsteorien','Haakon VII ble konge'],
    type: 'number', difficulty: 'medium' },
  { id: 'historie_3', category: 'historie', question: 'Hvem var den første personen på månen?', answer: 'Neil Armstrong',
    hints: ['Han var amerikaner','Det skjedde i 1969',"Han sa \"That's one small step for man...\""],
    type: 'text', difficulty: 'easy' },

  // Musikk
  { id: 'musikk_1', category: 'musikk', question: 'Hvem skrev "Imagine"?', answer: 'John Lennon',
    hints: ['Medlem av The Beatles','Drept i 1980','Yoko Ono'], type: 'text', difficulty: 'medium' },
  { id: 'musikk_2', category: 'musikk', question: 'Hvilket år ble "Bohemian Rhapsody" utgitt?', answer: '1975',
    hints: ['På 70-tallet','Samme år som ABBA vant Eurovision','Queen var på toppen'],
    type: 'number', difficulty: 'hard' },
  { id: 'musikk_3', category: 'musikk', question: 'Hvem er kjent som "King of Pop"?', answer: 'Michael Jackson',
    hints: ['Moonwalk','"Thriller"','Døde i 2009'], type: 'text', difficulty: 'easy' },

  // Film
  { id: 'film_1', category: 'film', question: 'Hvilket år kom den første "Star Wars"-filmen?', answer: '1977',
    hints: ['På 70-tallet','Elvis døde samme år','Het opprinnelig bare "Star Wars"'],
    type: 'number', difficulty: 'medium' },
  { id: 'film_2', category: 'film', question: 'Hvem regisserte "Pulp Fiction"?', answer: 'Quentin Tarantino',
    hints: ['Regisserte også "Kill Bill"','Kjent for voldelige filmer','Oscar for beste manus'],
    type: 'text', difficulty: 'medium' },

  // Vitenskap
  { id: 'vitenskap_1', category: 'vitenskap', question: 'Hvor mange planeter er det i solsystemet vårt?', answer: '8',
    hints: ['Pluto regnes ikke lenger som planet','Mindre enn 10','Neptun er ytterst'],
    type: 'number', difficulty: 'easy' },
  { id: 'vitenskap_2', category: 'vitenskap', question: 'Hvem utviklet relativitetsteorien?', answer: 'Albert Einstein',
    hints: ['Tysk-jødisk fysiker','Vant Nobelprisen i fysikk','E=mc²'],
    type: 'text', difficulty: 'easy' },

  // Geografi
  { id: 'geografi_1', category: 'geografi', question: 'Hva er hovedstaden i Australia?', answer: 'Canberra',
    hints: ['Det er ikke Sydney','Det er ikke Melbourne','Planlagt som hovedstad'],
    type: 'text', difficulty: 'hard' },
  { id: 'geografi_2', category: 'geografi', question: 'Hvor mange land er det i Afrika?', answer: '54',
    hints: ['Mer enn 50','Mindre enn 60','Sør-Sudan er nyeste'],
    type: 'number', difficulty: 'hard' },
];

async function seedDatabase() {
  console.log('🌱 Starter seeding…');

  // Kategorier
  console.log('→ Legger inn kategorier...');
  for (const category of categories) {
    await setDoc(doc(db, 'categories', category.id), category);
    console.log(`   ✔ ${category.id}`);
  }

  // Spørsmål
  console.log('→ Legger inn spørsmål...');
  for (const q of questions) {
    await setDoc(doc(db, 'questions', q.id), q);
    console.log(`   ✔ ${q.id}`);
  }

  console.log('✅ Ferdig! Firestore er seeded.');
}

seedDatabase().catch((err) => {
  console.error('❌ Feil under seeding:', err);
  process.exit(1);
});
