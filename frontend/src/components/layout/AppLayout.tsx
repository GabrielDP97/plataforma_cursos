import { Outlet } from 'react-router-dom';
import { AppHeader } from './AppHeader';
import { AppSidebar } from './AppSidebar';
import { AppFooter } from './AppFooter';
import { HashScrollHandler } from './HashScrollHandler';
import { useAuth } from '../../providers/auth-provider';
import { Skeleton } from '../ui/skeleton';

export function AppLayout() {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col bg-gray-50 dark:bg-gray-950">
        <AppHeader />
        <div className="flex flex-1">
          <div className="hidden lg:flex lg:w-56 lg:flex-col lg:border-r lg:border-gray-200 lg:bg-gray-50 dark:lg:border-gray-700 dark:lg:bg-gray-900">
            <div className="flex flex-1 flex-col gap-4 p-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
          <main className="flex-1 p-6">
            <Skeleton className="h-8 w-64 mb-4" />
            <Skeleton className="h-64 w-full" />
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 dark:bg-gray-950">
      <HashScrollHandler />
      <AppHeader />
      <div className="flex flex-1">
        <AppSidebar />
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
            <Outlet />
          </div>
        </main>
      </div>
      <AppFooter />
    </div>
  );
}
