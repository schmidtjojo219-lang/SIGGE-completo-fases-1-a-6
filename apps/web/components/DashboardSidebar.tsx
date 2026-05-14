'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface DashboardSidebarProps {
  user: {
    userId: string;
    email: string;
    gremioId: string;
    nivelAcessoId: string;
    isSuperAdmin: boolean;
  };
}

const menuItems = [
  { href: '/dashboard', label: 'Dashboard', icon: '📊' },
  { href: '/documentos', label: 'Documentos', icon: '📄' },
  { href: '/patrimonio', label: 'Patrimônio', icon: '🏛️' },
  { href: '/eleicoes', label: 'Eleições', icon: '🗳️' },
  { href: '/financeiro', label: 'Financeiro', icon: '💰' },
  { href: '/configuracoes', label: 'Configurações', icon: '⚙️' },
];

export default function DashboardSidebar({ user }: DashboardSidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 z-40 w-64 h-screen bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 hidden lg:block">
      <div className="h-full flex flex-col">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">S</span>
            </div>
            <div>
              <h2 className="font-bold text-gray-900 dark:text-white">SIGGE</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">Gestão Estudantil</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {menuItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        {user.isSuperAdmin && (
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <Link
              href="/super-admin"
              className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-purple-700 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors"
            >
              <span className="text-lg">👑</span>
              Super Admin
            </Link>
          </div>
        )}

        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <form action="/api/auth/logout" method="POST">
            <button
              type="submit"
              className="flex items-center gap-3 px-4 py-2.5 w-full rounded-lg text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            >
              <span className="text-lg">🚪</span>
              Sair
            </button>
          </form>
        </div>
      </div>
    </aside>
  );
}
