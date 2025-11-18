'use client';

import React, { useState } from 'react';
import { useAuth } from '../../../lib/auth';
import { Card, CardContent } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { 
  BarChart3, 
  TrendingUp, 
  Download, 
  Calendar,
  Filter,
  RefreshCw,
  FileText,
  Users,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Activity,
  PieChart,
  LineChart,
  Target,
  Award,
  Zap
} from 'lucide-react';

const AdminReportsPage: React.FC = () => {
  const { user, tickets } = useAuth();
  const [selectedPeriod, setSelectedPeriod] = useState('30');
  const [reportType, setReportType] = useState('overview');

  // Calculate analytics data
  const totalTickets = tickets.length;
  const resolvedTickets = tickets.filter(t => t.status === 'resolved').length;
  const pendingTickets = tickets.filter(t => t.status === 'pending').length;
  const inProgressTickets = tickets.filter(t => t.status === 'in_progress').length;
  const rejectedTickets = tickets.filter(t => t.status === 'rejected').length;

  const resolutionRate = totalTickets > 0 ? Math.round((resolvedTickets / totalTickets) * 100) : 0;
  const avgResolutionTime = '2.3 days';

  // Department-wise data
  const departmentStats = [
    { name: 'IT', total: 25, resolved: 20, pending: 3, inProgress: 2 },
    { name: 'HR', total: 18, resolved: 15, pending: 2, inProgress: 1 },
    { name: 'Electrical', total: 22, resolved: 18, pending: 2, inProgress: 2 },
    { name: 'Procurement', total: 15, resolved: 12, pending: 2, inProgress: 1 },
    { name: 'Accounts', total: 12, resolved: 10, pending: 1, inProgress: 1 },
    { name: 'Furniture', total: 8, resolved: 6, pending: 1, inProgress: 1 }
  ];

  // Priority distribution
  const priorityStats = [
    { name: 'Urgent', count: tickets.filter(t => t.priority === 'urgent').length, color: 'bg-red-500' },
    { name: 'High', count: tickets.filter(t => t.priority === 'high').length, color: 'bg-orange-500' },
    { name: 'Medium', count: tickets.filter(t => t.priority === 'medium').length, color: 'bg-yellow-500' },
    { name: 'Low', count: tickets.filter(t => t.priority === 'low').length, color: 'bg-green-500' }
  ];

  // Status distribution
  const statusStats = [
    { name: 'Resolved', count: resolvedTickets, color: 'bg-green-500' },
    { name: 'In Progress', count: inProgressTickets, color: 'bg-yellow-500' },
    { name: 'Pending', count: pendingTickets, color: 'bg-red-500' },
    { name: 'Rejected', count: rejectedTickets, color: 'bg-gray-500' }
  ];

  const handleGenerateReport = (type: string) => {
    console.log('Generating report:', type);
    alert(`Generating ${type} report...`);
  };

  const handleExportReport = (format: string) => {
    console.log('Exporting report as:', format);
    alert(`Exporting report as ${format}...`);
  };

  return (
    <div className="p-8 space-y-8 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
      {/* Header Section */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold text-gray-900">
              Reports & Analytics
            </h1>
            <p className="text-lg text-gray-600">Comprehensive system performance and analytics reports</p>
          </div>
          <div className="flex items-center space-x-3 bg-purple-50 rounded-xl px-4 py-3 border border-purple-200">
            <BarChart3 className="w-6 h-6 text-purple-600" />
            <span className="text-lg font-semibold text-purple-800">System Administrator</span>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-white shadow-xl border-0 hover:shadow-2xl transition-all duration-300 cursor-pointer group">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-gray-600 text-sm font-medium uppercase tracking-wide">Total Tickets</p>
                <p className="text-4xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors duration-300">{totalTickets}</p>
                <p className="text-xs text-gray-500">All time</p>
              </div>
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <FileText className="w-8 h-8 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-xl border-0 hover:shadow-2xl transition-all duration-300 cursor-pointer group">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-gray-600 text-sm font-medium uppercase tracking-wide">Resolution Rate</p>
                <p className="text-4xl font-bold text-gray-900 group-hover:text-green-600 transition-colors duration-300">{resolutionRate}%</p>
                <p className="text-xs text-gray-500">Success rate</p>
              </div>
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-xl border-0 hover:shadow-2xl transition-all duration-300 cursor-pointer group">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-gray-600 text-sm font-medium uppercase tracking-wide">Avg Resolution</p>
                <p className="text-4xl font-bold text-gray-900 group-hover:text-yellow-600 transition-colors duration-300">{avgResolutionTime}</p>
                <p className="text-xs text-gray-500">Time to resolve</p>
              </div>
              <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Clock className="w-8 h-8 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-xl border-0 hover:shadow-2xl transition-all duration-300 cursor-pointer group">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-gray-600 text-sm font-medium uppercase tracking-wide">Active Tickets</p>
                <p className="text-4xl font-bold text-gray-900 group-hover:text-orange-600 transition-colors duration-300">{pendingTickets + inProgressTickets}</p>
                <p className="text-xs text-gray-500">In progress</p>
              </div>
              <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Activity className="w-8 h-8 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Report Controls */}
      <Card className="bg-white shadow-xl border-0">
        <CardContent className="p-8">
          <div className="flex flex-col lg:flex-row gap-6 items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              <div className="flex items-center space-x-2">
                <Calendar className="w-5 h-5 text-gray-400" />
                <select
                  value={selectedPeriod}
                  onChange={(e) => setSelectedPeriod(e.target.value)}
                  className="px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="7">Last 7 days</option>
                  <option value="30">Last 30 days</option>
                  <option value="90">Last 90 days</option>
                  <option value="365">Last year</option>
                </select>
              </div>

              <div className="flex items-center space-x-2">
                <Filter className="w-5 h-5 text-gray-400" />
                <select
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value)}
                  className="px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="overview">Overview Report</option>
                  <option value="department">Department Report</option>
                  <option value="performance">Performance Report</option>
                  <option value="trends">Trends Report</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={() => handleGenerateReport(reportType)}
                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center space-x-2"
              >
                <BarChart3 className="w-5 h-5" />
                <span>Generate Report</span>
              </Button>
              
              <Button
                onClick={() => handleExportReport('PDF')}
                className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center space-x-2"
              >
                <Download className="w-5 h-5" />
                <span>Export PDF</span>
              </Button>
              
              <Button
                onClick={() => handleExportReport('Excel')}
                className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center space-x-2"
              >
                <Download className="w-5 h-5" />
                <span>Export Excel</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Status Distribution Chart */}
        <Card className="bg-white shadow-xl border-0">
          <CardContent className="p-8">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                <PieChart className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">Status Distribution</h3>
            </div>
            
            <div className="space-y-4">
              {statusStats.map((status, index) => (
                <div key={status.name} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-4 h-4 rounded-full ${status.color}`}></div>
                    <span className="text-sm font-medium text-gray-700">{status.name}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-bold text-gray-900">{status.count}</span>
                    <span className="text-xs text-gray-500">
                      ({totalTickets > 0 ? Math.round((status.count / totalTickets) * 100) : 0}%)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Priority Distribution Chart */}
        <Card className="bg-white shadow-xl border-0">
          <CardContent className="p-8">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">Priority Distribution</h3>
            </div>
            
            <div className="space-y-4">
              {priorityStats.map((priority, index) => (
                <div key={priority.name} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-4 h-4 rounded-full ${priority.color}`}></div>
                    <span className="text-sm font-medium text-gray-700">{priority.name}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-bold text-gray-900">{priority.count}</span>
                    <span className="text-xs text-gray-500">
                      ({totalTickets > 0 ? Math.round((priority.count / totalTickets) * 100) : 0}%)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Department Performance Table */}
      <Card className="bg-white shadow-xl border-0">
        <CardContent className="p-8">
          <div className="flex items-center space-x-3 mb-8">
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
              <Target className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900">Department Performance</h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Resolved</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pending</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">In Progress</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Resolution Rate</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {departmentStats.map((dept, index) => (
                  <tr key={dept.name} className="hover:bg-gray-50 transition-colors duration-200">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{dept.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{dept.total}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-semibold">{dept.resolved}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 font-semibold">{dept.pending}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-yellow-600 font-semibold">{dept.inProgress}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                          <div 
                            className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full transition-all duration-1000"
                            style={{ width: `${dept.total > 0 ? (dept.resolved / dept.total) * 100 : 0}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-semibold text-gray-900">
                          {dept.total > 0 ? Math.round((dept.resolved / dept.total) * 100) : 0}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Quick Report Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-white shadow-xl border-0 hover:shadow-2xl transition-all duration-300 cursor-pointer group">
          <CardContent className="p-6 text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
              <TrendingUp className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Performance Report</h3>
            <p className="text-sm text-gray-600 mb-4">Detailed performance metrics and KPIs</p>
            <Button
              onClick={() => handleGenerateReport('performance')}
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl"
            >
              Generate
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-xl border-0 hover:shadow-2xl transition-all duration-300 cursor-pointer group">
          <CardContent className="p-6 text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
              <Award className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Department Report</h3>
            <p className="text-sm text-gray-600 mb-4">Department-wise analysis and comparison</p>
            <Button
              onClick={() => handleGenerateReport('department')}
              className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-xl"
            >
              Generate
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-xl border-0 hover:shadow-2xl transition-all duration-300 cursor-pointer group">
          <CardContent className="p-6 text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
              <LineChart className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Trends Report</h3>
            <p className="text-sm text-gray-600 mb-4">Historical trends and forecasting</p>
            <Button
              onClick={() => handleGenerateReport('trends')}
              className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white rounded-xl"
            >
              Generate
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminReportsPage;
