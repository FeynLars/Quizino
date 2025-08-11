// app/lobby/[lobbyId]/page.tsx
'use client';
import { redirect } from 'next/navigation';

export default function LobbyPage({ params }: { params: { lobbyId: string } }) {
  redirect(`/game/${params.lobbyId}`);
}
