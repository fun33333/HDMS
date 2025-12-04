'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../../components/ui/card';
import { Button } from '../../../../../components/ui/Button';
import { THEME } from '../../../../../lib/theme';
import { getMockDepartmentById, getMockDesignationsByDept, getMockDepartments, MockDepartment, MockDesignation } from '../../../../../lib/mockData';
import {
    ArrowLeft,
    Building2,
    Briefcase,
    Plus,
    Layers,
    FileText,
    ChevronDown,
    ChevronUp
} from 'lucide-react';

const DepartmentDetailPage: React.FC = () => {
    const params = useParams();
    const router = useRouter();
    const { id } = params;

    const [department, setDepartment] = useState<MockDepartment | null>(null);
    const [designations, setDesignations] = useState<MockDesignation[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Modal State
    const [showAddDesignationModal, setShowAddDesignationModal] = useState(false);
    const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
    const [newDesignation, setNewDesignation] = useState({
        dept_code: '',
        position_code: '',
        position_name: '',
        description: '',
        job_grade: '',
        qualifications: '',
        reports_to: ''
    });

    useEffect(() => {
        if (id) {
            setIsLoading(true);
            // Simulate fetch
            setTimeout(() => {
                const dept = getMockDepartmentById(id as string);
                if (dept) {
                    setDepartment(dept);
                    setDesignations(getMockDesignationsByDept(dept.dept_code));
                }
                setIsLoading(false);
            }, 500);
        }
    }, [id]);

    const handleAddDesignation = () => {
        if (!newDesignation.position_code || !newDesignation.position_name || !newDesignation.dept_code) return;

        const newDesig: MockDesignation = {
            position_code: newDesignation.position_code,
            position_name: newDesignation.position_name,
            dept_code: newDesignation.dept_code
        };

        setDesignations([...designations, newDesig]);
        setNewDesignation({
            dept_code: '',
            position_code: '',
            position_name: '',
            description: '',
            job_grade: '',
            qualifications: '',
            reports_to: ''
        });
        setShowAddDesignationModal(false);
        setShowAdvancedOptions(false);
    };

    if (isLoading) {
        return (
            <div className="p-8 flex justify-center items-center min-h-screen" style={{ backgroundColor: THEME.colors.background }}>
                <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: THEME.colors.primary }}></div>
            </div>
        );
    }

    if (!department) {
        return (
            <div className="p-8 flex justify-center items-center min-h-screen" style={{ backgroundColor: THEME.colors.background }}>
                <div className="text-center">
                    <h2 className="text-xl font-bold mb-2">Department Not Found</h2>
                    <Button variant="primary" onClick={() => router.push('/admin/departments')}>Back to List</Button>
                </div>
            </div>
        );
    }

    const allDepartments = getMockDepartments();

    return (
        <div className="p-4 md:p-6 lg:p-8 min-h-screen" style={{ backgroundColor: THEME.colors.background }}>
            <Button
                variant="outline"
                onClick={() => router.back()}
                className="mb-6"
                leftIcon={<ArrowLeft className="w-4 h-4" />}
            >
                Back to List
            </Button>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Department Info */}
                <div className="lg:col-span-1 space-y-6">
                    <Card className="bg-white rounded-2xl shadow-xl border-0">
                        <CardHeader className="p-6 border-b">
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold text-white" style={{ backgroundColor: THEME.colors.primary }}>
                                    {department.dept_name.charAt(0)}
                                </div>
                                <div>
                                    <CardTitle className="text-xl font-bold" style={{ color: THEME.colors.primary }}>
                                        {department.dept_name}
                                    </CardTitle>
                                    <p className="text-sm font-medium mt-1" style={{ color: THEME.colors.gray }}>
                                        {department.dept_code}
                                    </p>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-6 space-y-4">
                            <div>
                                <label className="text-sm font-medium text-gray-500 flex items-center gap-2 mb-1">
                                    <Layers className="w-4 h-4" /> Sector
                                </label>
                                <p className="text-gray-900 font-medium">{department.sector}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500 flex items-center gap-2 mb-1">
                                    <FileText className="w-4 h-4" /> Description
                                </label>
                                <p className="text-gray-900 text-sm leading-relaxed">{department.description}</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Designations List */}
                <div className="lg:col-span-2">
                    <Card className="bg-white rounded-2xl shadow-xl border-0 h-full">
                        <CardHeader className="p-6 border-b flex flex-row items-center justify-between">
                            <CardTitle className="text-xl font-bold flex items-center gap-2" style={{ color: THEME.colors.primary }}>
                                <Briefcase className="w-5 h-5" /> Designations
                            </CardTitle>
                            <Button
                                variant="primary"
                                size="sm"
                                leftIcon={<Plus className="w-4 h-4" />}
                                onClick={() => setShowAddDesignationModal(true)}
                            >
                                Add Designation
                            </Button>
                        </CardHeader>
                        <CardContent className="p-0">
                            {designations.length === 0 ? (
                                <div className="text-center py-12 text-gray-500">
                                    <p>No designations found for this department.</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="text-left py-3 px-6 text-xs font-semibold text-gray-600 uppercase tracking-wider">Code</th>
                                                <th className="text-left py-3 px-6 text-xs font-semibold text-gray-600 uppercase tracking-wider">Position Name</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {designations.map((desig, index) => (
                                                <tr key={index} className="hover:bg-gray-50 transition-colors">
                                                    <td className="py-4 px-6 text-sm font-medium text-blue-600">{desig.position_code}</td>
                                                    <td className="py-4 px-6 text-sm text-gray-900">{desig.position_name}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Add Designation Modal */}
            {showAddDesignationModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
                    <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full my-8">
                        <div className="p-6 border-b">
                            <h3 className="text-2xl font-bold text-gray-900">Add Designation</h3>
                            <p className="text-sm text-gray-500 mt-1">Create a new position for your organization</p>
                        </div>

                        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                            {/* SECTION 1: DEPARTMENT */}
                            <div>
                                <h4 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-3 flex items-center gap-2">
                                    <Building2 className="w-4 h-4" /> Section 1: Department
                                </h4>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Select Department <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        value={newDesignation.dept_code}
                                        onChange={e => setNewDesignation({ ...newDesignation, dept_code: e.target.value })}
                                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                    >
                                        <option value="">Select Department</option>
                                        {allDepartments.map(dept => (
                                            <option key={dept.dept_code} value={dept.dept_code}>
                                                {dept.dept_code} - {dept.dept_name}
                                            </option>
                                        ))}
                                    </select>
                                    <p className="text-xs text-gray-500 mt-1">Choose which department this designation belongs to</p>
                                </div>
                            </div>

                            {/* SECTION 2: DESIGNATION DETAILS */}
                            <div>
                                <h4 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-3 flex items-center gap-2">
                                    <Briefcase className="w-4 h-4" /> Section 2: Designation Details
                                </h4>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Position Code <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            maxLength={10}
                                            placeholder="Examples: T (Teacher), P (Principal), DEV (Developer), ACC (Accountant)"
                                            value={newDesignation.position_code}
                                            onChange={e => setNewDesignation({ ...newDesignation, position_code: e.target.value.toUpperCase() })}
                                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                        />
                                        <p className="text-xs text-gray-500 mt-1">Short code used in employee codes (must be unique within department)</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Position Name <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            maxLength={100}
                                            placeholder="Examples: Teacher, Principal, Software Developer, Accountant"
                                            value={newDesignation.position_name}
                                            onChange={e => setNewDesignation({ ...newDesignation, position_name: e.target.value })}
                                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* SECTION 3: ROLE DESCRIPTION */}
                            <div>
                                <h4 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-3 flex items-center gap-2">
                                    <FileText className="w-4 h-4" /> Section 3: Role Description
                                </h4>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Role Description & Responsibilities
                                    </label>
                                    <textarea
                                        rows={5}
                                        placeholder="Describe key responsibilities, required qualifications, and role expectations..."
                                        value={newDesignation.description}
                                        onChange={e => setNewDesignation({ ...newDesignation, description: e.target.value })}
                                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
                                    />
                                </div>
                            </div>

                            {/* ADVANCED OPTIONS (Collapsible) */}
                            <div>
                                <button
                                    onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
                                    className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    <span className="text-sm font-semibold text-gray-700">Advanced Options</span>
                                    {showAdvancedOptions ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                </button>

                                {showAdvancedOptions && (
                                    <div className="mt-4 space-y-4 p-4 border rounded-lg bg-gray-50">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Job Grade</label>
                                            <select
                                                value={newDesignation.job_grade}
                                                onChange={e => setNewDesignation({ ...newDesignation, job_grade: e.target.value })}
                                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
                                            >
                                                <option value="">Select Grade</option>
                                                <option value="junior">Junior</option>
                                                <option value="mid_level">Mid-Level</option>
                                                <option value="senior">Senior</option>
                                                <option value="lead">Lead</option>
                                                <option value="manager">Manager</option>
                                                <option value="director">Director</option>
                                                <option value="executive">Executive</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Minimum Required Qualifications</label>
                                            <textarea
                                                rows={3}
                                                placeholder="Example: Bachelor's degree in relevant field, 2 years experience..."
                                                value={newDesignation.qualifications}
                                                onChange={e => setNewDesignation({ ...newDesignation, qualifications: e.target.value })}
                                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none bg-white"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Reporting Position</label>
                                            <select
                                                value={newDesignation.reports_to}
                                                onChange={e => setNewDesignation({ ...newDesignation, reports_to: e.target.value })}
                                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
                                            >
                                                <option value="">Select reporting position</option>
                                                {designations
                                                    .filter(d => d.dept_code === newDesignation.dept_code)
                                                    .map((desig, idx) => (
                                                        <option key={idx} value={desig.position_code}>
                                                            {desig.position_name}
                                                        </option>
                                                    ))}
                                            </select>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="p-6 border-t bg-gray-50 rounded-b-xl flex justify-end gap-3">
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setShowAddDesignationModal(false);
                                    setShowAdvancedOptions(false);
                                    setNewDesignation({
                                        dept_code: '',
                                        position_code: '',
                                        position_name: '',
                                        description: '',
                                        job_grade: '',
                                        qualifications: '',
                                        reports_to: ''
                                    });
                                }}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="primary"
                                onClick={handleAddDesignation}
                                disabled={!newDesignation.dept_code || !newDesignation.position_code || !newDesignation.position_name}
                            >
                                Save Designation
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DepartmentDetailPage;
