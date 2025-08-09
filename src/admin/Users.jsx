import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  MoreVertical, 
  Edit, 
  Trash2, 
  Eye,
  RefreshCw,
  Download,
  UserPlus,
  Users as UsersIcon,
  UserCheck,
  UserX,
  Calendar
} from 'lucide-react';
import AdminLayout from './components/AdminLayout';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const [stats, setStats] = useState({});
  const [selectedUser, setSelectedUser] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [actionType, setActionType] = useState('');
  const [showUserModal, setShowUserModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Fetch users data
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const params = new URLSearchParams({
        page: currentPage,
        limit: 10,
        search: searchTerm,
        status: statusFilter,
        role: roleFilter
      });
      
      console.log('Frontend - Role filter value:', roleFilter);
      console.log('Frontend - Status filter value:', statusFilter);
      console.log('Frontend - Search term:', searchTerm);
      console.log('Frontend - Fetching users with params:', params.toString());

      const response = await fetch(`https://depression-41o5.onrender.com/api/users?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Frontend - Users received:', data.users.length);
        console.log('Frontend - Sample user:', data.users[0]);
        setUsers(data.users);
        setPagination(data.pagination);
      } else {
        console.error('Failed to fetch users');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch user statistics
  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://depression-41o5.onrender.com/api/users/stats', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  // Real-time updates (polling every 30 seconds)
  useEffect(() => {
    fetchUsers();
    fetchStats();

    const interval = setInterval(() => {
      fetchUsers();
      fetchStats();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [currentPage, searchTerm, statusFilter, roleFilter]);

  // Handle user deletion
  const handleDeleteUser = async (userId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`https://depression-41o5.onrender.com/api/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        fetchUsers();
        fetchStats();
        setShowDeleteModal(false);
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to delete user');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Failed to delete user');
    }
  };

  // Handle deactivate user
  const handleDeactivateUser = async (userId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`https://depression-41o5.onrender.com/api/users/${userId}/deactivate`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        console.log('User deactivated successfully');
        fetchUsers(); // Refresh the user list
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to deactivate user');
      }
    } catch (error) {
      console.error('Error deactivating user:', error);
      alert('Failed to deactivate user');
    }
  };

  // Handle make admin
  const handleMakeAdmin = async (userId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`https://depression-41o5.onrender.com/api/users/${userId}/make-admin`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        console.log('User made admin successfully');
        fetchUsers(); // Refresh the user list
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to make user admin');
      }
    } catch (error) {
      console.error('Error making user admin:', error);
      alert('Failed to make user admin');
    }
  };

  // Handle action button clicks
  const handleActionClick = (user, action) => {
    setSelectedUser(user);
    setActionType(action);
    setShowConfirmModal(true);
  };

  // Handle confirm action
  const handleConfirmAction = () => {
    if (!selectedUser) return;

    if (actionType === 'deactivate') {
      handleDeactivateUser(selectedUser.id);
    } else if (actionType === 'make-admin') {
      handleMakeAdmin(selectedUser.id);
    }

    setShowConfirmModal(false);
    setSelectedUser(null);
    setActionType('');
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Get status badge color
  const getStatusColor = (status) => {
    return status === 'active' 
      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
      : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
  };

  // Remove stats, modals, and unnecessary actions. Redesign table as per new requirements.
  return (
    <AdminLayout pageName="Users">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-1 mb-4">
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <UsersIcon className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
            User Management
          </h1>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">
            Manage user accounts, roles, and permissions
          </p>
        </div>

        {/* Filters and Search */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 sm:p-6 shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="flex flex-col gap-4">
            {/* Search Bar */}
            <div className="w-full">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="flex-1 px-3 sm:px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                style={{ 
                  backgroundImage: 'none',
                  WebkitAppearance: 'none',
                  MozAppearance: 'none',
                  appearance: 'none'
                }}
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
              {/* Role Filter */}
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="flex-1 px-3 sm:px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                style={{ 
                  backgroundImage: 'none',
                  WebkitAppearance: 'none',
                  MozAppearance: 'none',
                  appearance: 'none'
                }}
              >
                <option value="">All Roles</option>
                <option value="admin">Admin</option>
                <option value="user">User</option>
              </select>
            </div>
          </div>
        </div>

        {/* Users Table - Desktop */}
        <div className="hidden sm:block bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 dark:bg-slate-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">Name/User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">Age</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {loading ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-4 text-center text-slate-500 dark:text-slate-400">Loading users...</td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-4 text-center text-slate-500 dark:text-slate-400">No users found</td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-slate-700">
                      <td className="px-6 py-4 whitespace-nowrap font-semibold text-slate-900 dark:text-slate-100">{user.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-slate-900 dark:text-slate-100">{user.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-slate-900 dark:text-slate-100">{user.age !== null ? user.age : '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300'}`}>{user.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'User'}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${user.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{user.status}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex gap-2">
                          <button
                            className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700" 
                            title="Deactivate"
                            onClick={() => handleActionClick(user, 'deactivate')}
                          >
                            <UserX className="w-4 h-4 text-red-500" />
                          </button>
                          <button
                            className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700" 
                            title="Make Admin"
                            onClick={() => handleActionClick(user, 'make-admin')}
                          >
                            <UserCheck className="w-4 h-4 text-purple-600" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

        {/* Users Cards - Mobile */}
        <div className="sm:hidden space-y-4">
          {loading ? (
            <div className="text-center py-8 text-slate-500 dark:text-slate-400">Loading users...</div>
          ) : users.length === 0 ? (
            <div className="text-center py-8 text-slate-500 dark:text-slate-400">No users found</div>
          ) : (
            users.map((user) => (
              <div key={user.id} className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-700">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-slate-900 dark:text-slate-100 truncate">{user.name}</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 truncate">{user.email}</p>
                  </div>
                  <div className="flex gap-2 ml-3">
                    <button
                      className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700" 
                      title="Deactivate"
                      onClick={() => handleActionClick(user, 'deactivate')}
                    >
                      <UserX className="w-4 h-4 text-red-500" />
                    </button>
                    <button
                      className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700" 
                      title="Make Admin"
                      onClick={() => handleActionClick(user, 'make-admin')}
                    >
                      <UserCheck className="w-4 h-4 text-purple-600" />
                    </button>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 text-sm">
                  <div className="flex items-center gap-1">
                    <span className="text-slate-500 dark:text-slate-400">Age:</span>
                    <span className="text-slate-900 dark:text-slate-100">{user.age !== null ? user.age : '-'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300'}`}>
                      {user.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'User'}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${user.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {user.status}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="bg-white dark:bg-slate-800 rounded-xl p-4 sm:p-6 shadow-sm border border-slate-200 dark:border-slate-700">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-sm text-slate-500 dark:text-slate-400 text-center sm:text-left">
                <span className="hidden sm:inline">
                  Showing {((currentPage - 1) * 10) + 1} to {Math.min(currentPage * 10, pagination.totalUsers)} of {pagination.totalUsers} users
                </span>
                <span className="sm:hidden">
                  {pagination.totalUsers} users total
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={!pagination.hasPrev}
                  className="px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-700"
                >
                  <span className="hidden sm:inline">Previous</span>
                  <span className="sm:hidden">Prev</span>
                </button>
                <span className="px-3 py-2 text-sm text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-700 rounded-md">
                  {currentPage} / {pagination.totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={!pagination.hasNext}
                  className="px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-700"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
            </div>
          </div>

        {/* Confirmation Modal */}
        {showConfirmModal && selectedUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-800 rounded-xl p-4 sm:p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
                {actionType === 'deactivate' ? 'Deactivate User' : 'Make Admin'}
              </h3>
              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 mb-6">
                {actionType === 'deactivate' 
                  ? `Are you sure you want to deactivate ${selectedUser.name}? This will mark them as inactive.`
                  : `Are you sure you want to make ${selectedUser.name} an admin? This will grant them admin privileges.`
                }
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => setShowConfirmModal(false)}
                  className="flex-1 px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-md text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmAction}
                  className={`flex-1 px-4 py-2 text-white rounded-md ${
                    actionType === 'deactivate' 
                      ? 'bg-red-600 hover:bg-red-700' 
                      : 'bg-purple-600 hover:bg-purple-700'
                  }`}
                >
                  {actionType === 'deactivate' ? 'Deactivate' : 'Make Admin'}
                </button>
              </div>
            </div>
          </div>
        )}
    </AdminLayout>
  );
};

export default Users; 