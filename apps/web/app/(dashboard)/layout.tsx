import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import DashboardSidebar from '@/components/DashboardSidebar';
import DashboardHeader from '@/components/DashboardHeader';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <DashboardSidebar user={user} />
      <div className="lg:ml-64">
        <DashboardHeader user={user} />
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
