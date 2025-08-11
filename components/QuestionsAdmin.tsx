'use client';

import { useState, useEffect } from 'react';
import { useAuthContext } from '@contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { 
  collection, 
  addDoc, 
  getDocs, 
  deleteDoc, 
  doc, 
  query, 
  orderBy 
} from 'firebase/firestore';
import { db } from '@lib/firebase';

interface Question {
  id: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  text: string;
  correctAnswer: string;
  hints: string[];
  createdAt: Date;
}

export default function QuestionsAdmin() {
  const { user, loading: authLoading } = useAuthContext();
  const router = useRouter();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    category: '',
    difficulty: 'easy' as 'easy' | 'medium' | 'hard',
    text: '',
    correctAnswer: '',
    hints: ['', '', '']
  });

  // Check if user is admin (you can customize this logic)
  const isAdmin = user?.email === 'admin@quizino.com' || user?.uid === 'admin-uid';

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/');
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    if (user && isAdmin) {
      loadQuestions();
    }
  }, [user, isAdmin]);

  const loadQuestions = async () => {
    if (!db) return;

    try {
      setLoading(true);
      const questionsRef = collection(db, 'questions');
      const q = query(questionsRef, orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      
      const questionsData: Question[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        questionsData.push({
          id: doc.id,
          category: data.category,
          difficulty: data.difficulty,
          text: data.text,
          correctAnswer: data.correctAnswer,
          hints: data.hints,
          createdAt: data.createdAt?.toDate() || joinedAt: new Date(),
        });
      });
      
      setQuestions(questionsData);
    } catch (error) {
      console.error('Error loading questions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!db || !user) return;

    // Validate form
    if (!formData.category.trim() || !formData.text.trim() || !formData.correctAnswer.trim()) {
      alert('Vennligst fyll ut alle påkrevde felter');
      return;
    }

    if (formData.hints.some(hint => !hint.trim())) {
      alert('Vennligst fyll ut alle tre hint');
      return;
    }

    try {
      setSubmitting(true);
      
      const questionsRef = collection(db, 'questions');
      await addDoc(questionsRef, {
        category: formData.category.trim(),
        difficulty: formData.difficulty,
        text: formData.text.trim(),
        correctAnswer: formData.correctAnswer.trim(),
        hints: formData.hints.map(hint => hint.trim()),
        createdAt: joinedAt: new Date(),,
        createdBy: user.uid
      });

      // Reset form
      setFormData({
        category: '',
        difficulty: 'easy',
        text: '',
        correctAnswer: '',
        hints: ['', '', '']
      });

      // Reload questions
      await loadQuestions();
      
      alert('Spørsmål lagt til!');
    } catch (error) {
      console.error('Error adding question:', error);
      alert('Feil ved lagring av spørsmål');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (questionId: string) => {
    if (!db || !confirm('Er du sikker på at du vil slette dette spørsmålet?')) return;

    try {
      await deleteDoc(doc(db, 'questions', questionId));
      await loadQuestions();
      alert('Spørsmål slettet!');
    } catch (error) {
      console.error('Error deleting question:', error);
      alert('Feil ved sletting av spørsmål');
    }
  };

  const updateHint = (index: number, value: string) => {
    const newHints = [...formData.hints];
    newHints[index] = value;
    setFormData({ ...formData, hints: newHints });
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to home
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-red-50 border border-red-200 rounded-lg p-8 max-w-md">
          <h2 className="text-2xl font-bold text-red-800 mb-4">Ingen tilgang</h2>
          <p className="text-red-600 mb-4">Du har ikke tilgang til admin-panelet.</p>
          <button
            onClick={() => router.push('/')}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Gå tilbake
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin - Spørsmål</h1>
          <p className="text-gray-600 mt-2">Administrer spørsmål for Quizino</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Create Question Form */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Legg til nytt spørsmål</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Kategori *
                </label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="f.eks. Geografi, Historie, Vitenskap"
                  required
                />
              </div>

              {/* Difficulty */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Vanskelighetsgrad *
                </label>
                <select
                  value={formData.difficulty}
                  onChange={(e) => setFormData({ ...formData, difficulty: e.target.value as 'easy' | 'medium' | 'hard' })}
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                >
                  <option value="easy">Lett</option>
                  <option value="medium">Middels</option>
                  <option value="hard">Vanskelig</option>
                </select>
              </div>

              {/* Question Text */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Spørsmålstekst *
                </label>
                <textarea
                  value={formData.text}
                  onChange={(e) => setFormData({ ...formData, text: e.target.value })}
                  rows={3}
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Skriv spørsmålet her..."
                  required
                />
              </div>

              {/* Correct Answer */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Riktig svar *
                </label>
                <input
                  type="text"
                  value={formData.correctAnswer}
                  onChange={(e) => setFormData({ ...formData, correctAnswer: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Det riktige svaret"
                  required
                />
              </div>

              {/* Hints */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hint (3 stk) *
                </label>
                <div className="space-y-2">
                  {formData.hints.map((hint, index) => (
                    <input
                      key={index}
                      type="text"
                      value={hint}
                      onChange={(e) => updateHint(index, e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder={`Hint ${index + 1}`}
                      required
                    />
                  ))}
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-indigo-600 text-white py-3 px-4 rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {submitting ? 'Lagrer...' : 'Legg til spørsmål'}
              </button>
            </form>
          </div>

          {/* Questions List */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Eksisterende spørsmål</h2>
            
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-2"></div>
                <p className="text-gray-500">Laster spørsmål...</p>
              </div>
            ) : questions.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">Ingen spørsmål funnet</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {questions.map((question) => (
                  <div key={question.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-gray-900">{question.category}</span>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          question.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
                          question.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {question.difficulty === 'easy' ? 'Lett' :
                           question.difficulty === 'medium' ? 'Middels' : 'Vanskelig'}
                        </span>
                      </div>
                      <button
                        onClick={() => handleDelete(question.id)}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Slett
                      </button>
                    </div>
                    
                    <p className="text-sm text-gray-700 mb-2 font-medium">{question.text}</p>
                    <p className="text-xs text-gray-500 mb-2">
                      <strong>Svar:</strong> {question.correctAnswer}
                    </p>
                    <div className="text-xs text-gray-500">
                      <strong>Hint:</strong> {question.hints.join(', ')}
                    </div>
                    <div className="text-xs text-gray-400 mt-2">
                      Lagt til: {question.createdAt.toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Statistics */}
        <div className="mt-8 bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Statistikk</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-indigo-600">{questions.length}</div>
              <div className="text-sm text-gray-500">Totalt spørsmål</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {questions.filter(q => q.difficulty === 'easy').length}
              </div>
              <div className="text-sm text-gray-500">Lett</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {questions.filter(q => q.difficulty === 'medium').length}
              </div>
              <div className="text-sm text-gray-500">Middels</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {questions.filter(q => q.difficulty === 'hard').length}
              </div>
              <div className="text-sm text-gray-500">Vanskelig</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 