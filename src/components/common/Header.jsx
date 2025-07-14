import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { UserCircle, Bell, Menu, Sun, Moon, Settings, LogOut, User, ChevronDown } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

const Header = ({ onMenuClick }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileMenuRef = useRef(null);
  
  const getPageTitle = (pathname) => {
    if (pathname.startsWith('/dashboard/assessment')) return 'Assessment';
    if (pathname.startsWith('/dashboard')) return 'Dashboard';
    if (pathname.startsWith('/assessment')) return 'Assessment';
    if (pathname.startsWith('/resources')) return 'Resources';
    if (pathname.startsWith('/support')) return 'Support';
    if (pathname.startsWith('/profile')) return 'Profile';
    if (pathname.startsWith('/results')) return 'Results';
    return 'MindCare';
  };

  const title = getPageTitle(location.pathname);

  // Close profile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleProfileClick = () => {
    setShowProfileMenu(!showProfileMenu);
  };

  const handleLogout = () => {
    logout();
    setShowProfileMenu(false);
  };

  const handleProfileNavigation = (path) => {
    navigate(path);
    setShowProfileMenu(false);
  };

  return (
    <header className="bg-white dark:bg-slate-900 shadow-sm z-10">
      <div className="flex items-center justify-between h-16 px-6">
        <div className="flex items-center">
          <button onClick={onMenuClick} className="lg:hidden mr-4 text-gray-600 dark:text-slate-200">
            <Menu size={24} />
          </button>
          <h1 className="text-xl font-semibold text-gray-800 dark:text-slate-100">
            {title === 'MindCare' ? (
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                MindCare
              </span>
            ) : (
              title
            )}
          </h1>
        </div>
        <div className="flex items-center space-x-4">
          <button onClick={toggleTheme} className="text-gray-500 dark:text-slate-200 hover:text-indigo-500 dark:hover:text-indigo-400">
            {theme === 'dark' ? <Sun size={22} /> : <Moon size={22} />}
          </button>
          <button className="text-gray-500 hover:text-gray-700 dark:text-slate-200 dark:hover:text-slate-100">
            <Bell size={22} />
          </button>
          
          {/* Profile Dropdown */}
          <div className="relative" ref={profileMenuRef}>
            <button 
              onClick={handleProfileClick}
              className="flex items-center space-x-2 text-gray-700 dark:text-slate-100 hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors"
            >
              <div className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">
                  {user ? user.name.charAt(0).toUpperCase() : 'U'}
                </span>
              </div>
              <span className="text-sm font-medium hidden sm:block">
                {user ? user.name : 'User'}
              </span>
              <ChevronDown size={16} className={`transition-transform ${showProfileMenu ? 'rotate-180' : ''}`} />
            </button>
            
            {/* Dropdown Menu */}
            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-gray-200 dark:border-slate-700 py-2 z-50">
                <div className="px-4 py-3 border-b border-gray-200 dark:border-slate-700">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {user ? user.name : 'User'}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-slate-400">
                    {user ? user.email : 'user@example.com'}
                  </p>
                </div>
                
                <div className="py-1">
                  <button
                    onClick={() => handleProfileNavigation('/profile')}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
                  >
                    <User size={16} className="mr-3" />
                    Profile
                  </button>
                  
                  <button
                    onClick={() => handleProfileNavigation('/results')}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
                  >
                    <UserCircle size={16} className="mr-3" />
                    Assessment Results
                  </button>
                  
                  <button
                    onClick={() => handleProfileNavigation('/profile')}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
                  >
                    <Settings size={16} className="mr-3" />
                    Settings
                  </button>
                </div>
                
                <div className="border-t border-gray-200 dark:border-slate-700 pt-1">
                  <button
                    onClick={handleLogout}
                    className="flex items-center w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  >
                    <LogOut size={16} className="mr-3" />
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header; 