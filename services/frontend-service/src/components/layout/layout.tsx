'use client';

import React, { ReactNode, useMemo } from 'react';
import { usePathname } from 'next/navigation';
import { useAuth } from '../../lib/auth';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { THEME } from '../../lib/theme';

interface LayoutProps {
  children: ReactNode;
}

export const Layout: React.FC<LayoutProps> = React.memo(({ children }) => {
  const { user, loading } = useAuth();
  const pathname = usePathname();

  // Don't show layout on auth pages - Early return to prevent any rendering
  const isAuthPage = pathname?.startsWith('/login') || 
                     pathname?.startsWith('/register') || 
                     pathname?.startsWith('/forgot-password');

  if (isAuthPage) {
    return (
      <div 
        style={{ 
          minHeight: '100vh', 
          backgroundColor: THEME.colors.background,
          position: 'relative',
          zIndex: 1
        }}
      >
        {children}
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: THEME.colors.background }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: THEME.colors.primary }}></div>
          <p style={{ color: THEME.colors.primary }}>Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <>{children}</>;
  }

  const role = user.role;

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: THEME.colors.background }}>
      {/* Top Navbar - Fixed - Render Only Once */}
      <Navbar key="navbar" role={role} />

      {/* Main Content Area - Below Navbar */}
      <div className="flex flex-1 pt-16 md:pt-20">
        {/* Left Sidebar - Fixed - Desktop Only */}
        <div key="desktop-sidebar-wrapper" className="hidden md:block fixed left-0 top-0 bottom-0 z-[60]">
          <Sidebar key="desktop-sidebar" role={role} currentPage={pathname || ''} />
        </div>

        {/* Content Area - Right side of sidebar */}
        <main 
          className="flex-1 w-full md:ml-64 transition-all duration-300 ease-in-out overflow-y-auto"
          style={{ 
            minHeight: 'calc(100vh - 64px)',
            backgroundColor: THEME.colors.background,
            paddingTop: '1rem', // Extra padding to ensure content doesn't stick to navbar
          }}
        >
          <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
});

Layout.displayName = 'Layout';

