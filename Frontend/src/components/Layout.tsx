
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Button, DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger, Sheet, SheetContent, SheetTrigger } from './ui';
import { Wallet, BarChart3, LogOut, User, Settings, LayoutGrid, ArrowRightLeft } from 'lucide-react';
import './Layout.css';


type LayoutProps = {
  children: React.ReactNode;
};

export function Layout({ children }: LayoutProps) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path;

  const navigationItems = [
    { path: '/accounts', label: 'Accounts', icon: Wallet },
    { path: '/transactions', label: 'Transactions', icon: BarChart3 },
    { path: '/transfers', label: 'Transfers', icon: ArrowRightLeft },
    { path: '/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="layout-grid layout-desktop">
      <div className="sidebar">
        <div className="sidebar-container">
          <div className="sidebar-header">
            <Link to="/" className="sidebar-logo">
              <Wallet size={24} />
              <span>FinanceTracker</span>
            </Link>
          </div>
          <div className="sidebar-nav">
            <nav className="nav-grid">
              {navigationItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`nav-link ${isActive(item.path) ? 'active' : ''}`}
                >
                  <item.icon size={16} />
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </div>
      <div className="main-container">
        <header className="main-header">
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="mobile-menu-btn"
              >
                <LayoutGrid size={20} />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="mobile-nav">
              <nav className="mobile-nav-grid">
                <Link
                  to="/"
                  className="mobile-nav-logo"
                >
                  <Wallet size={24} />
                  <span className="sr-only">FinanceTracker</span>
                </Link>
                {navigationItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`mobile-nav-link ${isActive(item.path) ? 'active' : ''}`}
                  >
                    <item.icon size={20} />
                    {item.label}
                  </Link>
                ))}
              </nav>
            </SheetContent>
          </Sheet>

          <div className="header-spacer">
            {/* Add search or other header elements here if needed */}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary" size="icon" className="user-menu-btn">
                <User size={20} />
                <span className="sr-only">Toggle user menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>
                <div className="user-menu-info">
                  <p className="user-menu-name">{user?.fullName}</p>
                  <p className="user-menu-email">
                    {user?.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate('/settings')}>
                <Settings size={16} style={{ marginRight: '8px' }} />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleLogout()}>
                <LogOut size={16} style={{ marginRight: '8px' }} />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>
        <main className="main-content">
          {children}
        </main>
      </div>
    </div>
  );
}