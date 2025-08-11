'use client';

import React, { useEffect, useRef } from 'react';
import * as firebaseui from 'firebaseui';
import 'firebaseui/dist/firebaseui.css';
import {
  getAuth,
  GoogleAuthProvider,
  EmailAuthProvider,
  PhoneAuthProvider,
} from 'firebase/auth';
import { app } from '../lib/firebase';
import { useRouter } from 'next/navigation';

export default function FirebaseAuthUI() {
  const uiRef = useRef<firebaseui.auth.AuthUI | null>(null);
  const router = useRouter();

  useEffect(() => {
    const auth = getAuth(app);

    if (!uiRef.current) {
      uiRef.current =
        firebaseui.auth.AuthUI.getInstance() ||
        new firebaseui.auth.AuthUI(auth);
    }

    uiRef.current.start('#firebaseui-auth-container', {
      signInFlow: 'popup', // 🔧 Viktig: unngå redirect-loop
      signInOptions: [
        GoogleAuthProvider.PROVIDER_ID,
        EmailAuthProvider.PROVIDER_ID,
        PhoneAuthProvider.PROVIDER_ID,
      ],
      callbacks: {
        signInSuccessWithAuthResult: () => {
          router.push('/lobby');
          return false; // 🔒 Unngå redirect fra Firebase selv
        },
      },
    });

    return () => {
      uiRef.current?.reset();
    };
  }, [router]);

  return <div id="firebaseui-auth-container" />;
}
