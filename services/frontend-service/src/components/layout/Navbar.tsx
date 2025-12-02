'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../lib/auth';
import { 
  Search, 
  Bell, 
  LogOut, 
  ChevronDown,
  Menu
} from 'lucide-react';
import { Logo } from '../ui/logo';
import { THEME } from '../../lib/theme';

interface NavbarProps {
  role: string;
}

export const Navbar: React.FC<NavbarProps> = ({ role }) => {
  const { user, logout } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [userAvatar, setUserAvatar] = useState<string | null>(user?.avatar || null);
  const router = useRouter();

  // Search functionality
  const handleSearch = (query: string) => {
    setSearchTerm(query);
    if (query.trim() === '') {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    // Search through pages based on role
    const pages = getPagesByRole(role);
    const filtered = pages.filter(page => 
      page.name.toLowerCase().includes(query.toLowerCase()) ||
      page.description.toLowerCase().includes(query.toLowerCase())
    );

    setSearchResults(filtered);
    setShowSearchResults(true);
  };

  const handleSearchResultClick = (url: string) => {
    router.push(url);
    setShowSearchResults(false);
    setSearchTerm('');
  };

  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.search-container')) {
        setShowSearchResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Listen for avatar updates and sync on mount
  useEffect(() => {
    // Get avatar from localStorage on mount
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      const userData = JSON.parse(savedUser);
      if (userData.avatar) {
        setUserAvatar(userData.avatar);
      }
    }

    const handleAvatarUpdate = (event: CustomEvent) => {
      setUserAvatar(event.detail);
    };

    window.addEventListener('avatarUpdated', handleAvatarUpdate as EventListener);
    return () => {
      window.removeEventListener('avatarUpdated', handleAvatarUpdate as EventListener);
    };
  }, []);

  // Update avatar when user object changes
  useEffect(() => {
    if (user?.avatar) {
      setUserAvatar(user.avatar);
    } else {
      setUserAvatar(null);
    }
  }, [user]);

  const getPagesByRole = (role: string) => {
    switch (role) {
      case 'requester':
        return [
          { name: 'Dashboard', url: '/requester/dashboard', description: 'Main dashboard with analytics' },
          { name: 'My Requests', url: '/requester/requests', description: 'View all your requests' },
          { name: 'New Request', url: '/requester/new-request', description: 'Create a new request' },
          { name: 'Profile', url: '/requester/profile', description: 'Manage your profile' },
          { name: 'Total Requests', url: '/requester/total-requests', description: 'View all requests' },
          { name: 'Pending Requests', url: '/requester/pending-requests', description: 'View pending requests' },
          { name: 'Resolved Requests', url: '/requester/resolved-requests', description: 'View resolved requests' },
          { name: 'Rejected Requests', url: '/requester/rejected-requests', description: 'View rejected requests' },
          { name: 'Notifications', url: '/requester/notifications', description: 'View notifications' }
        ];
      case 'moderator':
        return [
          { name: 'Dashboard', url: '/moderator/dashboard', description: 'Moderator dashboard' },
          { name: 'New Requests', url: '/moderator/new-requests', description: 'View newly submitted requests' },
          { name: 'Total Requests', url: '/moderator/total-requests', description: 'View all requests' },
          { name: 'In Progress', url: '/moderator/in-progress', description: 'View in progress requests' },
          { name: 'Resolved', url: '/moderator/resolved', description: 'View resolved requests' },
          { name: 'Pending', url: '/moderator/pending', description: 'View pending requests' },
          { name: 'Rejected', url: '/moderator/rejected', description: 'View rejected requests' },
          { name: 'High Priority', url: '/moderator/high-priority', description: 'View high priority requests' },
          { name: 'Urgent', url: '/moderator/urgent', description: 'View urgent requests' },
          { name: 'Notifications', url: '/moderator/notifications', description: 'View notifications' },
          { name: 'Profile', url: '/moderator/profile', description: 'Manage profile' }
        ];
      case 'assignee':
        return [
          { name: 'Dashboard', url: '/assignee/dashboard', description: 'Assignee dashboard' },
          { name: 'My Tasks', url: '/assignee/tasks', description: 'View assigned tasks' },
          { name: 'Notifications', url: '/assignee/notifications', description: 'View notifications' },
          { name: 'Profile', url: '/assignee/profile', description: 'Manage profile' }
        ];
      case 'admin':
        return [
          { name: 'Dashboard', url: '/admin/dashboard', description: 'Admin dashboard' },
          { name: 'All Users', url: '/admin/users', description: 'Manage users' },
          { name: 'All Requests', url: '/admin/requests', description: 'View all requests' },
          { name: 'Reports', url: '/admin/reports', description: 'View reports' },
          { name: 'Notifications', url: '/admin/notifications', description: 'View notifications' },
          { name: 'Settings', url: '/admin/settings', description: 'System settings' },
          { name: 'Profile', url: '/admin/profile', description: 'Manage profile' }
        ];
      default:
        return [];
    }
  };

  const toggleMobileSidebar = () => {
    const sidebar = document.getElementById('mobile-sidebar');
    if (sidebar) {
      const isHidden = sidebar.classList.contains('hidden');
      if (isHidden) {
        sidebar.classList.remove('hidden');
        sidebar.style.display = 'block';
      } else {
        sidebar.classList.add('hidden');
        sidebar.style.display = 'none';
      }
    }
  };

  return (
    <nav 
      className="fixed top-0 left-0 right-0 z-50 px-4 md:px-6 py-3 md:py-4 flex items-center justify-end gap-2 sm:gap-3"
      style={{ 
        backgroundColor: '#e7ecef',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
      }}
    >
      {/* Notification Bell - SIS Style */}
      <button 
        onClick={() => {
          const targetRole = user?.role || role;
          router.push(`/${targetRole}/notifications`);
        }}
        className="relative text-gray-700 hover:scale-110 active:scale-95 transition-all"
        title="Notifications"
      >
        <Bell className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 animate-shake-interval" />
        <span className="absolute -top-1 -right-1 h-3.5 w-3.5 sm:h-4 sm:w-4 bg-red-500 rounded-full border border-white sm:border-2 animate-ping"></span>
        <span className="absolute -top-1 -right-1 h-3.5 w-3.5 sm:h-4 sm:w-4 bg-red-500 rounded-full border border-white sm:border-2"></span>
      </button>

      {/* User Profile Popup - SIS Style */}
      <div className="relative group">
        <button
          className="flex items-center gap-2 p-1.5 sm:p-2 rounded-full hover:bg-gray-100 transition-colors"
          onClick={() => {
            const userRole = user?.role || role;
            router.push(`/${userRole}/profile`);
          }}
        >
          <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs sm:text-sm font-semibold overflow-hidden border-2 border-white/30">
            {userAvatar ? (
              <img src={userAvatar} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <span>{user?.name?.charAt(0)?.toUpperCase() || 'U'}</span>
            )}
          </div>
        </button>

        {/* Profile Popup Card - SIS Style */}
        <div className="absolute right-0 top-full mt-2 w-72 sm:w-80 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-4 sm:p-6 rounded-t-xl">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-white/20 border-2 border-white/30 flex items-center justify-center">
                {userAvatar ? (
                  <img src={userAvatar} alt="Profile" className="w-full h-full rounded-full object-cover" />
                ) : (
                  <span className="text-xl sm:text-2xl font-bold">{user?.name?.charAt(0)?.toUpperCase() || 'U'}</span>
                )}
              </div>
              <div>
                <div className="font-semibold text-sm sm:text-base">{user?.name || 'User'}</div>
                <div className="text-xs sm:text-sm text-white/80 capitalize">{user?.role || role}</div>
              </div>
              <div className="ml-auto w-3 h-3 bg-green-500 rounded-full flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full"></div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-3 sm:p-4 max-h-80 sm:max-h-96 overflow-y-auto">
            {/* Menu items can go here */}
            <div className="text-sm text-gray-600">Profile Settings</div>
          </div>

          {/* Footer */}
          <div className="border-t bg-gray-50 p-3 sm:p-4 rounded-b-xl">
            <button
              onClick={logout}
              className="w-full text-left text-red-600 hover:bg-red-50 px-3 py-2 rounded-lg transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};
