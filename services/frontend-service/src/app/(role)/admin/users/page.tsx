'use client';

import React, { useState } from 'react';
import { useAuth } from '../../../lib/auth';
import { Card, CardContent } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { StatusBadge } from '../../../components/common/StatusBadge';
import { 
  Users, 
  UserPlus, 
  Search, 
  Filter, 
  MoreVertical,
  Edit,
  Trash2,
  UserCheck,
  UserX,
  Shield,
  Wrench,
  Settings,
  User,
  Mail,
  Phone,
  Calendar,
  Building,
  Download,
  Upload,
  RefreshCw
} from 'lucide-react';
import DataTable, { Column } from '../../../components/ui/DataTable';
import PageSkeleton from '../../../components/ui/PageSkeleton';
import ErrorBanner from '../../../components/ui/ErrorBanner';
import ConfirmModal from '../../../components/ui/ConfirmModal';

const AdminUsersPage: React.FC = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showAddUser, setShowAddUser] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<{ open: boolean; userId?: string; action?: 'delete' | 'toggle' }>( { open: false } );

  // Mock users data
  const allUsers = [
    {
      id: '1',
      name: 'Anya Sharma',
      email: 'anya.sharma@campus.edu',
      role: 'requester',
      department: 'IT',
      status: 'active',
      lastLogin: '2023-10-28T10:30:00Z',
      joinDate: '2023-01-15T00:00:00Z',
      phone: '+1 234-567-8901',
      avatar: 'AS'
    },
    {
      id: '2',
      name: 'Rajeev Kumar',
      email: 'rajeev.kumar@campus.edu',
      role: 'assignee',
      department: 'IT',
      status: 'active',
      lastLogin: '2023-10-28T09:15:00Z',
      joinDate: '2023-02-20T00:00:00Z',
      phone: '+1 234-567-8902',
      avatar: 'RK'
    },
    {
      id: '3',
      name: 'Ali Ahmed',
      email: 'ali.ahmed@campus.edu',
      role: 'moderator',
      department: 'IT',
      status: 'active',
      lastLogin: '2023-10-28T08:45:00Z',
      joinDate: '2023-03-10T00:00:00Z',
      phone: '+1 234-567-8903',
      avatar: 'AA'
    },
    {
      id: '4',
      name: 'Admin User',
      email: 'admin@campus.edu',
      role: 'admin',
      department: 'IT',
      status: 'active',
      lastLogin: '2023-10-28T11:20:00Z',
      joinDate: '2023-01-01T00:00:00Z',
      phone: '+1 234-567-8904',
      avatar: 'AU'
    },
    {
      id: '5',
      name: 'Sarah Johnson',
      email: 'sarah.johnson@campus.edu',
      role: 'requester',
      department: 'HR',
      status: 'inactive',
      lastLogin: '2023-10-25T16:30:00Z',
      joinDate: '2023-04-05T00:00:00Z',
      phone: '+1 234-567-8905',
      avatar: 'SJ'
    },
    {
      id: '6',
      name: 'Mike Chen',
      email: 'mike.chen@campus.edu',
      role: 'assignee',
      department: 'Electrical',
      status: 'active',
      lastLogin: '2023-10-28T07:20:00Z',
      joinDate: '2023-05-12T00:00:00Z',
      phone: '+1 234-567-8906',
      avatar: 'MC'
    }
  ];

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return <Settings className="w-4 h-4" />;
      case 'moderator': return <Shield className="w-4 h-4" />;
      case 'assignee': return <Wrench className="w-4 h-4" />;
      case 'requester': return <User className="w-4 h-4" />;
      default: return <User className="w-4 h-4" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'moderator': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'assignee': return 'bg-green-100 text-green-800 border-green-200';
      case 'requester': return 'bg-orange-100 text-orange-800 border-orange-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };


  const filteredUsers = allUsers.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  const userStats = {
    total: allUsers.length,
    active: allUsers.filter(u => u.status === 'active').length,
    admins: allUsers.filter(u => u.role === 'admin').length,
    newToday: allUsers.filter(u => new Date(u.joinDate).toDateString() === new Date().toDateString()).length
  };

  const handleEditUser = (userId: string) => {
    console.log('Edit user:', userId);
    alert(`Edit user ${userId}`);
  };

  const handleDeleteUser = (userId: string) => {
    setConfirm({ open: true, userId, action: 'delete' });
  };

  const handleToggleStatus = (userId: string) => {
    setConfirm({ open: true, userId, action: 'toggle' });
  };

  const columns: Column<any>[] = [
    { key: 'name', header: 'Name', sortable: true, accessor: (r) => (
      <div className="flex items-center">
        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold text-xs">
          {r.avatar}
        </div>
        <div className="ml-3">
          <div className="text-sm font-medium text-gray-900">{r.name}</div>
          <div className="text-sm text-gray-500 flex items-center">
            <Mail className="w-3 h-3 mr-1" />
            {r.email}
          </div>
        </div>
      </div>
    ) },
    { key: 'role', header: 'Role', sortable: true, accessor: (r) => (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getRoleColor(r.role)}`}>
        {getRoleIcon(r.role)}
        <span className="ml-1">{r.role.toUpperCase()}</span>
      </span>
    ) },
    { key: 'department', header: 'Department', sortable: true, accessor: (r) => (
      <div className="flex items-center text-sm text-gray-900">
        <Building className="w-4 h-4 mr-2 text-gray-400" />
        {r.department}
      </div>
    ) },
    { key: 'status', header: 'Status', sortable: true, accessor: (r) => (
      <StatusBadge status={r.status} withBorder={true} withIcon={true} />
    ) },
    { key: 'lastLogin', header: 'Last Login', sortable: true, accessor: (r) => (
      <div className="flex items-center text-sm text-gray-500">
        <Calendar className="w-4 h-4 mr-2 text-gray-400" />
        {new Date(r.lastLogin).toLocaleDateString()}
      </div>
    ) },
    { key: 'actions', header: 'Actions', accessor: (r) => (
      <div className="flex items-center space-x-2">
        <button
          onClick={() => handleEditUser(r.id)}
          className="text-blue-600 hover:text-blue-900 p-2 rounded-lg hover:bg-blue-50 transition-colors duration-200"
          title="Edit User"
        >
          <Edit className="w-4 h-4" />
        </button>
        <button
          onClick={() => handleToggleStatus(r.id)}
          className={`p-2 rounded-lg transition-colors duration-200 ${r.status === 'active' ? 'text-red-600 hover:text-red-900 hover:bg-red-50' : 'text-green-600 hover:text-green-900 hover:bg-green-50'}`}
          title={r.status === 'active' ? 'Deactivate User' : 'Activate User'}
        >
          {r.status === 'active' ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
        </button>
        <button
          onClick={() => handleDeleteUser(r.id)}
          className="text-red-600 hover:text-red-900 p-2 rounded-lg hover:bg-red-50 transition-colors duration-200"
          title="Delete User"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    ) },
  ];

  if (loading) return <PageSkeleton rows={8} />;
  return (
    <div className="p-8 space-y-8 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
      {/* Header Section */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold text-gray-900">
              User Management
            </h1>
            <p className="text-lg text-gray-600">Manage all system users and their permissions</p>
          </div>
          <div className="flex items-center space-x-3 bg-purple-50 rounded-xl px-4 py-3 border border-purple-200">
            <Settings className="w-6 h-6 text-purple-600" />
            <span className="text-lg font-semibold text-purple-800">System Administrator</span>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-white shadow-xl border-0 hover:shadow-2xl transition-all duration-300 cursor-pointer group">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-gray-600 text-sm font-medium uppercase tracking-wide">Total Users</p>
                <p className="text-4xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors duration-300">{userStats.total}</p>
                <p className="text-xs text-gray-500">All registered users</p>
              </div>
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Users className="w-8 h-8 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-xl border-0 hover:shadow-2xl transition-all duration-300 cursor-pointer group">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-gray-600 text-sm font-medium uppercase tracking-wide">Active Users</p>
                <p className="text-4xl font-bold text-gray-900 group-hover:text-green-600 transition-colors duration-300">{userStats.active}</p>
                <p className="text-xs text-gray-500">Currently online</p>
              </div>
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <UserCheck className="w-8 h-8 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-xl border-0 hover:shadow-2xl transition-all duration-300 cursor-pointer group">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-gray-600 text-sm font-medium uppercase tracking-wide">Admins</p>
                <p className="text-4xl font-bold text-gray-900 group-hover:text-purple-600 transition-colors duration-300">{userStats.admins}</p>
                <p className="text-xs text-gray-500">System administrators</p>
              </div>
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Settings className="w-8 h-8 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-xl border-0 hover:shadow-2xl transition-all duration-300 cursor-pointer group">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-gray-600 text-sm font-medium uppercase tracking-wide">New Today</p>
                <p className="text-4xl font-bold text-gray-900 group-hover:text-yellow-600 transition-colors duration-300">{userStats.newToday}</p>
                <p className="text-xs text-gray-500">Registered today</p>
              </div>
              <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <UserPlus className="w-8 h-8 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Actions */}
      <Card className="bg-white shadow-xl border-0">
        <CardContent className="p-8">
          <div className="flex flex-col lg:flex-row gap-6 items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-80 text-gray-900 placeholder:text-gray-400"
                />
              </div>
              
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              >
                <option value="all">All Roles</option>
                <option value="admin">Admin</option>
                <option value="moderator">Moderator</option>
                <option value="assignee">Assignee</option>
                <option value="requester">Requester</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="pending">Pending</option>
              </select>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={() => setShowAddUser(true)}
                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center space-x-2"
              >
                <UserPlus className="w-5 h-5" />
                <span>Add User</span>
              </Button>
              
              <Button className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center space-x-2">
                <Download className="w-5 h-5" />
                <span>Export</span>
              </Button>
              
              <Button className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center space-x-2">
                <Upload className="w-5 h-5" />
                <span>Import</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card className="bg-white shadow-xl border-0">
        <CardContent className="p-6 space-y-4">
          {error ? <ErrorBanner message={error} onRetry={() => setError(null)} /> : null}
          <DataTable data={filteredUsers} columns={columns} initialSort={{ key: 'name', dir: 'asc' }} pageSize={10} showSearch={false} />
        </CardContent>
      </Card>

      <ConfirmModal
        open={confirm.open}
        title={confirm.action === 'delete' ? 'Delete this user?' : 'Toggle user status?'}
        description={confirm.action === 'delete' ? 'This action cannot be undone.' : 'The user will be activated/deactivated.'}
        onCancel={() => setConfirm({ open: false })}
        onConfirm={() => {
          setConfirm({ open: false });
        }}
      />
    </div>
  );
};

export default AdminUsersPage;
