'use client';

import React from 'react';
import CreateLobbyButton from '@components/CreateLobbyButton';
import JoinLobbyForm from '@components/JoinLobbyForm';

export default function LobbyPage() {
  return (
    <div className="flex flex-col justify-center items-center min-h-screen gap-8 p-4">
      <h1 className="text-3xl font-bold">Velkommen til Quizino</h1>
      <p className="text-lg text-center max-w-md">
        Opprett en ny lobby eller bli med i en eksisterende.
      </p>

      <div className="flex flex-col gap-4 w-full max-w-sm">
        <CreateLobbyButton />
        <JoinLobbyForm />
      </div>
    </div>
  );
}
