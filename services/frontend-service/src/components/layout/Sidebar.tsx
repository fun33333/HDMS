'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  Home, 
  FileText, 
  UserPlus,
  Users,
  Settings,
  TrendingUp,
  Inbox,
  ChevronRight,
  X,
  LogOut // Add LogOut icon
} from 'lucide-react';
import { useAuth } from '../../lib/auth'; // Import useAuth hook
import { Logo } from '../ui/logo';

interface SidebarProps {
  role: string;
  currentPage: string;
}

export const Sidebar: React.FC<SidebarProps> = React.memo(({ role, currentPage }) => {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuth(); // Get logout function
  const [isOpen, setIsOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  
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
          { name: 'Assigned', url: `/${role}/assigned`, icon: UserPlus },
          { name: 'Reassign', url: `/${role}/reassign`, icon: TrendingUp },
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
          { name: 'Employees', url: `/${role}/employees/new`, icon: UserPlus },
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

  // Handle logout
  const handleLogout = () => {
    logout(); // This will clear localStorage and redirect to /login
  };

  // Desktop Sidebar - SIS Style
  return (
    <>
      {/* Desktop Sidebar */}
      <aside 
        className={`hidden md:block fixed left-0 top-0 bottom-0 z-[60] h-screen transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]
          ${isOpen ? 'w-72 md:w-64 lg:w-72' : 'w-18'}
          ${isOpen ? 'bg-[#e7ecef]' : 'bg-[#a3cef1]'}
          rounded-r-3xl
          border-r-[3px] border-[#1c3f67]
          ${isOpen ? 'shadow-[0_8px_32px_0_rgba(173,208,231,0.74)]' : 'shadow-[0_2px_8px_0_rgba(163,206,241,0.91)]'}
          backdrop-blur-lg
          flex flex-col
        `}
        style={{
          transition: 'background-color 0.5s ease, width 700ms cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {/* Logo Section - Clickable */}
        <div className={`px-4 py-8 ${isOpen ? '' : 'flex justify-center'}`}>
          {isOpen ? (
            <Logo 
              size="full" 
              showText={true} 
              showSubtitle={true} 
              onClick={() => setIsOpen(!isOpen)}
            />
          ) : (
            <Logo 
              size="md" 
              showText={false} 
              onClick={() => setIsOpen(!isOpen)}
            />
          )}
        </div>

        {/* Menu Items - Scrollable */}
        <nav className={`px-4 py-4 space-y-2 flex-1 overflow-y-auto hide-scrollbar ${isOpen ? '' : 'px-2'}`}>
          {sidebarItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = pathname === item.url || pathname?.startsWith(item.url + '/');
            
            return (
              <Link 
                key={item.name}
                href={item.url}
                className={`
                  flex items-center ${isOpen ? 'justify-start px-4 py-3' : 'justify-center px-2 py-4'}
                  rounded-xl
                  font-semibold
                  transition-all duration-500
                  ${isActive 
                    ? 'bg-[#6096ba] text-[#e7ecef] shadow-xl border-2 border-[#6096ba]' 
                    : 'bg-transparent text-[#274c77] border-[1.5px] border-[#8b8c89] shadow-lg hover:bg-[#a3cef1]'
                  }
                  group
                `}
                style={{
                  animationDelay: `${index * 50}ms`,
                }}
              >
                <Icon 
                  className={`transition-all duration-200 ${isActive ? 'text-[#e7ecef]' : 'text-[#274c77] group-hover:text-[#274c77]'}`}
                  size={isOpen ? 20 : 24}
                />
                {isOpen && (
                  <span 
                    className="ml-3 transition-all duration-500"
                    style={{
                      opacity: isOpen ? 1 : 0,
                      maxWidth: isOpen ? '200px' : '0',
                      marginLeft: isOpen ? '0.75rem' : '0',
                    }}
                  >
                    {item.name}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Logout Button - At Bottom */}
        <div className={`px-4 pb-4 pt-2 ${isOpen ? '' : 'px-2'}`}>
          <button
            onClick={handleLogout}
            className={`
              w-full
              flex items-center ${isOpen ? 'justify-start px-4 py-3' : 'justify-center px-2 py-4'}
              rounded-xl
              font-semibold
              transition-all duration-500
              bg-transparent text-[#ef4444] border-[1.5px] border-[#ef4444] shadow-lg
              hover:bg-[#ef4444] hover:text-white hover:shadow-xl
              active:scale-95
            `}
          >
            <LogOut 
              className={`transition-all duration-200 text-[#ef4444] ${isOpen ? '' : 'group-hover:text-white'}`}
              size={isOpen ? 20 : 24}
            />
            {isOpen && (
              <span 
                className="ml-3 transition-all duration-500"
                style={{
                  opacity: isOpen ? 1 : 0,
                  maxWidth: isOpen ? '200px' : '0',
                  marginLeft: isOpen ? '0.75rem' : '0',
                }}
              >
                Logout
              </span>
            )}
          </button>
        </div>

        {/* Toggle Button - REMOVE THIS ENTIRE SECTION (lines 189-195) */}
        {/* DELETE THIS:
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="absolute -right-3 top-20 w-6 h-6 bg-[#1c3f67] rounded-full flex items-center justify-center text-white hover:bg-[#365486] transition-all"
        >
          {isOpen ? '←' : '→'}
        </button>
        */}
      </aside>

      {/* Mobile Overlay */}
      {mobileSidebarOpen && (
        <div 
          className="md:hidden fixed inset-0 z-50 bg-black/30 backdrop-blur-sm transition-opacity duration-700"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <div 
        id="mobile-sidebar"
        className={`md:hidden fixed inset-y-0 left-0 z-50 w-80 
          bg-[#e7ecef] rounded-r-3xl border-r-[3px] border-[#1c3f67]
          shadow-[0_8px_32px_0_rgba(173,208,231,0.74)] backdrop-blur-lg
          transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]
          ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          flex flex-col
        `}
      >
        {/* Mobile Header */}
        <div className="px-4 py-8 flex items-center justify-between">
          <Logo size="full" showText={true} showSubtitle={true} />
          <button
            onClick={() => setMobileSidebarOpen(false)}
            className="p-2 rounded-lg hover:bg-[#a3cef1] transition-colors"
          >
            <X className="w-6 h-6 text-[#274c77]" />
          </button>
        </div>

        {/* Mobile Menu Items - Scrollable */}
        <nav className="px-4 py-4 space-y-2 flex-1 overflow-y-auto hide-scrollbar">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.url || pathname?.startsWith(item.url + '/');
            
            return (
              <Link 
                key={item.name}
                href={item.url}
                className={`
                  flex items-center justify-start px-4 py-3
                  rounded-xl font-semibold
                  transition-all duration-500
                  ${isActive 
                    ? 'bg-[#6096ba] text-[#e7ecef] shadow-xl border-2 border-[#6096ba]' 
                    : 'bg-transparent text-[#274c77] border-[1.5px] border-[#8b8c89] shadow-lg hover:bg-[#a3cef1]'
                  }
                `}
                onClick={() => setMobileSidebarOpen(false)}
              >
                <Icon size={20} />
                <span className="ml-3">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Mobile Logout Button - At Bottom */}
        <div className="px-4 pb-4 pt-2 border-t border-[#8b8c89]/20">
          <button
            onClick={() => {
              handleLogout();
              setMobileSidebarOpen(false);
            }}
            className="
              w-full
              flex items-center justify-start px-4 py-3
              rounded-xl font-semibold
              transition-all duration-500
              bg-transparent text-[#ef4444] border-[1.5px] border-[#ef4444] shadow-lg
              hover:bg-[#ef4444] hover:text-white hover:shadow-xl
              active:scale-95
            "
          >
            <LogOut size={20} />
            <span className="ml-3">Logout</span>
          </button>
        </div>
      </div>
    </>
  );
});

Sidebar.displayName = 'Sidebar';
