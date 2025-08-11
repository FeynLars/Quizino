'use client';

import React from 'react';
import { LobbyUser } from '@/types/lobby';

interface Props {
  users: LobbyUser[];
}

const LobbyUserList: React.FC<Props> = ({ users }) => {
  return (
    <div className="p-4 border rounded shadow-md bg-white">
      <h2 className="text-xl font-semibold mb-2">Deltakere</h2>
      <ul className="space-y-2">
        {users.map((user) => (
          <li key={user.uid} className="flex items-center justify-between text-gray-800">
            <span>
              {user.name} {user.isHost && <span className="text-xs text-blue-500">(Host)</span>}
            </span>
            <span
              className={`text-sm font-medium ${
                user.ready ? 'text-green-600' : 'text-red-500'
              }`}
            >
              {user.ready ? 'Klar' : 'Venter'}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default LobbyUserList;
