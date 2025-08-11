'use client';

import { useState, useEffect } from 'react';
import { addDoc, collection, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';

export default function QuestionForm() {
  const [formData, setFormData] = useState({
    kategori: '',
    vanskelighetsgrad: '',
    spørsmålstekst: '',
    riktig_svar: '',
    hint_1: '',
    hint_2: '',
    hint_3: '',
  });

  const [questions, setQuestions] = useState<any[]>([]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'questions'), formData);
      alert('Spørsmål lagret!');
      setFormData({
        kategori: '',
        vanskelighetsgrad: '',
        spørsmålstekst: '',
        riktig_svar: '',
        hint_1: '',
        hint_2: '',
        hint_3: '',
      });
      fetchQuestions(); // Oppdater liste etter innsending
    } catch (err) {
      console.error('Feil ved lagring:', err);
    }
  };

  const fetchQuestions = async () => {
    const snapshot = await getDocs(collection(db, 'questions'));
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setQuestions(data);
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  return (
    <div className="max-w-3xl mx-auto mt-10 space-y-10">
      <form onSubmit={handleSubmit} className="space-y-4">
        {['kategori', 'vanskelighetsgrad', 'spørsmålstekst', 'riktig_svar', 'hint_1', 'hint_2', 'hint_3'].map(field => (
          <div key={field}>
            <label className="block font-semibold capitalize">{field.replace('_', ' ')}</label>
            <input
              name={field}
              value={(formData as any)[field]}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 p-2 rounded"
            />
          </div>
        ))}
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
          Lagre spørsmål
        </button>
      </form>

      <hr className="my-6" />

      <div>
        <h2 className="text-xl font-bold mb-2">Lagrede spørsmål:</h2>
        {questions.length === 0 ? (
          <p>Ingen spørsmål enda.</p>
        ) : (
          <ul className="space-y-4">
            {questions.map((q, index) => (
              <li key={q.id} className="border p-4 rounded bg-gray-50">
                <strong>{index + 1}. {q.spørsmålstekst}</strong>
                <p><em>Kategori:</em> {q.kategori} | <em>Vanskelighetsgrad:</em> {q.vanskelighetsgrad}</p>
                <p><em>Riktig svar:</em> {q.riktig_svar}</p>
                <ul className="list-disc pl-5 text-sm text-gray-700">
                  <li>{q.hint_1}</li>
                  <li>{q.hint_2}</li>
                  <li>{q.hint_3}</li>
                </ul>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
