'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Search,
  Building2,
  Users,
  ArrowLeft,
  Briefcase
} from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/Button';
import { AnalyticsCard } from '@/components/common/AnalyticsCard';
import { TableSkeleton } from '@/components/skeletons/TableSkeleton';

import {
  getMockDesignations,
  getMockDepartments,
  MockDesignation
} from '../../../../lib/mockData';
import { THEME } from '../../../../lib/theme';

interface DesignationWithDept extends MockDesignation {
  dept_name?: string;
}

const DesignationsListPage: React.FC = () => {
  const router = useRouter();
  const [designations, setDesignations] = useState<DesignationWithDept[]>([]);
  const [search, setSearch] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate fetch
    setIsLoading(true);
    setTimeout(() => {
      const allDesignations = getMockDesignations();
      const departments = getMockDepartments();

      // Enrich designations with department names
      const enrichedDesignations = allDesignations.map(desig => ({
        ...desig,
        dept_name: departments.find(d => d.dept_code === desig.dept_code)?.dept_name || 'Unknown'
      }));

      setDesignations(enrichedDesignations);
      setIsLoading(false);
    }, 500);
  }, []);

  const filteredDesignations = useMemo(() => {
    return designations.filter(desig => {
      const matchesSearch =
        desig.position_name.toLowerCase().includes(search.toLowerCase()) ||
        desig.position_code.toLowerCase().includes(search.toLowerCase()) ||
        (desig.dept_name && desig.dept_name.toLowerCase().includes(search.toLowerCase()));

      const matchesDepartment = !departmentFilter || desig.dept_code === departmentFilter;

      return matchesSearch && matchesDepartment;
    });
  }, [designations, search, departmentFilter]);

  const stats = useMemo(() => {
    return {
      total: designations.length,
      departments: new Set(designations.map(d => d.dept_code)).size
    };
  }, [designations]);

  const allDepartments = getMockDepartments();

  if (isLoading) {
    return <TableSkeleton />;
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-4 md:space-y-6 min-h-screen" style={{ backgroundColor: THEME.colors.background }}>
      {/* Page Header */}
      <Card className="bg-white rounded-2xl shadow-xl border-0">
        <CardContent className="p-4 md:p-6 lg:p-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.back()}
                  leftIcon={<ArrowLeft className="w-4 h-4" />}
                >
                  Back
                </Button>
                <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold" style={{ color: THEME.colors.primary }}>
                  All Designations
                </h1>
              </div>
              <p className="text-sm md:text-base" style={{ color: THEME.colors.gray }}>
                View all job positions across departments
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
        <AnalyticsCard
          title="Total Designations"
          value={stats.total}
          icon={Briefcase}
          color={THEME.colors.primary}
          hoverDescription="All job positions"
        />
        <AnalyticsCard
          title="Departments"
          value={stats.departments}
          icon={Building2}
          color={THEME.colors.medium}
          hoverDescription="Departments with designations"
        />
      </div>

      {/* Search & Filter */}
      <Card className="bg-white rounded-2xl shadow-xl border-0">
        <CardContent className="p-4 md:p-6">
          <div className="space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2" style={{ color: THEME.colors.gray }} size={20} />
              <input
                type="text"
                placeholder="Search by position name, code, or department..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 md:py-3 border rounded-xl focus:outline-none focus:ring-2 text-sm md:text-base"
                style={{
                  borderColor: THEME.colors.background,
                }}
              />
            </div>

            {/* Department Filter */}
            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: THEME.colors.primary }}>
                Filter by Department
              </label>
              <select
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
                className="w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 text-sm md:text-base"
                style={{
                  borderColor: THEME.colors.background,
                }}
              >
                <option value="">All Departments</option>
                {allDepartments.map((dept) => (
                  <option key={dept.dept_code} value={dept.dept_code}>
                    {dept.dept_name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {(search || departmentFilter) && (
        <Button variant="outline" onClick={() => { setSearch(''); setDepartmentFilter(''); }}>
          Clear Filters
        </Button>
      )}

      <div className="overflow-x-auto -mx-4 md:mx-0">
        <div className="inline-block min-w-full align-middle">
          <div className="overflow-hidden">
            <table className="min-w-full divide-y" style={{ borderColor: THEME.colors.background }}>
              <thead>
                <tr className="border-b-2" style={{ borderColor: THEME.colors.background }}>
                  <th className="text-left py-3 px-4 text-xs md:text-sm font-semibold whitespace-nowrap" style={{ color: THEME.colors.primary }}>Code</th>
                  <th className="text-left py-3 px-4 text-xs md:text-sm font-semibold whitespace-nowrap" style={{ color: THEME.colors.primary }}>Position Name</th>
                  <th className="text-left py-3 px-4 text-xs md:text-sm font-semibold whitespace-nowrap" style={{ color: THEME.colors.primary }}>Department</th>
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: THEME.colors.background }}>
                {filteredDesignations.map((desig, index) => (
                  <tr key={index} className="hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-4 text-xs md:text-sm font-medium whitespace-nowrap" style={{ color: THEME.colors.primary }}>{desig.position_code}</td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold text-white" style={{ backgroundColor: THEME.colors.primary }}>
                          {desig.position_name.charAt(0)}
                        </div>
                        <span className="text-xs md:text-sm font-medium" style={{ color: THEME.colors.primary }}>
                          {desig.position_name}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-xs md:text-sm whitespace-nowrap">
                      <span className="px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
                        {desig.dept_name}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DesignationsListPage;
