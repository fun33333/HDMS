'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../../hooks/useAuth';
import { PageWrapper } from '../../../../components/layout/PageWrapper';
import { Button } from '../../../../components/ui/Button';
import { Input } from '../../../../components/ui/Input';
import { Card, CardContent, CardHeader } from '../../../../components/ui/card';
import { Camera, Save, X } from 'lucide-react';
import { THEME } from '../../../../lib/theme';
import { validateEmail } from '../../../../lib/validation';
import { userService } from '../../../../services/api/userService';
import { useUIStore } from '../../../../store/uiStore';

export default function ProfilePage() {
  const { user, updateProfile, changePassword } = useAuth();
  const { showToast } = useUIStore();
  const [loading, setLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    department: user?.department || '',
    avatar: null as File | null,
    avatarPreview: user?.avatar || '',
  });

  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || '',
        email: user.email || '',
        department: user.department || '',
        avatar: null,
        avatarPreview: user.avatar || '',
      });
    }
  }, [user]);

  const handleProfileChange = (field: string, value: any) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        showToast('File size must be less than 5MB', 'error');
        return;
      }
      
      handleProfileChange('avatar', file);
      const reader = new FileReader();
      reader.onloadend = () => {
        handleProfileChange('avatarPreview', reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors: Record<string, string> = {};
    
    if (!profileData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!validateEmail(profileData.email)) {
      newErrors.email = 'Invalid email address';
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setLoading(true);
    
    try {
      const success = await updateProfile({
        name: profileData.name,
        email: profileData.email,
        department: profileData.department,
        avatar: profileData.avatar || undefined,
      });

      if (success) {
        showToast('Profile updated successfully', 'success');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showToast('Passwords do not match', 'error');
      return;
    }

    if (passwordData.newPassword.length < 8) {
      showToast('Password must be at least 8 characters', 'error');
      return;
    }

    setPasswordLoading(true);
    
    try {
      const success = await changePassword(
        passwordData.oldPassword,
        passwordData.newPassword
      );

      if (success) {
        showToast('Password changed successfully', 'success');
        setPasswordData({
          oldPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
      }
    } catch (error) {
      console.error('Error changing password:', error);
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <PageWrapper
      title="My Profile"
      description="Manage your profile information and settings"
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Information */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold" style={{ color: THEME.colors.primary }}>
                Profile Information
              </h3>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleProfileSubmit} className="space-y-5">
                {/* Avatar */}
                <div className="flex items-center gap-6">
                  <div className="relative">
                    <div className="w-24 h-24 rounded-full overflow-hidden border-4" style={{ borderColor: THEME.colors.light }}>
                      {profileData.avatarPreview ? (
                        <img
                          src={profileData.avatarPreview}
                          alt="Profile"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: THEME.colors.light }}>
                          <span className="text-2xl font-bold" style={{ color: THEME.colors.primary }}>
                            {user?.name?.charAt(0) || 'U'}
                          </span>
                        </div>
                      )}
                    </div>
                    <label className="absolute bottom-0 right-0 p-2 bg-white rounded-full shadow-lg cursor-pointer hover:bg-gray-50 transition-colors">
                      <Camera className="w-4 h-4" style={{ color: THEME.colors.primary }} />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarChange}
                        className="hidden"
                      />
                    </label>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">{user?.name}</p>
                    <p className="text-sm text-gray-500">{user?.email}</p>
                    <p className="text-xs text-gray-400 mt-1">{user?.role}</p>
                  </div>
                </div>

                {/* Name */}
                <Input
                  label="Full Name"
                  type="text"
                  value={profileData.name}
                  onChange={(e) => handleProfileChange('name', e.target.value)}
                  error={errors.name}
                  required
                />

                {/* Email */}
                <Input
                  label="Email"
                  type="email"
                  value={profileData.email}
                  onChange={(e) => handleProfileChange('email', e.target.value)}
                  error={errors.email}
                  required
                />

                {/* Department */}
                <Input
                  label="Department"
                  type="text"
                  value={profileData.department}
                  onChange={(e) => handleProfileChange('department', e.target.value)}
                  disabled
                />

                {/* Employee Code */}
                <Input
                  label="Employee Code"
                  type="text"
                  value={user?.employeeCode || ''}
                  disabled
                />

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  loading={loading}
                  leftIcon={<Save className="w-5 h-5" />}
                >
                  Save Changes
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Change Password */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold" style={{ color: THEME.colors.primary }}>
                Change Password
              </h3>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePasswordSubmit} className="space-y-5">
                <Input
                  label="Current Password"
                  type="password"
                  value={passwordData.oldPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, oldPassword: e.target.value }))}
                  required
                />

                <Input
                  label="New Password"
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                  required
                />

                <Input
                  label="Confirm New Password"
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  required
                />

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  loading={passwordLoading}
                >
                  Change Password
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Account Info */}
        <div>
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold" style={{ color: THEME.colors.primary }}>
                Account Information
              </h3>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">Role</p>
                <p className="font-semibold" style={{ color: THEME.colors.primary }}>
                  {user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Member Since</p>
                <p className="text-sm text-gray-900">
                  {user ? formatDate(new Date().toISOString(), 'short') : 'N/A'}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageWrapper>
  );
}

