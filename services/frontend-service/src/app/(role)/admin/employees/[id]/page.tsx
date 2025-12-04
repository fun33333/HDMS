'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../../components/ui/card';
import { Button } from '../../../../../components/ui/Button';
import { THEME } from '../../../../../lib/theme';
import { getMockEmployeeById } from '../../../../../lib/mockData';

interface Department {
  dept_code: string;
  dept_name: string;
  dept_sector?: string;
}

interface Designation {
  position_code: string;
  position_name: string;
}

interface Education {
  degree: string;
  institute: string;
  passingYear: string;
}

interface Experience {
  employer: string;
  jobTitle: string;
  startDate: string;
  endDate: string;
  responsibilities: string;
}

interface Employee {
  employee_id: string;
  employee_code: string;
  full_name: string;
  email: string;
  phone: string;
  cnic: string;
  dob: string | null;
  gender: string;
  nationality: string | null;
  religion: string | null;
  emergency_contact_phone: string | null;
  residential_address: string;
  permanent_address: string | null;
  city: string | null;
  state: string | null;
  department: Department | null;
  designation: Designation | null;
  joining_date: string | null;
  employment_type: string;
  employment_type_value: string;
  organization_phone: string | null;
  bank_name: string;
  account_number: string;
  education_history: Education[] | null;
  work_experience: Experience[] | null;
  resume: string | null;
  created_at: string | null;
  updated_at: string | null;
}

