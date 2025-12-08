'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../../../lib/auth';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/card';
import { Button } from '../../../../components/ui/Button';
import { THEME } from '../../../../lib/theme';
import ticketService from '../../../../services/api/ticketService';
import userService from '../../../../services/api/userService';
import { Ticket } from '../../../../types';
import { User } from '../../../../types';
import { formatDate } from '../../../../lib/helpers';
import {
  FileText,
  Download,
  Calendar,
  Filter,
  User as UserIcon,
  Building2,
  CheckCircle,
  FileJson,
  FileSpreadsheet,
  FileType,
  RefreshCw,
  Settings
} from 'lucide-react';

// Generate demo data
const generateDemoTickets = (): Ticket[] => {
  const now = new Date();
  return Array.from({ length: 150 }, (_, i) => ({
    id: `ticket-${i + 1}`,
    ticketId: `TKT-${String(i + 1).padStart(3, '0')}`,
    subject: `Sample Ticket ${i + 1}`,
    description: `Description for ticket ${i + 1}`,
    department: ['Development', 'Finance & Accounts', 'Procurement', 'Basic Maintenance', 'IT', 'Architecture', 'Administration'][i % 7],
    priority: ['low', 'medium', 'high', 'urgent'][i % 4] as any,
    status: ['assigned', 'in_progress', 'resolved', 'completed', 'pending'][i % 5] as any,
    requestorId: `req-${i + 1}`,
    requestorName: `User ${i + 1}`,
    submittedDate: new Date(now.getTime() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString(),
    assignedDate: new Date(now.getTime() - Math.random() * 60 * 24 * 60 * 60 * 1000).toISOString(),
    ...(i % 3 === 0 && {
      completedDate: new Date(now.getTime() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      resolvedDate: new Date(now.getTime() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
    }),
  }));
};

const generateDemoUsers = (): User[] => {
  return Array.from({ length: 50 }, (_, i) => ({
    id: `user-${i + 1}`,
    name: `User ${i + 1}`,
    email: `user${i + 1}@example.com`,
    role: ['requestor', 'assignee', 'moderator', 'admin'][i % 4] as any,
    department: ['Development', 'Finance & Accounts', 'Procurement', 'Basic Maintenance', 'IT', 'Architecture', 'Administration'][i % 7],
    status: 'active',
  }));
};

const AdminReportsPage: React.FC = () => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);

  // Report Generator State
  const [reportType, setReportType] = useState<string>('ticket_summary');
  const [dateRange, setDateRange] = useState<{ from: string; end: string }>({
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0],
  });
  const [filters, setFilters] = useState<{
    userId: string;
    department: string;
    status: string;
  }>({
    userId: '',
    department: '',
    status: '',
  });
  const [exportFormat, setExportFormat] = useState<'csv' | 'json' | 'pdf'>('csv');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch tickets
        try {
          const ticketsResponse = await ticketService.getTickets();
          const ticketsList = Array.isArray(ticketsResponse)
            ? ticketsResponse
            : (ticketsResponse?.results || []);
          setTickets(ticketsList.length > 0 ? ticketsList : generateDemoTickets());
        } catch (error: any) {
          const isNetworkError = error?.isNetworkError || !error?.response;
          if (isNetworkError) {
            console.warn('API not available, using demo tickets');
            setTickets(generateDemoTickets());
          } else {
            throw error;
          }
        }

        // Fetch users
        try {
          const usersResponse = await userService.getUsers();
          const usersList = Array.isArray(usersResponse)
            ? usersResponse
            : (usersResponse?.results || []);
          setUsers(usersList.length > 0 ? usersList : generateDemoUsers());
        } catch (error: any) {
          const isNetworkError = error?.isNetworkError || !error?.response;
          if (isNetworkError) {
            console.warn('API not available, using demo users');
            setUsers(generateDemoUsers());
          }
        }
      } catch (error: any) {
        console.error('Error fetching data:', error);
        setError('Failed to load data');
        setTickets(generateDemoTickets());
        setUsers(generateDemoUsers());
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Get unique departments
  const departments = useMemo(() => {
    return Array.from(new Set(tickets.map(t => t.department).filter(Boolean))).sort();
  }, [tickets]);

  // Filter tickets based on report criteria
  const filteredTickets = useMemo(() => {
    return tickets.filter(t => {
      const ticketDate = new Date(t.submittedDate);
      const fromDate = new Date(dateRange.from);
      const endDate = new Date(dateRange.end);
      endDate.setHours(23, 59, 59, 999);

      const matchesDate = ticketDate >= fromDate && ticketDate <= endDate;
      const matchesUser = !filters.userId || t.requestorId === filters.userId;
      const matchesDepartment = !filters.department || t.department === filters.department;
      const matchesStatus = !filters.status || t.status === filters.status;

      return matchesDate && matchesUser && matchesDepartment && matchesStatus;
    });
  }, [tickets, dateRange, filters]);

  const handleGenerateReport = async () => {
    setGenerating(true);

    // Simulate report generation
    await new Promise(resolve => setTimeout(resolve, 2000));

    // In real implementation, this would call an API to generate the report
    const reportData = {
      type: reportType,
      dateRange,
      filters,
      format: exportFormat,
      ticketCount: filteredTickets.length,
      tickets: filteredTickets,
    };

    // Export based on format
    if (exportFormat === 'csv') {
      exportToCSV(reportData);
    } else if (exportFormat === 'json') {
      exportToJSON(reportData);
    } else if (exportFormat === 'pdf') {
      exportToPDF(reportData);
    }

    setGenerating(false);
    alert(`Report generated and exported as ${exportFormat.toUpperCase()}`);
  };

  const exportToCSV = (data: any) => {
    const headers = ['Ticket ID', 'Subject', 'Department', 'Priority', 'Status', 'requestor', 'Submitted Date', 'Resolved Date'];
    const rows = filteredTickets.map(t => [
      t.ticketId || t.id,
      t.subject,
      t.department || 'N/A',
      t.priority,
      t.status,
      t.requestorName || 'N/A',
      formatDate(t.submittedDate),
      t.resolvedDate ? formatDate(t.resolvedDate) : 'N/A',
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `report_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const exportToJSON = (data: any) => {
    const jsonContent = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `report_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const exportToPDF = (data: any) => {
    // In real implementation, this would use a PDF library like jsPDF
    alert('PDF export functionality would be implemented with a PDF library like jsPDF');
  };

  if (loading) {
    return (
      <div className="p-4 md:p-8 flex items-center justify-center min-h-screen" style={{ backgroundColor: THEME.colors.background }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: THEME.colors.primary }}></div>
          <p style={{ color: THEME.colors.gray }}>Loading reports...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-4 md:space-y-6 min-h-screen" style={{ backgroundColor: THEME.colors.background }}>
      {/* Page Header */}
      <Card className="bg-white rounded-2xl shadow-xl border-0">
        <CardContent className="p-4 md:p-6 lg:p-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-2" style={{ color: THEME.colors.primary }}>
                Reports & Audit Logs
              </h1>
              <p className="text-sm md:text-base" style={{ color: THEME.colors.gray }}>
                Generate comprehensive reports and view system audit logs
              </p>
            </div>
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl border" style={{ backgroundColor: THEME.colors.background, borderColor: THEME.colors.light }}>
              <Settings className="w-5 h-5 md:w-6 md:h-6" style={{ color: THEME.colors.primary }} />
              <span className="text-base md:text-lg font-semibold" style={{ color: THEME.colors.primary }}>
                System Administrator
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Report Generator */}
      <Card className="bg-white rounded-2xl shadow-xl border-0">
        <CardHeader className="p-4 md:p-6 lg:p-8 pb-2 md:pb-4">
          <CardTitle className="text-lg md:text-xl lg:text-2xl font-bold" style={{ color: THEME.colors.primary }}>
            Report Generator
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 md:p-6 lg:p-8 pt-2 md:pt-4">
          <div className="space-y-6">
            {/* Report Type */}
            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: THEME.colors.primary }}>
                Report Type <span className="text-red-500">*</span>
              </label>
              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                className="w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 text-sm md:text-base"
                style={{ borderColor: THEME.colors.background }}
              >
                <option value="ticket_summary">Ticket Summary Report</option>
                <option value="department_performance">Department Performance Report</option>
                <option value="user_activity">User Activity Report</option>
                <option value="ticket_category">Ticket Category Analysis</option>
                <option value="time_to_resolution">Time-to-Resolution Analysis</option>
                <option value="sla_compliance">SLA Compliance Report</option>
                <option value="audit_log">Audit Log Report</option>
              </select>
            </div>

            {/* Date Range */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: THEME.colors.primary }}>
                  From Date <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2" style={{ color: THEME.colors.gray }} size={18} />
                  <input
                    type="date"
                    value={dateRange.from}
                    onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
                    className="w-full pl-10 pr-4 py-2 border rounded-xl focus:outline-none focus:ring-2 text-sm md:text-base"
                    style={{ borderColor: THEME.colors.background }}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: THEME.colors.primary }}>
                  To Date <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2" style={{ color: THEME.colors.gray }} size={18} />
                  <input
                    type="date"
                    value={dateRange.end}
                    onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                    className="w-full pl-10 pr-4 py-2 border rounded-xl focus:outline-none focus:ring-2 text-sm md:text-base"
                    style={{ borderColor: THEME.colors.background }}
                  />
                </div>
              </div>
            </div>

            {/* Filters */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Filter className="w-4 h-4" style={{ color: THEME.colors.primary }} />
                <h3 className="text-sm font-semibold" style={{ color: THEME.colors.primary }}>
                  Filters
                </h3>

              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: THEME.colors.primary }}>
                    User
                  </label>
                  <div className="relative">
                    <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2" style={{ color: THEME.colors.gray }} size={18} />
                    <select
                      value={filters.userId}
                      onChange={(e) => setFilters({ ...filters, userId: e.target.value })}
                      className="w-full pl-10 pr-4 py-2 border rounded-xl focus:outline-none focus:ring-2 text-sm md:text-base"
                      style={{ borderColor: THEME.colors.background }}
                    >
                      <option value="">All Users</option>
                      {users.map(u => (
                        <option key={u.id} value={u.id}>{u.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: THEME.colors.primary }}>
                    Department
                  </label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2" style={{ color: THEME.colors.gray }} size={18} />
                    <select
                      value={filters.department}
                      onChange={(e) => setFilters({ ...filters, department: e.target.value })}
                      className="w-full pl-10 pr-4 py-2 border rounded-xl focus:outline-none focus:ring-2 text-sm md:text-base"
                      style={{ borderColor: THEME.colors.background }}
                    >
                      <option value="">All Departments</option>
                      {departments.map(dept => (
                        <option key={dept} value={dept}>{dept}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: THEME.colors.primary }}>
                    Status
                  </label>
                  <div className="relative">
                    <CheckCircle className="absolute left-3 top-1/2 transform -translate-y-1/2" style={{ color: THEME.colors.gray }} size={18} />
                    <select
                      value={filters.status}
                      onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                      className="w-full pl-10 pr-4 py-2 border rounded-xl focus:outline-none focus:ring-2 text-sm md:text-base"
                      style={{ borderColor: THEME.colors.background }}
                    >
                      <option value="">All Status</option>
                      <option value="pending">Pending</option>
                      <option value="assigned">Assigned</option>
                      <option value="in_progress">In Progress</option>
                      <option value="resolved">Resolved</option>
                      <option value="completed">Completed</option>
                      <option value="closed">Closed</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Export Format */}
            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: THEME.colors.primary }}>
                Export Format <span className="text-red-500">*</span>
              </label>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => setExportFormat('csv')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-colors ${exportFormat === 'csv' ? 'border-blue-600 bg-blue-50' : 'border-gray-300 hover:bg-gray-50'
                    }`}
                  style={exportFormat === 'csv' ? { borderColor: THEME.colors.primary, backgroundColor: THEME.colors.background } : {}}
                >
                  <FileSpreadsheet className="w-4 h-4" style={{ color: exportFormat === 'csv' ? THEME.colors.primary : THEME.colors.gray }} />
                  <span className="text-sm font-medium" style={{ color: exportFormat === 'csv' ? THEME.colors.primary : THEME.colors.gray }}>
                    CSV
                  </span>
                </button>
                <button
                  onClick={() => setExportFormat('json')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-colors ${exportFormat === 'json' ? 'border-blue-600 bg-blue-50' : 'border-gray-300 hover:bg-gray-50'
                    }`}
                  style={exportFormat === 'json' ? { borderColor: THEME.colors.primary, backgroundColor: THEME.colors.background } : {}}
                >
                  <FileJson className="w-4 h-4" style={{ color: exportFormat === 'json' ? THEME.colors.primary : THEME.colors.gray }} />
                  <span className="text-sm font-medium" style={{ color: exportFormat === 'json' ? THEME.colors.primary : THEME.colors.gray }}>
                    JSON
                  </span>
                </button>
                <button
                  onClick={() => setExportFormat('pdf')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-colors ${exportFormat === 'pdf' ? 'border-blue-600 bg-blue-50' : 'border-gray-300 hover:bg-gray-50'
                    }`}
                  style={exportFormat === 'pdf' ? { borderColor: THEME.colors.primary, backgroundColor: THEME.colors.background } : {}}
                >
                  <FileType className="w-4 h-4" style={{ color: exportFormat === 'pdf' ? THEME.colors.primary : THEME.colors.gray }} />
                  <span className="text-sm font-medium" style={{ color: exportFormat === 'pdf' ? THEME.colors.primary : THEME.colors.gray }}>
                    PDF
                  </span>
                </button>
              </div>
            </div>

            {/* Generate Button */}
            <div className="flex items-center justify-between pt-4 border-t" style={{ borderColor: THEME.colors.background }}>
              <div className="text-sm" style={{ color: THEME.colors.gray }}>
                {filteredTickets.length} ticket{filteredTickets.length !== 1 ? 's' : ''} match your criteria
              </div>
              <Button
                variant="primary"
                leftIcon={generating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
                onClick={handleGenerateReport}
                loading={generating}
                disabled={generating}
              >
                Generate Report
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Preview Section */}
      {filteredTickets.length > 0 && (
        <Card className="bg-white rounded-2xl shadow-xl border-0">
          <CardHeader className="p-4 md:p-6 lg:p-8 pb-2 md:pb-4">
            <CardTitle className="text-lg md:text-xl font-bold" style={{ color: THEME.colors.primary }}>
              Report Preview
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 md:p-6 lg:p-8 pt-2 md:pt-4">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2" style={{ borderColor: THEME.colors.background }}>
                    <th className="text-left py-3 px-4 text-sm font-semibold" style={{ color: THEME.colors.primary }}>Ticket ID</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold" style={{ color: THEME.colors.primary }}>Subject</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold" style={{ color: THEME.colors.primary }}>Department</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold" style={{ color: THEME.colors.primary }}>Priority</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold" style={{ color: THEME.colors.primary }}>Status</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold" style={{ color: THEME.colors.primary }}>Submitted Date</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTickets.slice(0, 10).map((ticket) => (
                    <tr key={ticket.id} className="border-b hover:bg-gray-50" style={{ borderColor: THEME.colors.background }}>
                      <td className="py-3 px-4 text-sm font-medium" style={{ color: THEME.colors.primary }}>
                        {ticket.ticketId || ticket.id}
                      </td>
                      <td className="py-3 px-4 text-sm" style={{ color: THEME.colors.gray }}>{ticket.subject}</td>
                      <td className="py-3 px-4 text-sm" style={{ color: THEME.colors.gray }}>{ticket.department || 'N/A'}</td>
                      <td className="py-3 px-4 text-sm">
                        <span className="px-2 py-1 rounded text-xs font-medium capitalize" style={{
                          backgroundColor: ticket.priority === 'urgent' ? '#FEE2E2' : ticket.priority === 'high' ? '#FEF3C7' : ticket.priority === 'medium' ? '#DBEAFE' : '#D1FAE5',
                          color: ticket.priority === 'urgent' ? '#991B1B' : ticket.priority === 'high' ? '#92400E' : ticket.priority === 'medium' ? '#1E40AF' : '#065F46',
                        }}>
                          {ticket.priority}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm">
                        <span className="px-2 py-1 rounded text-xs font-medium capitalize" style={{
                          backgroundColor: ticket.status === 'completed' || ticket.status === 'resolved' ? '#D1FAE5' : ticket.status === 'in_progress' ? '#DBEAFE' : '#FEF3C7',
                          color: ticket.status === 'completed' || ticket.status === 'resolved' ? '#065F46' : ticket.status === 'in_progress' ? '#1E40AF' : '#92400E',
                        }}>
                          {ticket.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm" style={{ color: THEME.colors.gray }}>
                        {formatDate(ticket.submittedDate)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredTickets.length > 10 && (
                <div className="mt-4 text-center text-sm" style={{ color: THEME.colors.gray }}>
                  Showing 10 of {filteredTickets.length} tickets. Full report will be exported.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error Banner */}
      {error && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
          <p className="text-sm text-yellow-800">
            {error} - Showing demo data for demonstration purposes.
          </p>
        </div>
      )}
    </div>
  );
};

export default AdminReportsPage;
