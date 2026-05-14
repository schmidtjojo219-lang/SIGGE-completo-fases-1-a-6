'use client';

import { useState } from 'react';

interface DashboardHeaderProps {
  user: {
    userId: string;
    email: string;
    gremioId: string;
    nivelAcessoId: string;
    isSuperAdmin: boolean;
  };
}

export default function DashboardHeader({ user }: DashboardHeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="lg:hidden">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        <div className="flex items-center gap-4 ml-auto">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {user.email}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {user.isSuperAdmin ? 'Super Admin' : 'Membro'}
            </p>
          </div>
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold">
            {user.email.charAt(0).toUpperCase()}
          </div>
        </div>
      </div>
    </header>
  );
}
