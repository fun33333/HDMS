'use client';

import React, { useState } from 'react';
import { useAuth } from '../../../lib/auth';
import { Card, CardContent } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import DataTable, { Column } from '../../../components/ui/DataTable';
import DebouncedInput from '../../../components/ui/DebouncedInput';
import PageSkeleton from '../../../components/ui/PageSkeleton';
import ErrorBanner from '../../../components/ui/ErrorBanner';
import EmptyState from '../../../components/ui/EmptyState';
import { 
  Settings, 
  Save, 
  RefreshCw,
  Shield,
  Bell,
  Database,
  Server,
  Users,
  Globe,
  Lock,
  Key,
  Mail,
  FileText,
  Upload,
  Download,
  Trash2,
  AlertTriangle,
  CheckCircle,
  Info,
  Wrench,
  Monitor,
  Smartphone,
  Globe2
} from 'lucide-react';

const AdminSettingsPage: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('general');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [settings, setSettings] = useState({
    // General Settings
    siteName: 'Help Desk System',
    siteDescription: 'Comprehensive help desk management system',
    timezone: 'UTC+5',
    language: 'en',
    dateFormat: 'MM/DD/YYYY',
    
    // Notification Settings
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
    notificationFrequency: 'immediate',
    
    // Security Settings
    passwordMinLength: 8,
    requireSpecialChars: true,
    requireNumbers: true,
    requireUppercase: true,
    sessionTimeout: 30,
    twoFactorAuth: false,
    
    // System Settings
    maxFileSize: 10,
    allowedFileTypes: 'pdf,doc,docx,jpg,png',
    autoBackup: true,
    backupFrequency: 'daily',
    maintenanceMode: false,
    
    // User Settings
    allowRegistration: true,
    requireEmailVerification: true,
    defaultUserRole: 'requester',
    userApprovalRequired: false
  });

  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  const handleSave = async () => {
    setIsSaving(true);
    setSaveMessage('');
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsSaving(false);
    setSaveMessage('Settings saved successfully!');
    
    // Clear message after 3 seconds
    setTimeout(() => setSaveMessage(''), 3000);
  };

  const handleReset = () => {
    if (confirm('Are you sure you want to reset all settings to default?')) {
      // Reset to default values
      setSettings({
        siteName: 'Help Desk System',
        siteDescription: 'Comprehensive help desk management system',
        timezone: 'UTC+5',
        language: 'en',
        dateFormat: 'MM/DD/YYYY',
        emailNotifications: true,
        pushNotifications: true,
        smsNotifications: false,
        notificationFrequency: 'immediate',
        passwordMinLength: 8,
        requireSpecialChars: true,
        requireNumbers: true,
        requireUppercase: true,
        sessionTimeout: 30,
        twoFactorAuth: false,
        maxFileSize: 10,
        allowedFileTypes: 'pdf,doc,docx,jpg,png',
        autoBackup: true,
        backupFrequency: 'daily',
        maintenanceMode: false,
        allowRegistration: true,
        requireEmailVerification: true,
        defaultUserRole: 'requester',
        userApprovalRequired: false
      });
      setSaveMessage('Settings reset to default!');
    }
  };

  const tabs = [
    { id: 'general', name: 'General', icon: Globe },
    { id: 'departments', name: 'Departments', icon: Users },
    { id: 'roles', name: 'Roles', icon: Shield },
    { id: 'branding', name: 'Branding', icon: Upload },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'security', name: 'Security', icon: Shield },
    { id: 'system', name: 'System', icon: Server },
    { id: 'users', name: 'Users', icon: Users }
  ];

  // Departments management
  const [deptQuery, setDeptQuery] = useState('');
  const [departments, setDepartments] = useState<string[]>(() => {
    const raw = localStorage.getItem('helpdesk_departments');
    return raw ? JSON.parse(raw) : ['IT', 'HR', 'Electrical', 'Procurement', 'Accounts'];
  });
  const persistDepartments = (next: string[]) => {
    setDepartments(next);
    localStorage.setItem('helpdesk_departments', JSON.stringify(next));
  };
  const [newDept, setNewDept] = useState('');
  const addDepartment = () => {
    const name = newDept.trim();
    if (!name) return;
    if (departments.some(d => d.toLowerCase() === name.toLowerCase())) return;
    persistDepartments([name, ...departments]);
    setNewDept('');
  };
  const deleteDepartment = (name: string) => {
    persistDepartments(departments.filter(d => d !== name));
  };
  const deptRows = departments
    .filter(d => !deptQuery.trim() || d.toLowerCase().includes(deptQuery.toLowerCase()))
    .map(d => ({ name: d }));
  const deptColumns: Column<any>[] = [
    { key: 'name', header: 'Department', sortable: true, accessor: (r) => r.name },
    { key: 'actions', header: 'Actions', accessor: (r) => (
      <button onClick={() => deleteDepartment(r.name)} className="px-2 py-1 border rounded text-red-600">Delete</button>
    ) }
  ];

  // Roles/Permissions (read-only)
  const rolePermissions = [
    { role: 'admin', permissions: ['All access', 'Manage users', 'System settings'] },
    { role: 'moderator', permissions: ['Assign/Reassign', 'Approve completion'] },
    { role: 'assignee', permissions: ['View tasks', 'Update status'] },
    { role: 'requester', permissions: ['Create requests', 'View status'] },
  ];

  // Branding
  const [logo, setLogo] = useState<string | null>(typeof window !== 'undefined' ? localStorage.getItem('branding_logo') : null);
  const handleLogo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      setLogo(base64);
      localStorage.setItem('branding_logo', base64);
    };
    reader.readAsDataURL(file);
  };

  const renderGeneralSettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Site Name</label>
          <input
            type="text"
            value={settings.siteName}
            onChange={(e) => setSettings({...settings, siteName: e.target.value})}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Timezone</label>
          <select
            value={settings.timezone}
            onChange={(e) => setSettings({...settings, timezone: e.target.value})}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="UTC+5">UTC+5 (Pakistan)</option>
            <option value="UTC+0">UTC+0 (GMT)</option>
            <option value="UTC-5">UTC-5 (EST)</option>
            <option value="UTC+8">UTC+8 (CST)</option>
          </select>
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Site Description</label>
        <textarea
          value={settings.siteDescription}
          onChange={(e) => setSettings({...settings, siteDescription: e.target.value})}
          rows={3}
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
          <select
            value={settings.language}
            onChange={(e) => setSettings({...settings, language: e.target.value})}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="en">English</option>
            <option value="ur">Urdu</option>
            <option value="ar">Arabic</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Date Format</label>
          <select
            value={settings.dateFormat}
            onChange={(e) => setSettings({...settings, dateFormat: e.target.value})}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="MM/DD/YYYY">MM/DD/YYYY</option>
            <option value="DD/MM/YYYY">DD/MM/YYYY</option>
            <option value="YYYY-MM-DD">YYYY-MM-DD</option>
          </select>
        </div>
      </div>
    </div>
  );

  const renderNotificationSettings = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Notification Types</h3>
        
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
          <div className="flex items-center space-x-3">
            <Mail className="w-5 h-5 text-blue-600" />
            <div>
              <p className="font-medium text-gray-900">Email Notifications</p>
              <p className="text-sm text-gray-600">Send notifications via email</p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.emailNotifications}
              onChange={(e) => setSettings({...settings, emailNotifications: e.target.checked})}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>

        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
          <div className="flex items-center space-x-3">
            <Bell className="w-5 h-5 text-green-600" />
            <div>
              <p className="font-medium text-gray-900">Push Notifications</p>
              <p className="text-sm text-gray-600">Send browser push notifications</p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.pushNotifications}
              onChange={(e) => setSettings({...settings, pushNotifications: e.target.checked})}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>

        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
          <div className="flex items-center space-x-3">
            <Smartphone className="w-5 h-5 text-purple-600" />
            <div>
              <p className="font-medium text-gray-900">SMS Notifications</p>
              <p className="text-sm text-gray-600">Send notifications via SMS</p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.smsNotifications}
              onChange={(e) => setSettings({...settings, smsNotifications: e.target.checked})}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Notification Frequency</label>
        <select
          value={settings.notificationFrequency}
          onChange={(e) => setSettings({...settings, notificationFrequency: e.target.value})}
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="immediate">Immediate</option>
          <option value="hourly">Hourly</option>
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
        </select>
      </div>
    </div>
  );

  const renderDepartments = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex-1 max-w-sm">
          <DebouncedInput value={deptQuery} onChange={setDeptQuery} placeholder="Search departments..." />
        </div>
        <div className="flex items-center gap-2">
          <input
            value={newDept}
            onChange={(e) => setNewDept(e.target.value)}
            placeholder="New department name"
            className="px-3 py-2 border rounded"
          />
          <Button onClick={addDepartment} className="bg-blue-600 text-white px-4 py-2 rounded">Add</Button>
        </div>
      </div>
      <Card className="bg-white shadow-xl border">
        <CardContent className="p-6">
          {deptRows.length === 0 ? (
            <EmptyState title="No departments" description="Add a department to get started." />
          ) : (
            <DataTable data={deptRows} columns={deptColumns} initialSort={{ key: 'name', dir: 'asc' }} pageSize={8} showSearch={false} />
          )}
        </CardContent>
      </Card>
    </div>
  );

  const renderRoles = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {rolePermissions.map(r => (
          <div key={r.role} className="p-4 rounded border bg-white">
            <h4 className="font-semibold text-gray-900 mb-2">{r.role.toUpperCase()}</h4>
            <ul className="list-disc ml-5 text-gray-700 text-sm">
              {r.permissions.map(p => (<li key={p}>{p}</li>))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );

  const renderBranding = () => (
    <div className="space-y-6">
      <div className="p-6 rounded border bg-white">
        <h4 className="font-semibold text-gray-900 mb-3">Logo</h4>
        {logo ? (
          <img src={logo} alt="Logo" className="h-16 w-auto mb-3" />
        ) : (
          <div className="h-16 w-16 bg-gray-100 rounded mb-3" />
        )}
        <input type="file" accept="image/*" onChange={handleLogo} />
        <p className="text-xs text-gray-500 mt-2">PNG/JPG recommended. Max 1MB.</p>
      </div>
    </div>
  );

  const renderSecuritySettings = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Password Requirements</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Minimum Length</label>
            <input
              type="number"
              value={settings.passwordMinLength}
              onChange={(e) => setSettings({...settings, passwordMinLength: parseInt(e.target.value)})}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              min="6"
              max="20"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Session Timeout (minutes)</label>
            <input
              type="number"
              value={settings.sessionTimeout}
              onChange={(e) => setSettings({...settings, sessionTimeout: parseInt(e.target.value)})}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              min="5"
              max="120"
            />
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
            <div className="flex items-center space-x-3">
              <Key className="w-5 h-5 text-orange-600" />
              <div>
                <p className="font-medium text-gray-900">Require Special Characters</p>
                <p className="text-sm text-gray-600">Must include !@#$%^&*</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.requireSpecialChars}
                onChange={(e) => setSettings({...settings, requireSpecialChars: e.target.checked})}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
            <div className="flex items-center space-x-3">
              <Lock className="w-5 h-5 text-blue-600" />
              <div>
                <p className="font-medium text-gray-900">Require Numbers</p>
                <p className="text-sm text-gray-600">Must include 0-9</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.requireNumbers}
                onChange={(e) => setSettings({...settings, requireNumbers: e.target.checked})}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
            <div className="flex items-center space-x-3">
              <Shield className="w-5 h-5 text-green-600" />
              <div>
                <p className="font-medium text-gray-900">Two-Factor Authentication</p>
                <p className="text-sm text-gray-600">Require 2FA for admin accounts</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.twoFactorAuth}
                onChange={(e) => setSettings({...settings, twoFactorAuth: e.target.checked})}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSystemSettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Max File Size (MB)</label>
          <input
            type="number"
            value={settings.maxFileSize}
            onChange={(e) => setSettings({...settings, maxFileSize: parseInt(e.target.value)})}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            min="1"
            max="100"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Allowed File Types</label>
          <input
            type="text"
            value={settings.allowedFileTypes}
            onChange={(e) => setSettings({...settings, allowedFileTypes: e.target.value})}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="pdf,doc,docx,jpg,png"
          />
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Backup Settings</h3>
        
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
          <div className="flex items-center space-x-3">
            <Database className="w-5 h-5 text-blue-600" />
            <div>
              <p className="font-medium text-gray-900">Auto Backup</p>
              <p className="text-sm text-gray-600">Automatically backup system data</p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.autoBackup}
              onChange={(e) => setSettings({...settings, autoBackup: e.target.checked})}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Backup Frequency</label>
          <select
            value={settings.backupFrequency}
            onChange={(e) => setSettings({...settings, backupFrequency: e.target.value})}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="hourly">Hourly</option>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
        </div>
      </div>

      <div className="flex items-center justify-between p-4 bg-red-50 rounded-xl border border-red-200">
        <div className="flex items-center space-x-3">
          <AlertTriangle className="w-5 h-5 text-red-600" />
          <div>
            <p className="font-medium text-red-900">Maintenance Mode</p>
            <p className="text-sm text-red-700">Temporarily disable system access</p>
          </div>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={settings.maintenanceMode}
            onChange={(e) => setSettings({...settings, maintenanceMode: e.target.checked})}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
        </label>
      </div>
    </div>
  );

  const renderUserSettings = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Registration Settings</h3>
        
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
          <div className="flex items-center space-x-3">
            <Users className="w-5 h-5 text-green-600" />
            <div>
              <p className="font-medium text-gray-900">Allow Registration</p>
              <p className="text-sm text-gray-600">Allow new users to register</p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.allowRegistration}
              onChange={(e) => setSettings({...settings, allowRegistration: e.target.checked})}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>

        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
          <div className="flex items-center space-x-3">
            <Mail className="w-5 h-5 text-blue-600" />
            <div>
              <p className="font-medium text-gray-900">Require Email Verification</p>
              <p className="text-sm text-gray-600">Verify email before account activation</p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.requireEmailVerification}
              onChange={(e) => setSettings({...settings, requireEmailVerification: e.target.checked})}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>

        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
          <div className="flex items-center space-x-3">
            <Shield className="w-5 h-5 text-purple-600" />
            <div>
              <p className="font-medium text-gray-900">User Approval Required</p>
              <p className="text-sm text-gray-600">Admin approval for new users</p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.userApprovalRequired}
              onChange={(e) => setSettings({...settings, userApprovalRequired: e.target.checked})}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Default User Role</label>
        <select
          value={settings.defaultUserRole}
          onChange={(e) => setSettings({...settings, defaultUserRole: e.target.value})}
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="requester">Requester</option>
          <option value="assignee">Assignee</option>
          <option value="moderator">Moderator</option>
        </select>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'general': return renderGeneralSettings();
      case 'departments': return renderDepartments();
      case 'roles': return renderRoles();
      case 'branding': return renderBranding();
      case 'notifications': return renderNotificationSettings();
      case 'security': return renderSecuritySettings();
      case 'system': return renderSystemSettings();
      case 'users': return renderUserSettings();
      default: return renderGeneralSettings();
    }
  };

  if (loading) return <PageSkeleton rows={10} />;
  return (
    <div className="p-8 space-y-8 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
      {/* Header Section */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold text-gray-900">
              System Settings
            </h1>
            <p className="text-lg text-gray-600">Configure system preferences and security settings</p>
          </div>
          <div className="flex items-center space-x-3 bg-purple-50 rounded-xl px-4 py-3 border border-purple-200">
            <Settings className="w-6 h-6 text-purple-600" />
            <span className="text-lg font-semibold text-purple-800">System Administrator</span>
          </div>
        </div>
      </div>

      {/* Settings Tabs */}
      <Card className="bg-white shadow-xl border-0">
        <CardContent className="p-0">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-8">
              {tabs.map((tab) => {
                const IconComponent = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 transition-colors duration-200 ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <IconComponent className="w-5 h-5" />
                    <span>{tab.name}</span>
                  </button>
                );
              })}
            </nav>
          </div>
          
          <div className="p-8">
            {renderTabContent()}
          </div>
        </CardContent>
      </Card>

      {/* Save Actions */}
      <Card className="bg-white shadow-xl border-0">
        <CardContent className="p-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {saveMessage && (
                <div className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${
                  saveMessage.includes('success') ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                }`}>
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-medium">{saveMessage}</span>
                </div>
              )}
            </div>
            
            <div className="flex space-x-4">
              <Button
                onClick={handleReset}
                className="bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center space-x-2"
              >
                <RefreshCw className="w-5 h-5" />
                <span>Reset</span>
              </Button>
              
              <Button
                onClick={handleSave}
                disabled={isSaving}
                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center space-x-2 disabled:opacity-50"
              >
                {isSaving ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    <span>Save Settings</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminSettingsPage;
