
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Package2 } from 'lucide-react';

type LayoutProps = {
  children: React.ReactNode;
};

export function Layout({ children }: LayoutProps) {
  const { user, logout } = useAuth();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const navigationItems = [
    { path: '/accounts', label: 'Accounts' },
    { path: '/transactions', label: 'Transactions' },
  ];

  return (
    <div className="min-h-screen w-full bg-base-100 flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-base-200/80 backdrop-blur border-r border-base-300 shadow-lg z-20">
        <div className="flex items-center h-16 px-6 border-b border-base-300">
          <Link to="/" className="flex items-center gap-3 font-bold text-xl text-primary">
            <Package2 className="h-7 w-7" />
            <span>Finance Tracker</span>
          </Link>
        </div>
        <nav className="flex-1 py-6 px-4 space-y-2">
          {navigationItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-2 rounded-lg font-medium transition-all duration-150 hover:bg-primary/10 hover:text-primary ${
                isActive(item.path) ? 'bg-primary/10 text-primary' : 'text-base-content/70'
              }`}
            >
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
        <div className="mt-auto px-6 pb-6">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-primary text-white flex items-center justify-center font-bold text-lg">
              {user?.fullName?.[0]}
            </div>
            <span className="text-base font-medium text-base-content/80 truncate max-w-[120px]">{user?.fullName}</span>
          </div>
          <Button onClick={logout} size="sm" className="mt-4 w-full btn btn-error btn-outline">Logout</Button>
        </div>
      </aside>

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Mobile header with inline nav */}
        <header className="md:hidden flex items-center h-16 px-4 bg-base-200/80 border-b border-base-300 shadow-sm z-10">
          <Link to="/" className="flex items-center gap-2 font-bold text-lg text-primary">
            <Package2 className="h-6 w-6" />
            <span>Finance Tracker</span>
          </Link>
          <nav className="flex-1 flex items-center justify-center gap-4">
            {navigationItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-1 px-2 py-1 rounded-md font-medium transition-all duration-150 hover:bg-primary/10 hover:text-primary ${
                  isActive(item.path) ? 'bg-primary/10 text-primary' : 'text-base-content/70'
                }`}
              >
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-base">
              {user?.fullName?.[0]}
            </div>
            <Button onClick={logout} size="sm" className="btn btn-error btn-outline ml-2">Logout</Button>
          </div>
        </header>
        {/* Main content */}
        <main className="flex-1 flex flex-col gap-4 p-4 lg:gap-6 lg:p-8 bg-base-100">
          {children}
        </main>
      </div>
    </div>
  );
}