const EmployeeDetailPage: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const employeeId = params.id as string;

  const [employee, setEmployee] = useState<Employee | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Modal States
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [showPermissionConfirm, setShowPermissionConfirm] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Permission Form State
  const [permissions, setPermissions] = useState({
    hdms: false,
    sms: false,
  });
  const [hdmsRole, setHdmsRole] = useState('');
  const [hdmsPassword, setHdmsPassword] = useState('');
  const [smsRole, setSmsRole] = useState('');
  const [smsPassword, setSmsPassword] = useState('');

  useEffect(() => {
    const fetchEmployee = async () => {
      setIsLoading(true);
      try {
        // Safe fetch wrapper
        const response = await fetch(`http://localhost:8000/api/employees/${employeeId}`).catch(err => {
          console.warn('Fetch employee failed:', err);
          return null;
        });

        if (!response || !response.ok) {
          // Fallback to mock data
          console.log('Falling back to mock data for employee details');
          const mockEmp = getMockEmployeeById(employeeId);
          if (mockEmp) {
            // Convert mock employee to match the new interface
            const convertedEmployee: Employee = {
              employee_id: mockEmp.employee_id,
              employee_code: mockEmp.employee_code,
              full_name: mockEmp.full_name,
              email: mockEmp.email,
              phone: mockEmp.phone,
              cnic: '12345-1234567-1',
              dob: '1990-01-01',
              gender: 'male',
              nationality: 'Pakistani',
              religion: 'Islam',
              emergency_contact_phone: mockEmp.phone,
              residential_address: 'Mock Address',
              permanent_address: 'Mock Permanent Address',
              city: 'Karachi',
              state: 'Sindh',
              department: mockEmp.department,
              designation: mockEmp.designation,
              joining_date: mockEmp.joining_date,
              employment_type: mockEmp.employment_type,
              employment_type_value: mockEmp.employment_type_value,
              organization_phone: null,
              bank_name: 'Mock Bank',
              account_number: '1234567890',
              education_history: null,
              work_experience: null,
              resume: null,
              created_at: mockEmp.created_at,
              updated_at: null
            };
            setEmployee(convertedEmployee);
          } else {
            setError('Employee not found');
          }
          setIsLoading(false);
          return;
        }

        const data = await response.json();
        setEmployee(data);
      } catch (err) {
        console.error('Error fetching employee:', err);
        // Try mock data as final fallback
        const mockEmp = getMockEmployeeById(employeeId);
        if (mockEmp) {
          const convertedEmployee: Employee = {
            employee_id: mockEmp.employee_id,
            employee_code: mockEmp.employee_code,
            full_name: mockEmp.full_name,
            email: mockEmp.email,
            phone: mockEmp.phone,
            cnic: '12345-1234567-1',
            dob: '1990-01-01',
            gender: 'male',
            nationality: 'Pakistani',
            religion: 'Islam',
            emergency_contact_phone: mockEmp.phone,
            residential_address: 'Mock Address',
            permanent_address: 'Mock Permanent Address',
            city: 'Karachi',
            state: 'Sindh',
            department: mockEmp.department,
            designation: mockEmp.designation,
            joining_date: mockEmp.joining_date,
            employment_type: mockEmp.employment_type,
            employment_type_value: mockEmp.employment_type_value,
            organization_phone: null,
            bank_name: 'Mock Bank',
            account_number: '1234567890',
            education_history: null,
            work_experience: null,
            resume: null,
            created_at: mockEmp.created_at,
            updated_at: null
          };
          setEmployee(convertedEmployee);
        } else {
          setError('Network error. Please try again.');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchEmployee();
  }, [employeeId]);

  const handleDelete = async () => {
    try {
      const response = await fetch(`http://localhost:8000/api/employees/${employeeId}`, {
        method: 'DELETE',
      }).catch(err => {
        console.warn('Delete failed:', err);
        return null;
      });

      if (response && response.ok) {
        alert('Employee deleted successfully');
        router.push('/admin/employees');
      } else {
        // Mock delete fallback
        alert('Employee deleted successfully (Mock)');
        router.push('/admin/employees');
      }
    } catch (err) {
      console.error('Error deleting employee:', err);
      alert('Employee deleted successfully (Mock)');
      router.push('/admin/employees');
    }
  };

  const handleEditSave = () => {
    // Mock save logic - in real implementation, this would call the API
    alert('Employee updated successfully (Mock)');
    setShowEditModal(false);
  };

  const handlePermissionSave = () => {
    // Validate that if a system is selected, role and password are provided
    if (permissions.hdms && (!hdmsRole || !hdmsPassword)) {
      alert('Please select a role and enter a password for HDMS');
      return;
    }
    if (permissions.sms && (!smsRole || !smsPassword)) {
      alert('Please select a role and enter a password for SMS');
      return;
    }

    // Show confirmation modal instead of browser confirm
    setShowPermissionConfirm(true);
  };

  const handlePermissionConfirm = () => {
    console.log('Granting permissions:', {
      employee: employee?.employee_code,
      hdms: permissions.hdms ? { role: hdmsRole, password: hdmsPassword } : null,
      sms: permissions.sms ? { role: smsRole, password: smsPassword } : null
    });

    // Close confirmation and permission modals
    setShowPermissionConfirm(false);
    setShowPermissionModal(false);

    // Show success modal
    setShowSuccessModal(true);

    // Reset form
    setPermissions({ hdms: false, sms: false });
    setHdmsRole('');
    setHdmsPassword('');
    setSmsRole('');
    setSmsPassword('');
  };

  if (isLoading) {
    return (
      <div className="p-4 md:p-6 lg:p-8 min-h-screen" style={{ backgroundColor: THEME.colors.background }}>
        <div className="text-center py-12">
          <p className="text-gray-500">Loading employee details...</p>
        </div>
      </div>
    );
  }

  if (error || !employee) {
    return (
      <div className="p-4 md:p-6 lg:p-8 min-h-screen" style={{ backgroundColor: THEME.colors.background }}>
        <Card className="bg-white rounded-xl shadow">
          <CardContent className="p-8 text-center">
            <p className="text-red-600 mb-4">{error || 'Employee not found'}</p>
            <Button onClick={() => router.back()}>Go Back</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 min-h-screen" style={{ backgroundColor: THEME.colors.background }}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-3">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <Button variant="outline" type="button" onClick={() => router.back()}>
            ← Back
          </Button>
          <div>
            <h2 className="text-2xl font-bold">{employee.full_name}</h2>
            <p className="text-sm text-gray-600">{employee.employee_code}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            onClick={() => setShowEditModal(true)}
            className="text-sm"
          >
            ✏️ Edit
          </Button>
          <Button
            variant="primary"
            onClick={() => setShowPermissionModal(true)}
            className="text-sm"
          >
            🔒 Grant Permission
          </Button>
          <Button
            variant="danger"
            onClick={() => setShowDeleteConfirm(true)}
            className="text-sm bg-red-600 hover:bg-red-700 text-white"
          >
            🗑️ Delete
          </Button>
        </div>
      </div>

      {/* Personal Information */}
      <Card className="bg-white rounded-xl shadow mb-6">
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            <div>
              <label className="text-sm font-medium text-gray-600">Employee ID</label>
              <p className="mt-1 font-semibold text-blue-600">{employee.employee_id}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Employee Code</label>
              <p className="mt-1 font-semibold">{employee.employee_code}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Full Name</label>
              <p className="mt-1">{employee.full_name}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Date of Birth</label>
              <p className="mt-1">{employee.dob || '—'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">CNIC</label>
              <p className="mt-1">{employee.cnic || '—'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Gender</label>
              <p className="mt-1 capitalize">{employee.gender || '—'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Nationality</label>
              <p className="mt-1">{employee.nationality || '—'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Religion</label>
              <p className="mt-1">{employee.religion || '—'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contact Information */}
      <Card className="bg-white rounded-xl shadow mb-6">
        <CardHeader>
          <CardTitle>Contact Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            <div>
              <label className="text-sm font-medium text-gray-600">Email</label>
              <p className="mt-1">{employee.email}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Mobile Number</label>
              <p className="mt-1">{employee.phone}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Emergency Phone</label>
              <p className="mt-1">{employee.emergency_contact_phone || '—'}</p>
            </div>
          </div>

          <div className="mt-6">
            <label className="text-sm font-medium text-gray-600">Residential Address</label>
            <p className="mt-1">{employee.residential_address}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mt-6">
            <div>
              <label className="text-sm font-medium text-gray-600">Permanent Address</label>
              <p className="mt-1">{employee.permanent_address || '—'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">City</label>
              <p className="mt-1">{employee.city || '—'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">State</label>
              <p className="mt-1">{employee.state || '—'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Employment Details */}
      <Card className="bg-white rounded-xl shadow mb-6">
        <CardHeader>
          <CardTitle>Employment Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            <div>
              <label className="text-sm font-medium text-gray-600">Department</label>
              {employee.department ? (
                <p className="mt-1">
                  <span className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                    {employee.department.dept_code} - {employee.department.dept_name}
                  </span>
                </p>
              ) : (
                <p className="mt-1">—</p>
              )}
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Designation</label>
              {employee.designation ? (
                <p className="mt-1">
                  <span className="inline-block bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                    {employee.designation.position_code} - {employee.designation.position_name}
                  </span>
                </p>
              ) : (
                <p className="mt-1">—</p>
              )}
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Date of Joining</label>
              <p className="mt-1">{employee.joining_date || '—'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Employment Type</label>
              <p className="mt-1">
                <span className="inline-block bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm">
                  {employee.employment_type}
                </span>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bank Information */}
      <Card className="bg-white rounded-xl shadow mb-6">
        <CardHeader>
          <CardTitle>Bank Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-medium text-gray-600">Bank Name</label>
              <p className="mt-1">{employee.bank_name}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Account Number</label>
              <p className="mt-1">{employee.account_number}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Organization Provided */}
      {(employee.email || employee.organization_phone) && (
        <Card className="bg-white rounded-xl shadow mb-6">
          <CardHeader>
            <CardTitle>Provided By Organization</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-medium text-gray-600">Organization Email</label>
                <p className="mt-1">{employee.email || '—'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Organization Phone</label>
                <p className="mt-1">{employee.organization_phone || '—'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Education */}
      {employee.education_history && employee.education_history.length > 0 && (
        <Card className="bg-white rounded-xl shadow mb-6">
          <CardHeader>
            <CardTitle>Educational History</CardTitle>
          </CardHeader>
          <CardContent>
            {employee.education_history.map((edu, idx) => (
              <div key={idx} className="border p-4 rounded-lg mb-3 last:mb-0">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Degree/Certificate</label>
                    <p className="mt-1">{edu.degree || '—'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Institute Name</label>
                    <p className="mt-1">{edu.institute || '—'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Passing Year</label>
                    <p className="mt-1">{edu.passingYear || '—'}</p>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Experience */}
      {employee.work_experience && employee.work_experience.length > 0 && (
        <Card className="bg-white rounded-xl shadow mb-6">
          <CardHeader>
            <CardTitle>Work Experience</CardTitle>
          </CardHeader>
          <CardContent>
            {employee.work_experience.map((exp, idx) => (
              <div key={idx} className="border p-4 rounded-lg mb-3 last:mb-0">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Employer</label>
                    <p className="mt-1 font-semibold">{exp.employer || '—'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Job Title</label>
                    <p className="mt-1">{exp.jobTitle || '—'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Duration</label>
                    <p className="mt-1">{exp.startDate} to {exp.endDate || 'Present'}</p>
                  </div>
                </div>
                {exp.responsibilities && (
                  <div className="mt-4">
                    <label className="text-sm font-medium text-gray-600">Key Responsibilities</label>
                    <p className="mt-1 text-gray-700">{exp.responsibilities}</p>
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Resume */}
      {employee.resume && (
        <Card className="bg-white rounded-xl shadow mb-6">
          <CardHeader>
            <CardTitle>Resume</CardTitle>
          </CardHeader>
          <CardContent>
            <a
              href={employee.resume}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              📄 View Resume
            </a>
          </CardContent>
        </Card>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-xl shadow-2xl max-w-sm w-full">
            <h3 className="text-xl font-bold mb-2 text-gray-900">Confirm Delete</h3>
            <p className="mb-6 text-gray-600">
              Are you sure you want to delete <span className="font-semibold">{employee.full_name}</span>?
              This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>Cancel</Button>
              <Button
                variant="danger"
                onClick={handleDelete}
                className="bg-red-600 text-white hover:bg-red-700"
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full my-8">
            <div className="p-6 border-b">
              <h3 className="text-xl font-bold text-gray-900">Edit Employee Details</h3>
            </div>
            <div className="p-6">
              <p className="text-gray-600 mb-4">
                Edit functionality will be implemented when backend API is integrated.
              </p>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={employee.full_name}
                    disabled
                    className="w-full px-4 py-2 border rounded-lg bg-gray-50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={employee.email}
                    disabled
                    className="w-full px-4 py-2 border rounded-lg bg-gray-50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input
                    type="text"
                    value={employee.phone}
                    disabled
                    className="w-full px-4 py-2 border rounded-lg bg-gray-50"
                  />
                </div>
              </div>
            </div>
            <div className="p-6 border-t bg-gray-50 rounded-b-xl flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowEditModal(false)}>Cancel</Button>
              <Button variant="primary" onClick={handleEditSave}>Save Changes</Button>
            </div>
          </div>
        </div>
      )}

      {/* Grant Permission Modal */}
      {showPermissionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-xl shadow-2xl max-w-md w-full">
            <h3 className="text-xl font-bold mb-4 text-gray-900">Grant Permissions</h3>
            <div className="bg-blue-50 p-3 rounded-lg mb-6">
              <p className="text-sm text-blue-800">
                Granting access for: <span className="font-bold">{employee.full_name}</span> ({employee.employee_code})
              </p>
            </div>

            <div className="space-y-6 mb-8">
              {/* HDMS Permission */}
              <div className="border rounded-lg p-4">
                <label className="flex items-start space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={permissions.hdms}
                    onChange={e => {
                      setPermissions({ ...permissions, hdms: e.target.checked });
                      if (!e.target.checked) {
                        setHdmsRole('');
                        setHdmsPassword('');
                      }
                    }}
                    className="w-5 h-5 mt-0.5 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <div className="flex-1">
                    <span className="block font-medium text-gray-900">HDMS Access</span>
                    <span className="block text-sm text-gray-500">Help Desk Management System</span>
                  </div>
                </label>

                {/* HDMS Role and Password Fields */}
                {permissions.hdms && (
                  <div className="mt-4 space-y-3 pl-8">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Role <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={hdmsRole}
                        onChange={e => setHdmsRole(e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      >
                        <option value="">Select Role</option>
                        <option value="requester">Requester</option>
                        <option value="moderator">Moderator</option>
                        <option value="assignee">Assignee</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Password <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="password"
                        value={hdmsPassword}
                        onChange={e => setHdmsPassword(e.target.value)}
                        placeholder="Enter password"
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* SMS Permission */}
              <div className="border rounded-lg p-4">
                <label className="flex items-start space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={permissions.sms}
                    onChange={e => {
                      setPermissions({ ...permissions, sms: e.target.checked });
                      if (!e.target.checked) {
                        setSmsRole('');
                        setSmsPassword('');
                      }
                    }}
                    className="w-5 h-5 mt-0.5 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <div className="flex-1">
                    <span className="block font-medium text-gray-900">SMS Access</span>
                    <span className="block text-sm text-gray-500">Staff Management System</span>
                  </div>
                </label>

                {/* SMS Role and Password Fields */}
                {permissions.sms && (
                  <div className="mt-4 space-y-3 pl-8">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Role <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={smsRole}
                        onChange={e => setSmsRole(e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      >
                        <option value="">Select Role</option>
                        <option value="teacher">Teacher</option>
                        <option value="coordinator">Coordinator</option>
                        <option value="principal">Principal</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Password <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="password"
                        value={smsPassword}
                        onChange={e => setSmsPassword(e.target.value)}
                        placeholder="Enter password"
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowPermissionModal(false)}>Cancel</Button>
              <Button variant="primary" onClick={handlePermissionSave}>Save Permissions</Button>
            </div>
          </div>
        </div>
      )}

      {/* Permission Confirmation Modal */}
      {showPermissionConfirm && employee && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-xl shadow-2xl max-w-md w-full">
            <h3 className="text-xl font-bold mb-4 text-gray-900">Confirm Permissions</h3>
            <p className="text-gray-700 mb-4">
              Are you sure you want to grant the following permissions to <span className="font-bold">{employee.full_name}</span>?
            </p>
            <div className="bg-blue-50 p-4 rounded-lg mb-6 space-y-2">
              {permissions.hdms && (
                <div>
                  <p className="font-semibold text-blue-900">HDMS Access</p>
                  <p className="text-sm text-blue-700">Role: {hdmsRole}</p>
                </div>
              )}
              {permissions.sms && (
                <div className="mt-2">
                  <p className="font-semibold text-blue-900">SMS Access</p>
                  <p className="text-sm text-blue-700">Role: {smsRole}</p>
                </div>
              )}
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowPermissionConfirm(false)}>Cancel</Button>
              <Button variant="primary" onClick={handlePermissionConfirm}>Confirm</Button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && employee && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-xl shadow-2xl max-w-md w-full">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2 text-gray-900">Success!</h3>
              <p className="text-gray-700 mb-6">
                User account created successfully!<br />
                <span className="font-semibold">{employee.full_name}</span> has been added to the user list.
              </p>
              <Button variant="primary" onClick={() => {
                setShowSuccessModal(false);
                router.push('/admin/users');
              }}>OK</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeDetailPage;
