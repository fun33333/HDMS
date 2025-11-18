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
      className="fixed top-0 left-0 right-0 z-50 px-4 md:px-6 py-3 md:py-4 flex items-center justify-between shadow-lg backdrop-blur-sm" 
      style={{ 
        backgroundColor: THEME.colors.primary,
        height: '64px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
      }}
    >
      <div className="flex items-center space-x-2 md:space-x-4">
        {/* Mobile Menu Button */}
        <button
          onClick={toggleMobileSidebar}
          className="md:hidden text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition-all duration-200 active:scale-95"
          aria-label="Toggle menu"
        >
          <Menu className="w-6 h-6" />
        </button>
        <Logo size="md" />
        <span className="font-bold text-lg md:text-xl text-white hidden sm:block tracking-wide animate-fade-in">
          HELP DESK SYSTEM
        </span>
      </div>
      
      <div className="flex items-center space-x-2 md:space-x-4">
        <div className="relative search-container hidden md:block">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-300 w-4 h-4 z-10" />
          <input
            type="text"
            placeholder="Search pages..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10 pr-4 py-2.5 bg-white bg-opacity-10 backdrop-blur-sm text-white placeholder-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50 w-48 lg:w-64 transition-all duration-200 border border-white border-opacity-20 hover:bg-opacity-15"
            style={{ fontSize: '14px' }}
          />
          
          {/* Search Results Dropdown */}
          {showSearchResults && searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-xl z-50 max-h-60 overflow-y-auto animate-scale-in">
              {searchResults.map((result, index) => (
                <div
                  key={index}
                  onClick={() => handleSearchResultClick(result.url)}
                  className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors duration-150 active:bg-gray-100"
                >
                  <div className="font-semibold text-gray-900">{result.name}</div>
                  <div className="text-sm text-gray-500 mt-0.5">{result.description}</div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <button 
          onClick={() => {
            const targetRole = user?.role || role;
            router.push(`/${targetRole}/notifications`);
          }}
          className="relative text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition-all duration-200 active:scale-95"
          title="Notifications"
        >
          <Bell className="w-6 h-6" />
          <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
        </button>
        
        <div 
          className="flex items-center space-x-2 cursor-pointer hover:bg-white hover:bg-opacity-20 px-3 py-2 rounded-lg transition-all duration-200 active:scale-95"
          onClick={() => {
            const userRole = user?.role || role;
            router.push(`/${userRole}/profile`);
          }}
        >
          <div className="h-9 w-9 rounded-full flex items-center justify-center text-sm font-semibold text-white overflow-hidden border-2 border-white border-opacity-30 shadow-md">
            {userAvatar && (userAvatar.startsWith('data:image') || userAvatar.startsWith('http') || userAvatar.startsWith('/')) ? (
              <img 
                src={userAvatar} 
                alt="Profile" 
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  const parent = e.currentTarget.parentElement;
                  if (parent && !parent.querySelector('.avatar-fallback')) {
                    const fallback = document.createElement('div');
                    fallback.className = 'avatar-fallback h-full w-full bg-white bg-opacity-20 rounded-full flex items-center justify-center absolute inset-0';
                    fallback.textContent = user?.name?.charAt(0)?.toUpperCase() || 'AS';
                    parent.appendChild(fallback);
                  }
                }}
              />
            ) : (
              <div className="h-full w-full bg-white bg-opacity-20 rounded-full flex items-center justify-center backdrop-blur-sm">
                {userAvatar && userAvatar.length <= 3 ? userAvatar : (user?.name?.charAt(0)?.toUpperCase() || 'AS')}
              </div>
            )}
          </div>
          <span className="text-sm font-medium text-white hidden lg:block capitalize">{user?.role || role}</span>
          <ChevronDown className="w-4 h-4 text-white hidden lg:block" />
        </div>
        
        <button 
          onClick={logout} 
          className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition-all duration-200 active:scale-95"
          title="Logout"
        >
          <LogOut className="w-6 h-6" />
        </button>
      </div>
    </nav>
  );
};
