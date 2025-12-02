'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../lib/auth';
import { Mail, Lock, User, Shield, Wrench, Settings, ChevronDown } from 'lucide-react';
import { THEME } from '../../../lib/theme';
import { Logo } from '../../../components/ui/logo';

const LoginPage: React.FC = () => {
  const [selectedRole, setSelectedRole] = useState<string>('requester');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('test');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const { login } = useAuth();
  const router = useRouter();

  const roles = [
    { id: 'requester', name: 'Requester', icon: User },
    { id: 'moderator', name: 'Moderator', icon: Shield },
    { id: 'assignee', name: 'Department Staff', icon: Wrench },
    { id: 'admin', name: 'Admin', icon: Settings }
  ];

  const selectedRoleData = roles.find(role => role.id === selectedRole);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRole) {
      setError('Please select a role');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const success = await login(email, password, selectedRole);
      if (success) {
        router.push(`/${selectedRole}/dashboard`);
      } else {
        setError('Invalid credentials or role mismatch');
      }
    } catch (err) {
      setError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      key="login-page-wrapper"
      className="login-page-wrapper min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 animate-fade-in" 
      style={{ 
        backgroundColor: THEME.colors.background,
        position: 'relative',
        zIndex: 1
      }}
    >
      <div className="max-w-md w-full space-y-8">
        {/* Icon and Title - Single Header - Render Once - No Background */}
        <div 
          key="login-header" 
          className="login-header text-center animate-slide-in" 
          style={{ 
            position: 'relative', 
            zIndex: 2,
            backgroundColor: 'transparent',
            background: 'none'
          }}
        >
          <div className="mx-auto mb-6 flex justify-center">
            <Logo size="lg" showText={true} showSubtitle={true} />
          </div>
          <p className="text-base" style={{ color: THEME.colors.gray, backgroundColor: 'transparent' }}>
            Sign in to your account
          </p>
        </div>

        {/* Login Card */}
        <div 
          className="rounded-2xl p-8 shadow-xl animate-scale-in"
          style={{ 
            backgroundColor: THEME.colors.light,
            borderRadius: '16px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
          }}
        >
          {/* Role Selection Dropdown */}
          <div className="mb-6">
            <label 
              className="block mb-3 font-semibold"
              style={{ color: THEME.colors.primary }}
            >
              Select your Role
            </label>
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="w-full flex items-center justify-between p-4 border rounded-lg bg-white focus:outline-none transition-all"
                style={{ 
                  borderColor: '#D1D5DB',
                  borderWidth: '1px'
                }}
              >
                <div className="flex items-center">
                  {selectedRoleData && (
                    <>
                      <selectedRoleData.icon 
                        className="w-5 h-5 mr-3" 
                        style={{ color: THEME.colors.gray }} 
                      />
                      <span 
                        className="font-medium text-base"
                        style={{ color: THEME.colors.primary }}
                      >
                        {selectedRoleData.name}
                      </span>
                    </>
                  )}
                </div>
                <ChevronDown 
                  className={`w-5 h-5 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} 
                  style={{ color: THEME.colors.gray }} 
                />
              </button>
              
              {isDropdownOpen && (
                <div 
                  className="absolute z-10 w-full mt-2 bg-white border rounded-lg shadow-lg overflow-hidden"
                  style={{ 
                    borderColor: '#D1D5DB',
                    borderWidth: '1px'
                  }}
                >
                  {roles.map((role) => {
                    const IconComponent = role.icon;
                    return (
                      <button
                        key={role.id}
                        type="button"
                        onClick={() => {
                          setSelectedRole(role.id);
                          setIsDropdownOpen(false);
                        }}
                        className="w-full flex items-center p-4 hover:bg-gray-50 transition-colors"
                      >
                        <IconComponent 
                          className="w-5 h-5 mr-3" 
                          style={{ color: THEME.colors.gray }} 
                        />
                        <span 
                          className="font-medium text-base"
                          style={{ color: THEME.colors.primary }}
                        >
                          {role.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-5">
            {/* Email Field */}
            <div className="relative">
              <Mail 
                className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 z-10" 
                style={{ color: THEME.colors.gray }} 
              />
              <input
                type="email"
                placeholder="Username/Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-12 pr-4 py-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base transition-all shadow-sm hover:shadow-md"
                style={{ 
                  borderColor: '#D1D5DB',
                  backgroundColor: 'white',
                  color: '#111827',
                  borderWidth: '1px'
                }}
                required
              />
            </div>
            
            {/* Password Field */}
            <div className="relative">
              <Lock 
                className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 z-10" 
                style={{ color: THEME.colors.gray }} 
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-12 pr-4 py-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base transition-all shadow-sm hover:shadow-md"
                style={{ 
                  borderColor: '#D1D5DB',
                  backgroundColor: 'white',
                  color: '#111827',
                  borderWidth: '1px'
                }}
                required
              />
            </div>

            {error && (
              <div className="text-center p-3 rounded-lg border" style={{ backgroundColor: THEME.colors.background, borderColor: THEME.colors.gray, color: THEME.colors.primary }}>
                {error}
              </div>
            )}

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full text-white font-bold py-4 px-6 rounded-lg transition-all duration-200 text-base shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ 
                backgroundColor: THEME.colors.primary,
                borderRadius: '10px'
              }}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Logging in...
                </span>
              ) : 'Login'}
            </button>
          </form>

          {/* Forgot Password Link */}
          <div className="text-center mt-6">
            <a 
              href="/forgot-password" 
              className="text-base underline font-medium hover:opacity-80 transition-opacity"
              style={{ color: THEME.colors.primary }}
            >
              Forgot Password?
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
