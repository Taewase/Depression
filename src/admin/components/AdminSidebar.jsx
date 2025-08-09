import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Stethoscope,
  LogOut,
  Brain,
  BarChart3,
  X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const AdminSidebar = ({ isOpen, onClose }) => {
  const location = useLocation();
  const { logout } = useAuth();

  const menuItems = [
    { path: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/admin/users', icon: Users, label: 'Users' },
    { path: '/admin/demographics', icon: BarChart3, label: 'Demographics' },
    { path: '/admin/assessments', icon: Stethoscope, label: 'Assessments' },
  ];

  const isActive = (path) => {
    if (path === '/admin') {
      return location.pathname === '/admin';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className={`flex flex-col h-full bg-white border-r border-slate-200 dark:bg-slate-900 dark:border-slate-700 text-slate-800 dark:text-slate-100 w-64 fixed left-0 top-0 z-50 transform transition-transform duration-300 ease-in-out ${
      isOpen ? 'translate-x-0' : '-translate-x-full'
    } lg:translate-x-0`}>
      {/* Logo/Brand Section */}
      <div className="flex items-center justify-between h-20 border-b border-slate-200 dark:border-slate-700 px-4">
        <div className="flex items-center">
          <Brain size={28} className="text-indigo-500" />
          <h1 className="text-2xl font-bold ml-2 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            MindCare
          </h1>
        </div>
        {/* Close button for mobile */}
        <button
          onClick={onClose}
          className="lg:hidden p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
      
      {/* Navigation Links */}
      <nav className="flex-grow p-4">
        <ul>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActiveLink = isActive(item.path);
            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center px-4 py-3 my-1 rounded-lg transition-colors duration-200 hover:bg-slate-100 dark:hover:bg-slate-800 ${
                    isActiveLink ? 'bg-indigo-100 dark:bg-indigo-700 text-indigo-700 dark:text-white' : 'text-slate-700 dark:text-slate-200'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="ml-4 font-medium">{item.label}</span>
                </Link>
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

export default AdminSidebar; 