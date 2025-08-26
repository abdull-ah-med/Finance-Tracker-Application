
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Wallet, BarChart3, LogOut, User } from 'lucide-react';

type LayoutProps = {
  children: React.ReactNode;
};

export function Layout({ children }: LayoutProps) {
  const { user, logout } = useAuth();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const navigationItems = [
    { path: '/accounts', label: 'Accounts', icon: Wallet },
    { path: '/transactions', label: 'Transactions', icon: BarChart3 },
  ];

  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-72 glass z-20">
        <div className="flex items-center h-20 px-8">
          <Link to="/" className="flex items-center gap-3 font-bold text-xl text-white">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-gray-800 to-black flex items-center justify-center border border-gray-700">
              <Wallet className="h-5 w-5 text-white" />
            </div>
            <span>Finance Tracker</span>
          </Link>
        </div>
        
        <nav className="flex-1 py-8 px-6 space-y-3">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-4 px-4 py-3 rounded-xl font-medium transition-all duration-300 ${
                  isActive(item.path) 
                    ? 'bg-white bg-opacity-10 text-white shadow-lg' 
                    : 'text-white text-opacity-70 hover:bg-white hover:bg-opacity-5 hover:text-white'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto p-6">
          <div className="flex items-center gap-4 p-4 glass-card rounded-xl">
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-gray-800 to-black flex items-center justify-center font-bold text-lg text-white border border-gray-700">
              {user?.fullName?.[0] || <User className="h-5 w-5" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {user?.fullName || 'User'}
              </p>
              <p className="text-xs text-white text-opacity-60 truncate">
                {user?.email || 'user@example.com'}
              </p>
            </div>
          </div>
          <Button 
            onClick={logout} 
            className="mt-4 w-full btn-outline-modern flex items-center gap-2 px-4 py-2 rounded-xl"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Mobile header */}
        <header className="md:hidden glass backdrop-blur-lg">
          <div className="flex items-center justify-between h-16 px-4">
            <Link to="/" className="flex items-center gap-2 font-bold text-lg text-white">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-gray-800 to-black flex items-center justify-center border border-gray-700">
                <Wallet className="h-4 w-4 text-white" />
              </div>
              <span>Finance</span>
            </Link>
            
            <nav className="flex items-center gap-2">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-1 px-3 py-2 rounded-lg font-medium transition-all duration-300 ${
                      isActive(item.path) 
                        ? 'bg-white bg-opacity-10 text-white' 
                        : 'text-white text-opacity-70 hover:bg-white hover:bg-opacity-5'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="text-sm">{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-gray-800 to-black flex items-center justify-center font-bold text-sm text-white border border-gray-700">
                {user?.fullName?.[0] || <User className="h-4 w-4" />}
              </div>
              <Button 
                onClick={logout} 
                size="sm" 
                className="btn-outline-modern p-2"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 p-6 lg:p-8 space-y-8">
          {children}
        </main>
      </div>
    </div>
  );
}