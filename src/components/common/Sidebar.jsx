import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, Stethoscope, BookOpen, MessageSquare, User, LogOut, BarChart3 } from 'lucide-react';
import { Brain } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Sidebar = () => {
  const { logout } = useAuth();
  const location = useLocation();
  
  const navLinks = [
    { icon: LayoutDashboard, text: 'Dashboard', path: '/dashboard' },
    { icon: Stethoscope, text: 'Assessment', path: '/dashboard/assessment' },
    { icon: BarChart3, text: 'Results', path: '/results' },
    { icon: BookOpen, text: 'Resources', path: '/resources' },
    { icon: MessageSquare, text: 'Support', path: '/support' },
    { icon: User, text: 'Profile', path: '/profile' },
  ];

  const isActiveLink = (linkPath) => {
    if (linkPath === '/dashboard') {
      return location.pathname === '/dashboard';
    }
    return location.pathname.startsWith(linkPath);
  };

  return (
    <div className="flex flex-col h-full bg-white border-r border-slate-200 dark:bg-slate-900 dark:border-slate-700 text-slate-800 dark:text-slate-100 w-64">
      {/* Logo/Brand Section */}
      <div className="flex items-center justify-center h-20 border-b border-slate-200 dark:border-slate-700">
        <Brain size={28} className="text-indigo-500" />
        <h1 className="text-2xl font-bold ml-2 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          MindCare
        </h1>
      </div>
      
      {/* Navigation Links */}
      <nav className="flex-grow p-4">
        <ul>
          {navLinks.map((link) => {
            const isActive = isActiveLink(link.path);
            return (
              <li key={link.path}>
                <NavLink
                  to={link.path}
                  className={`flex items-center px-4 py-3 my-1 rounded-lg transition-colors duration-200 hover:bg-slate-100 dark:hover:bg-slate-800 ${
                    isActive ? 'bg-indigo-100 dark:bg-indigo-700 text-indigo-700 dark:text-white' : 'text-slate-700 dark:text-slate-200'
                  }`}
                >
                  <link.icon className="w-5 h-5" />
                  <span className="ml-4 font-medium">{link.text}</span>
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>
      
      {/* Logout Section */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-700">
        <button
          onClick={logout}
          className="flex items-center w-full px-4 py-3 text-left rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <LogOut className="w-5 h-5" />
          <span className="ml-4 font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;