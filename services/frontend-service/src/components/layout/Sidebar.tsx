'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home, 
  FileText, 
  UserPlus,
  Users,
  Settings,
  TrendingUp,
  Inbox,
  Save
} from 'lucide-react';
import { THEME } from '../../lib/theme';

interface SidebarProps {
  role: string;
  currentPage: string;
}

export const Sidebar: React.FC<SidebarProps> = React.memo(({ role, currentPage }) => {
  const pathname = usePathname();
  
  const getSidebarItems = (role: string) => {
    switch (role) {
      case 'requester':
        return [
          { name: 'Dashboard', url: `/${role}/dashboard`, icon: Home },
          { name: 'My Requests', url: `/${role}/requests`, icon: FileText },
          { name: 'New Request', url: `/${role}/new-request`, icon: UserPlus },
          { name: 'Notifications', url: `/${role}/notifications`, icon: Inbox },
          { name: 'Profile', url: `/${role}/profile`, icon: Users }
        ];
      case 'moderator':
        return [
          { name: 'Dashboard', url: `/${role}/dashboard`, icon: Home },
          { name: 'Ticket Pool', url: `/${role}/ticket-pool`, icon: Inbox },
          { name: 'Review', url: `/${role}/review`, icon: FileText },
          { name: 'Assigned', url: `/${role}/assigned`, icon: UserPlus },
          { name: 'Reassign', url: `/${role}/reassign`, icon: TrendingUp },
          { name: 'Create Subtickets', url: `/${role}/create-subtickets`, icon: Save },
          { name: 'Notifications', url: `/${role}/notifications`, icon: Inbox },
          { name: 'Profile', url: `/${role}/profile`, icon: Users }
        ];
      case 'assignee':
        return [
          { name: 'Dashboard', url: `/${role}/dashboard`, icon: Home },
          { name: 'My Tasks', url: `/${role}/tasks`, icon: FileText },
          { name: 'Reports', url: `/${role}/reports`, icon: TrendingUp },
          { name: 'Notifications', url: `/${role}/notifications`, icon: Inbox },
          { name: 'Profile', url: `/${role}/profile`, icon: Users }
        ];
      case 'admin':
        return [
          { name: 'Dashboard', url: `/${role}/dashboard`, icon: Home },
          { name: 'Users', url: `/${role}/users`, icon: Users },
          { name: 'Analytics', url: `/${role}/analytics`, icon: TrendingUp },
          { name: 'Reports', url: `/${role}/reports`, icon: FileText },
          { name: 'Settings', url: `/${role}/settings`, icon: Settings },
          { name: 'Notifications', url: `/${role}/notifications`, icon: Inbox },
          { name: 'Profile', url: `/${role}/profile`, icon: Users }
        ];
      default:
        return [];
    }
  };

  const sidebarItems = getSidebarItems(role);

  return (
    <>
      {/* Desktop Sidebar - Vertical Only */}
      <aside 
        className="hidden md:block fixed left-0 top-16 bottom-0 w-64 border-r shadow-lg backdrop-blur-sm overflow-hidden" 
        style={{ 
          backgroundColor: THEME.colors.light,
          borderColor: THEME.colors.medium + '40',
          boxShadow: '2px 0 4px rgba(0, 0, 0, 0.05)',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        <div className="p-4 md:p-6 h-full overflow-y-auto">
          <nav className="space-y-2">
            {sidebarItems.map((item, index) => {
              const Icon = item.icon;
              const isActive = pathname === item.url || pathname?.startsWith(item.url + '/');
              
              return (
                <Link 
                  key={item.name}
                  href={item.url}
                  className={`flex items-center space-x-3 md:space-x-4 p-3 md:p-4 rounded-lg transition-all duration-200 group animate-fade-in ${
                    isActive 
                      ? 'bg-white shadow-md border-l-4 transform scale-[1.02]' 
                      : 'hover:bg-white hover:shadow-sm hover:scale-[1.01]'
                  }`}
                  style={{ 
                    borderLeftColor: isActive ? THEME.colors.primary : 'transparent',
                    borderLeftWidth: isActive ? '4px' : '0',
                    color: isActive ? THEME.colors.primary : THEME.colors.gray,
                    animationDelay: `${index * 50}ms`
                  }}
                >
                  <Icon 
                    className={`w-5 h-5 md:w-6 md:h-6 transition-all duration-200 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}
                    style={{ 
                      color: isActive ? THEME.colors.primary : THEME.colors.gray 
                    }} 
                  />
                  <span className={`text-sm md:text-base font-semibold transition-all duration-200`}
                    style={{
                      color: isActive ? THEME.colors.primary : THEME.colors.gray
                    }}
                  >
                    {item.name}
                  </span>
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>

      {/* Mobile Sidebar - Hidden by default, only shows when toggled */}
      <div 
        id="mobile-sidebar"
        className="md:hidden fixed inset-0 z-50 bg-black bg-opacity-50 hidden"
        style={{ display: 'none' }}
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            e.currentTarget.classList.add('hidden');
            e.currentTarget.style.display = 'none';
          }
        }}
      >
        <div 
          className="w-64 h-full shadow-xl"
          style={{ backgroundColor: THEME.colors.light }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-4">
            <button
              className="mb-4 p-2 rounded-lg hover:bg-white"
              onClick={() => {
                const sidebar = document.getElementById('mobile-sidebar');
                if (sidebar) {
                  sidebar.classList.add('hidden');
                  sidebar.style.display = 'none';
                }
              }}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <nav className="space-y-2">
              {sidebarItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.url || pathname?.startsWith(item.url + '/');
                
                return (
                  <Link 
                    key={item.name}
                    href={item.url}
                    className={`flex items-center space-x-4 p-4 rounded-lg transition-all duration-200 ${
                      isActive 
                        ? 'bg-white shadow-md border-l-4' 
                        : 'hover:bg-white hover:shadow-sm'
                    }`}
                    style={{ 
                      borderLeftColor: isActive ? THEME.colors.primary : 'transparent',
                      color: isActive ? THEME.colors.primary : THEME.colors.gray
                    }}
                    onClick={() => {
                      const sidebar = document.getElementById('mobile-sidebar');
                      if (sidebar) {
                        sidebar.classList.add('hidden');
                        sidebar.style.display = 'none';
                      }
                    }}
                  >
                    <Icon 
                      className="w-6 h-6" 
                      style={{ color: isActive ? THEME.colors.primary : THEME.colors.gray }} 
                    />
                    <span className="text-base font-semibold"
                      style={{
                        color: isActive ? THEME.colors.primary : THEME.colors.gray
                      }}
                    >
                      {item.name}
                    </span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      </div>
    </>
  );
});

Sidebar.displayName = 'Sidebar';
