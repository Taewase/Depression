import React, { useState } from 'react';
import AdminSidebar from './AdminSidebar';
import AdminHeader from './AdminHeader';

const AdminLayout = ({ children, pageName = "Dashboard", selectedYear, selectedMonth, onYearChange, onMonthChange }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <AdminSidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
      />
      
      {/* Main Content Area */}
      <div className="lg:ml-64">
        {/* Header */}
        <AdminHeader 
          pageName={pageName} 
          onMenuClick={() => setSidebarOpen(true)}
          selectedYear={selectedYear}
          selectedMonth={selectedMonth}
          onYearChange={onYearChange}
          onMonthChange={onMonthChange}
        />
        
        {/* Page Content */}
        <main className="pt-20 sm:pt-28 p-4 sm:p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout; 