'use client';

import dynamic from 'next/dynamic';

// Dynamisk import av FirebaseAuthUI uten SSR
const FirebaseAuthUI = dynamic(() => import('../../components/FirebaseAuthUI'), {
  ssr: false,
});

export default function LoginPage() {
  return (
    <div className="flex justify-center items-center min-h-screen">
      <FirebaseAuthUI />
    </div>
  );
}
