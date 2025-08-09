import React, { useState } from 'react';
import {
  Bell,
  Search,
  User,
  ChevronDown,
  Sun,
  Moon,
  Menu,
  Calendar
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../components/NotificationProvider';

const AdminHeader = ({ pageName = "Dashboard", onMenuClick, selectedYear, selectedMonth, onYearChange, onMonthChange }) => {
  const { user, logout } = useAuth();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const {
    notifications,
    unreadCount,
    dropdownOpen,
    setDropdownOpen,
    markAllAsRead
  } = useNotification();

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
  };

  // Check if current page is Dashboard
  const isDashboard = pageName === "Dashboard";

  return (
    <header className="h-16 sm:h-20 bg-white dark:bg-slate-900 lg:rounded-tr-2xl shadow-md border-b border-slate-200 dark:border-slate-700 fixed top-0 lg:left-64 left-0 right-0 z-30 flex items-center px-4 sm:px-6 lg:px-8 transition-all duration-300">
      {/* Mobile menu button */}
      <button
        onClick={onMenuClick}
        className="lg:hidden p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors mr-3"
      >
        <Menu className="w-5 h-5 text-slate-600 dark:text-slate-400" />
      </button>

      {/* Conditional Header Content */}
      <div className="flex-1">
        {isDashboard ? (
          /* Date Filter Controls for Dashboard */
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden sm:flex items-center gap-2">
              <Calendar className="w-4 h-4 text-slate-600 dark:text-slate-400" />
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Filter:</span>
            </div>
            
            <div className="flex gap-1 sm:gap-2">
              <select
                value={selectedYear}
                onChange={(e) => onYearChange && onYearChange(parseInt(e.target.value))}
                className="px-2 sm:px-3 py-1 text-xs sm:text-sm border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value={2024}>2024</option>
                <option value={2025}>2025</option>
                <option value={2026}>2026</option>
              </select>
              
              <select
                value={selectedMonth}
                onChange={(e) => onMonthChange && onMonthChange(parseInt(e.target.value))}
                className="px-2 sm:px-3 py-1 text-xs sm:text-sm border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value={1}>Jan</option>
                <option value={2}>Feb</option>
                <option value={3}>Mar</option>
                <option value={4}>Apr</option>
                <option value={5}>May</option>
                <option value={6}>Jun</option>
                <option value={7}>Jul</option>
                <option value={8}>Aug</option>
                <option value={9}>Sep</option>
                <option value={10}>Oct</option>
                <option value={11}>Nov</option>
                <option value={12}>Dec</option>
              </select>
            </div>
          </div>
        ) : (
          /* Page Name for other pages */
          <h1 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100">
            {pageName}
          </h1>
        )}
      </div>

      {/* Right side - Actions */}
      <div className="flex items-center gap-4">
        {/* Dark mode toggle */}
        <button
          onClick={toggleDarkMode}
          className="p-1 text-slate-500 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
        >
          {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            className="relative p-1 text-slate-500 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
            onClick={() => {
              setDropdownOpen(!dropdownOpen);
              if (!dropdownOpen) markAllAsRead();
            }}
          >
            <Bell className="h-4 w-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 h-3 w-3 bg-pink-500 text-white text-[10px] rounded-full flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>
          {/* Notification Dropdown */}
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg py-2 z-20">
              <div className="px-4 py-2 border-b border-slate-200 dark:border-slate-700 font-semibold text-slate-900 dark:text-slate-100">
                Notifications
              </div>
              {notifications.length === 0 ? (
                <div className="px-4 py-4 text-sm text-slate-500 dark:text-slate-400">No notifications</div>
              ) : (
                <ul className="max-h-64 overflow-y-auto">
                  {notifications.map(n => (
                    <li key={n.id} className={`px-4 py-2 text-sm border-b border-slate-100 dark:border-slate-800 ${n.read ? 'text-slate-500 dark:text-slate-400' : 'text-slate-900 dark:text-slate-100 font-medium'}`}>
                      {n.message}
                      <span className="block text-xs text-slate-400 dark:text-slate-500 mt-1">{new Date(n.created_at).toLocaleString()}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>

        {/* User Profile */}
        <div className="relative">
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-2 p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            <div className="h-7 w-7 bg-indigo-200 dark:bg-slate-700 rounded-full flex items-center justify-center">
              <User className="h-3.5 w-3.5 text-white" />
            </div>
            <div className="text-left hidden sm:block">
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                {user?.name || user?.email}
              </p>
              <p className="text-xs text-slate-400 dark:text-slate-400">Admin</p>
            </div>
            <ChevronDown className="h-3 w-3 text-slate-400 dark:text-slate-300 hidden sm:block" />
          </button>

          {/* Profile Dropdown */}
          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-44 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg py-2 z-20">
              <div className="px-4 py-2 border-b border-slate-200 dark:border-slate-700">
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  {user?.name || user?.email}
                </p>
                <p className="text-xs text-slate-400 dark:text-slate-400">
                  {user?.email}
                </p>
              </div>
              <button
                onClick={logout}
                className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-b-xl"
              >
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;