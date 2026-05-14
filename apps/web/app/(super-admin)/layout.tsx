import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user || !user.isSuperAdmin) {
    redirect('/dashboard');
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="flex items-center gap-3">
          <span className="text-2xl">👑</span>
          <div>
            <h1 className="font-bold text-gray-900 dark:text-white">Super Admin</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Painel de controle do SaaS
            </p>
          </div>
        </div>
      </div>
      <main className="p-6">
        {children}
      </main>
    </div>
  );
}
