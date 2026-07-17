import React from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { 
  LayoutDashboard, 
  Users, 
  CreditCard, 
  Settings, 
  LogOut,
  Church,
  Sun,
  Moon,
  FileText,
  Shield
} from 'lucide-react';

export default function Layout() {
  const { logout } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  const navigation = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Members', href: '/members', icon: Users },
    { name: 'Offerings', href: '/offerings', icon: CreditCard },
    { name: 'Reports', href: '/reports', icon: FileText },
    { name: 'Staff', href: '/staff', icon: Shield },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  async function handleLogout() {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out', error);
    }
  }

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 font-sans transition-colors duration-300">
      {/* Sidebar */}
      <div className="w-72 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col shadow-sm z-20 transition-colors duration-300">
        <div className="h-20 flex items-center px-6 border-b border-slate-100 dark:border-slate-800 bg-gradient-to-r from-royal-blue to-blue-900">
          <div className="h-10 w-10 bg-royal-gold rounded-xl flex items-center justify-center mr-3 shadow-md">
            <Church className="h-6 w-6 text-royal-dark" />
          </div>
          <div className="flex flex-col">
            <span className="text-white font-bold leading-tight">Royal Apostolic</span>
            <span className="text-royal-gold text-xs font-semibold tracking-wider uppercase">Church</span>
          </div>
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`
                  flex items-center px-4 py-3 text-sm font-semibold rounded-xl transition-all duration-200
                  ${isActive 
                    ? 'bg-royal-blue text-white shadow-md shadow-blue-900/20 translate-x-1' 
                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                  }
                `}
              >
                <item.icon 
                  className={`flex-shrink-0 h-5 w-5 mr-3 transition-colors ${isActive ? 'text-royal-gold' : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300'}`} 
                />
                {item.name}
              </Link>
            );
          })}
        </nav>
        
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
          <button
            onClick={toggleTheme}
            className="flex w-full items-center px-4 py-3 text-sm font-semibold text-slate-500 dark:text-slate-400 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            {isDarkMode ? (
              <>
                <Sun className="flex-shrink-0 h-5 w-5 mr-3 text-royal-gold" />
                Light Mode
              </>
            ) : (
              <>
                <Moon className="flex-shrink-0 h-5 w-5 mr-3 text-slate-400" />
                Dark Mode
              </>
            )}
          </button>
          
          <button
            onClick={handleLogout}
            className="flex w-full items-center px-4 py-3 text-sm font-semibold text-slate-500 dark:text-slate-400 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 transition-colors group"
          >
            <LogOut className="flex-shrink-0 h-5 w-5 mr-3 text-slate-400 dark:text-slate-500 group-hover:text-red-500 dark:group-hover:text-red-400 transition-colors" />
            Sign Out
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto bg-slate-50/50 dark:bg-slate-950/50 transition-colors duration-300">
        <header className="h-20 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 flex items-center justify-end px-8 sticky top-0 z-10 transition-colors duration-300">
          <div className="flex items-center space-x-4">
            <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-royal-gold to-yellow-200 flex items-center justify-center text-royal-dark font-bold text-sm shadow-sm ring-2 ring-white">
              A
            </div>
          </div>
        </header>
        <main className="p-8 max-w-7xl mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
