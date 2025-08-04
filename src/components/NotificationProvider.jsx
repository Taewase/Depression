import React, { createContext, useContext, useState } from 'react';

const NotificationContext = createContext();

export function useNotification() {
  return useContext(NotificationContext);
}

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const showNotification = (message, type = 'info') => {
    setNotifications((prev) => [
      { id: Date.now(), message, type, read: false, created_at: new Date() },
      ...prev,
    ]);
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        showNotification,
        unreadCount,
        markAllAsRead,
        dropdownOpen,
        setDropdownOpen,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};
