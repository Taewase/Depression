import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Book, Edit, Shield, MapPin, Phone, Calendar, Save, X, Eye, EyeOff, CheckCircle } from 'lucide-react';

const Profile = () => {
  const { user, isAuthenticated, updateUserProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [notification, setNotification] = useState(null);
  
  // Form states
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '+1234567890',
    address: user?.address || 'Lilongwe, Malawi',
    role: user?.role || 'Guest',
    joinDate: user?.joinDate || 'January 2024'
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [errors, setErrors] = useState({});

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-4">Please log in to view your profile</h2>
          <p className="text-slate-600 dark:text-slate-300">You need to be authenticated to access this page.</p>
        </div>
      </div>
    );
  }

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handlePasswordChange = (field, value) => {
    setPasswordData(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
    if (!formData.phone.trim()) newErrors.phone = 'Phone is required';
    if (!formData.address.trim()) newErrors.address = 'Address is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validatePasswordForm = () => {
    const newErrors = {};
    
    if (!passwordData.currentPassword) newErrors.currentPassword = 'Current password is required';
    if (!passwordData.newPassword) newErrors.newPassword = 'New password is required';
    else if (passwordData.newPassword.length < 6) newErrors.newPassword = 'Password must be at least 6 characters';
    if (!passwordData.confirmPassword) newErrors.confirmPassword = 'Please confirm your password';
    else if (passwordData.newPassword !== passwordData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveProfile = () => {
    if (validateForm()) {
      // In a real app, you'd make an API call here
      console.log('Saving profile:', formData);
      updateUserProfile(formData);
      setIsEditing(false);
      showNotification('Profile updated successfully!');
    }
  };

  const handleChangePassword = () => {
    if (validatePasswordForm()) {
      // In a real app, you'd make an API call here
      console.log('Changing password:', passwordData);
      setIsChangingPassword(false);
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      showNotification('Password changed successfully!');
    }
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '+1234567890',
      address: user?.address || 'Lilongwe, Malawi',
      role: user?.role || 'Guest',
      joinDate: user?.joinDate || 'January 2024'
    });
    setErrors({});
  };

  const cancelPasswordChange = () => {
    setIsChangingPassword(false);
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    setErrors({});
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg flex items-center gap-2 ${
          notification.type === 'success' 
            ? 'bg-green-500 text-white' 
            : 'bg-red-500 text-white'
        }`}>
          <CheckCircle size={16} />
          {notification.message}
        </div>
      )}

      {/* Profile Header */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-8 flex items-center space-x-6 mb-8">
        <div className="flex-shrink-0">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-500 to-blue-500 flex items-center justify-center text-white text-4xl font-bold">
            {user?.name?.charAt(0) || 'U'}
          </div>
        </div>
        <div className="flex-grow">
          <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">{user?.name}</h1>
          <p className="text-slate-600 dark:text-slate-300 text-lg">{user?.role}</p>
          <div className="flex items-center gap-4 mt-2 text-sm text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-1">
              <Mail size={14} />
              {user?.email}
            </div>
            <div className="flex items-center gap-1">
              <MapPin size={14} />
              {user?.address}
            </div>
            <div className="flex items-center gap-1">
              <Phone size={14} />
              {user?.phone}
            </div>
          </div>
        </div>
        <div className="ml-auto">
          {!isEditing ? (
            <button 
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
            >
              <Edit size={16} />
              Edit Profile
            </button>
          ) : (
            <div className="flex gap-2">
              <button 
                onClick={handleSaveProfile}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors"
              >
                <Save size={16} />
                Save
              </button>
              <button 
                onClick={cancelEdit}
                className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
              >
                <X size={16} />
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Profile Details */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-8">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-6">Personal Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-700 p-4 rounded-lg">
            <Mail size={20} className="text-indigo-500" />
            <div className="flex-grow">
              <p className="text-sm text-slate-500 dark:text-slate-400">Email Address</p>
              {isEditing ? (
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className={`w-full mt-1 px-3 py-2 border rounded-md bg-white dark:bg-slate-600 text-slate-800 dark:text-slate-100 ${
                    errors.email ? 'border-red-500' : 'border-slate-300 dark:border-slate-500'
                  }`}
                />
              ) : (
                <p className="font-semibold text-slate-700 dark:text-slate-200">{user?.email}</p>
              )}
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </div>
          </div>
          
          <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-700 p-4 rounded-lg">
            <Book size={20} className="text-indigo-500" />
            <div className="flex-grow">
              <p className="text-sm text-slate-500 dark:text-slate-400">Role</p>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.role}
                  onChange={(e) => handleInputChange('role', e.target.value)}
                  className="w-full mt-1 px-3 py-2 border border-slate-300 dark:border-slate-500 rounded-md bg-white dark:bg-slate-600 text-slate-800 dark:text-slate-100"
                />
              ) : (
                <p className="font-semibold text-slate-700 dark:text-slate-200">{user?.role}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-700 p-4 rounded-lg">
            <Phone size={20} className="text-indigo-500" />
            <div className="flex-grow">
              <p className="text-sm text-slate-500 dark:text-slate-400">Phone Number</p>
              {isEditing ? (
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className={`w-full mt-1 px-3 py-2 border rounded-md bg-white dark:bg-slate-600 text-slate-800 dark:text-slate-100 ${
                    errors.phone ? 'border-red-500' : 'border-slate-300 dark:border-slate-500'
                  }`}
                />
              ) : (
                <p className="font-semibold text-slate-700 dark:text-slate-200">{user?.phone}</p>
              )}
              {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
            </div>
          </div>

          <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-700 p-4 rounded-lg">
            <MapPin size={20} className="text-indigo-500" />
            <div className="flex-grow">
              <p className="text-sm text-slate-500 dark:text-slate-400">Address</p>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  className={`w-full mt-1 px-3 py-2 border rounded-md bg-white dark:bg-slate-600 text-slate-800 dark:text-slate-100 ${
                    errors.address ? 'border-red-500' : 'border-slate-300 dark:border-slate-500'
                  }`}
                />
              ) : (
                <p className="font-semibold text-slate-700 dark:text-slate-200">{user?.address}</p>
              )}
              {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
            </div>
          </div>

          <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-700 p-4 rounded-lg">
            <Calendar size={20} className="text-indigo-500" />
            <div className="flex-grow">
              <p className="text-sm text-slate-500 dark:text-slate-400">Member Since</p>
              <p className="font-semibold text-slate-700 dark:text-slate-200">{user?.joinDate || 'January 2024'}</p>
            </div>
          </div>

          <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-700 p-4 rounded-lg">
            <User size={20} className="text-indigo-500" />
            <div className="flex-grow">
              <p className="text-sm text-slate-500 dark:text-slate-400">Full Name</p>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className={`w-full mt-1 px-3 py-2 border rounded-md bg-white dark:bg-slate-600 text-slate-800 dark:text-slate-100 ${
                    errors.name ? 'border-red-500' : 'border-slate-300 dark:border-slate-500'
                  }`}
                />
              ) : (
                <p className="font-semibold text-slate-700 dark:text-slate-200">{user?.name}</p>
              )}
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
            </div>
          </div>
        </div>

        <div className="border-t border-slate-200 dark:border-slate-600 my-8"></div>

        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-6">Account Settings</h2>
        
        {!isChangingPassword ? (
          <div className="flex flex-col sm:flex-row gap-4">
            <button 
              onClick={() => setIsChangingPassword(true)}
              className="flex items-center gap-3 w-full sm:w-auto justify-center px-6 py-3 bg-white dark:bg-slate-700 border-2 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 font-semibold rounded-lg hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors"
            >
              <Shield size={18} />
              Change Password
            </button>
          </div>
        ) : (
          <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-6 space-y-4">
            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Change Password</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Current Password
                </label>
                <div className="relative">
                  <input
                    type={showCurrentPassword ? "text" : "password"}
                    value={passwordData.currentPassword}
                    onChange={(e) => handlePasswordChange('currentPassword', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md bg-white dark:bg-slate-600 text-slate-800 dark:text-slate-100 ${
                      errors.currentPassword ? 'border-red-500' : 'border-slate-300 dark:border-slate-500'
                    }`}
                    placeholder="Enter current password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    {showCurrentPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.currentPassword && <p className="text-red-500 text-xs mt-1">{errors.currentPassword}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    value={passwordData.newPassword}
                    onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md bg-white dark:bg-slate-600 text-slate-800 dark:text-slate-100 ${
                      errors.newPassword ? 'border-red-500' : 'border-slate-300 dark:border-slate-500'
                    }`}
                    placeholder="Enter new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.newPassword && <p className="text-red-500 text-xs mt-1">{errors.newPassword}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={passwordData.confirmPassword}
                    onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md bg-white dark:bg-slate-600 text-slate-800 dark:text-slate-100 ${
                      errors.confirmPassword ? 'border-red-500' : 'border-slate-300 dark:border-slate-500'
                    }`}
                    placeholder="Confirm new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button 
                onClick={handleChangePassword}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors"
              >
                <Save size={16} />
                Update Password
              </button>
              <button 
                onClick={cancelPasswordChange}
                className="flex items-center gap-2 px-4 py-2 bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-200 font-semibold rounded-lg hover:bg-slate-300 dark:hover:bg-slate-500 transition-colors"
              >
                <X size={16} />
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile; 