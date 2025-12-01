'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../../components/ui/card';
import { Button } from '../../../../../components/ui/Button';
import { THEME } from '../../../../../lib/theme';

interface Employee {
  employeeId: string;
  employeeCode: string;
  fullName: string;
  dob: string;
  cnic: string;
  gender: string;
  nationality: string;
  religion: string;
  personalEmail: string;
  mobile: string;
  emergencyPhone: string;
  residentialAddress: string;
  permanentAddress: string;
  city: string;
  state: string;
  department: string;
  designation: string;
  dateOfJoining: string;
  employmentType: string;
  bankName: string;
  accountNumber: string;
  orgEmail: string;
  orgPhone: string;
  education: Array<{ id: string; degree: string; institute: string; passingYear: string }>;
  experience: Array<{ id: string; employer: string; jobTitle: string; startDate: string; endDate: string; responsibilities: string }>;
}

const EmployeeDetailPage: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const employeeId = params.id as string;
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Employee | null>(null);

  const getDefaultEmployees = () => Array.from({ length: 8 }).map((_, i) => ({
    employeeId: `EMP${String(i + 1).padStart(4, '0')}`,
    employeeCode: `ECODE${1000 + i}`,
    fullName: `Employee ${i + 1}`,
    dob: new Date(1990 + (i % 5), i % 12, (i + 1) * 2).toISOString().slice(0, 10),
    cnic: `${String(i + 1).padStart(5, '0')}-1234567-${i + 1}`,
    gender: i % 2 === 0 ? 'male' : 'female',
    nationality: 'Pakistan',
    religion: 'Islam',
    personalEmail: `employee${i + 1}@example.com`,
    mobile: `+92-300-${String(i).padStart(7, '0')}`,
    emergencyPhone: `+92-321-${String(i).padStart(7, '0')}`,
    residentialAddress: `${100 + i} Street, City ${String.fromCharCode(65 + (i % 3))}`,
    permanentAddress: `${100 + i} Avenue, City ${String.fromCharCode(65 + (i % 3))}`,
    city: ['Karachi', 'Lahore', 'Islamabad'][i % 3],
    state: 'Sindh',
    department: ['IT', 'Finance', 'Procurement', 'HR'][i % 4],
    designation: ['Developer', 'Analyst', 'Technician', 'Supervisor'][i % 4],
    dateOfJoining: new Date(2024, i % 12, (i + 1) * 2).toISOString().slice(0, 10),
    employmentType: 'Full-time',
    bankName: 'Bank of Pakistan',
    accountNumber: `${10000 + i}`,
    orgEmail: `emp${i + 1}@company.com`,
    orgPhone: `+92-42-${String(i).padStart(7, '0')}`,
    education: [
      { id: `edu${i}-1`, degree: 'Bachelor of Science', institute: 'University of Karachi', passingYear: '2020' },
      { id: `edu${i}-2`, degree: 'Master of Business Administration', institute: 'IBA', passingYear: '2022' }
    ],
    experience: [
      { id: `exp${i}-1`, employer: 'Previous Company Inc.', jobTitle: 'Senior Developer', startDate: '2021-01-15', endDate: '2023-12-31', responsibilities: 'Led development team, architected microservices' }
    ]
  }));

  useEffect(() => {
    const stored = typeof window !== 'undefined' ? localStorage.getItem('employees') : null;
    let employees = [];
    
    if (stored) {
      try {
        employees = JSON.parse(stored);
      } catch {
        employees = getDefaultEmployees();
      }
    } else {
      employees = getDefaultEmployees();
    }
    
    const found = employees.find((e: Employee) => e.employeeId === employeeId);
    if (found) {
      setEmployee(found);
      setFormData(found);
    }
  }, [employeeId]);

  const handleInputChange = (field: string, value: any) => {
    if (formData) {
      setFormData({ ...formData, [field]: value });
    }
  };

  const handleSaveEdit = () => {
    if (!formData) return;
    const stored = localStorage.getItem('employees');
    if (stored) {
      const employees = JSON.parse(stored);
      const updated = employees.map((e: Employee) => e.employeeId === employeeId ? formData : e);
      localStorage.setItem('employees', JSON.stringify(updated));
      setEmployee(formData);
      setIsEditing(false);
      alert('Employee updated successfully!');
    }
  };

  if (!employee) {
    return (
      <div className="p-4 md:p-6 lg:p-8 min-h-screen" style={{ backgroundColor: THEME.colors.background }}>
        <div className="text-center">
          <p>Loading employee details...</p>
        </div>
      </div>
    );
  }

  const displayData = isEditing ? formData : employee;

  return (
    <div className="p-4 sm:p-6 lg:p-8 min-h-screen" style={{ backgroundColor: THEME.colors.background }}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-3">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <Button variant="outline" type="button" onClick={() => router.back()}>Back</Button>
          <h2 className="text-2xl font-bold">{employee.fullName}</h2>
        </div>
        <div className="flex gap-2 flex-wrap">
          {!isEditing ? (
            <Button type="button" onClick={() => setIsEditing(true)}>Edit</Button>
          ) : (
            <>
              <Button variant="outline" type="button" onClick={() => setIsEditing(false)}>Cancel</Button>
              <Button type="button" onClick={handleSaveEdit}>Save Changes</Button>
            </>
          )}
        </div>
      </div>

      {/* Personal Information */}
      <Card className="bg-white rounded-xl shadow mb-6">
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
        </CardHeader>
        <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-600">Full Name</label>
              {isEditing ? (
                <input value={formData?.fullName} onChange={e => handleInputChange('fullName', e.target.value)} className="w-full px-3 py-2 border rounded mt-1" />
              ) : (
                <p className="mt-1">{displayData?.fullName}</p>
              )}
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Date of Birth</label>
              {isEditing ? (
                <input type="date" value={formData?.dob} onChange={e => handleInputChange('dob', e.target.value)} className="w-full px-3 py-2 border rounded mt-1" />
              ) : (
                <p className="mt-1">{displayData?.dob || '—'}</p>
              )}
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">CNIC</label>
              {isEditing ? (
                <input value={formData?.cnic} onChange={e => handleInputChange('cnic', e.target.value)} className="w-full px-3 py-2 border rounded mt-1" />
              ) : (
                <p className="mt-1">{displayData?.cnic || '—'}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-4">
            <div>
              <label className="text-sm font-medium text-gray-600">Gender</label>
              {isEditing ? (
                <select value={formData?.gender} onChange={e => handleInputChange('gender', e.target.value)} className="w-full px-3 py-2 border rounded mt-1">
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              ) : (
                <p className="mt-1 capitalize">{displayData?.gender || '—'}</p>
              )}
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Nationality</label>
              {isEditing ? (
                <input value={formData?.nationality} onChange={e => handleInputChange('nationality', e.target.value)} className="w-full px-3 py-2 border rounded mt-1" />
              ) : (
                <p className="mt-1">{displayData?.nationality || '—'}</p>
              )}
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Religion</label>
              {isEditing ? (
                <input value={formData?.religion} onChange={e => handleInputChange('religion', e.target.value)} className="w-full px-3 py-2 border rounded mt-1" />
              ) : (
                <p className="mt-1">{displayData?.religion || '—'}</p>
              )}
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
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-600">Personal Email</label>
              {isEditing ? (
                <input type="email" value={formData?.personalEmail} onChange={e => handleInputChange('personalEmail', e.target.value)} className="w-full px-3 py-2 border rounded mt-1" />
              ) : (
                <p className="mt-1">{displayData?.personalEmail}</p>
              )}
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Mobile Number</label>
              {isEditing ? (
                <input value={formData?.mobile} onChange={e => handleInputChange('mobile', e.target.value)} className="w-full px-3 py-2 border rounded mt-1" />
              ) : (
                <p className="mt-1">{displayData?.mobile}</p>
              )}
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Emergency Phone</label>
              {isEditing ? (
                <input value={formData?.emergencyPhone} onChange={e => handleInputChange('emergencyPhone', e.target.value)} className="w-full px-3 py-2 border rounded mt-1" />
              ) : (
                <p className="mt-1">{displayData?.emergencyPhone || '—'}</p>
              )}
            </div>
          </div>

          <div className="mt-4">
            <label className="text-sm font-medium text-gray-600">Residential Address</label>
            {isEditing ? (
              <input value={formData?.residentialAddress} onChange={e => handleInputChange('residentialAddress', e.target.value)} className="w-full px-3 py-2 border rounded mt-1" />
            ) : (
              <p className="mt-1">{displayData?.residentialAddress}</p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-4">
            <div>
              <label className="text-sm font-medium text-gray-600">Permanent Address</label>
              {isEditing ? (
                <input value={formData?.permanentAddress} onChange={e => handleInputChange('permanentAddress', e.target.value)} className="w-full px-3 py-2 border rounded mt-1" />
              ) : (
                <p className="mt-1">{displayData?.permanentAddress || '—'}</p>
              )}
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">City</label>
              {isEditing ? (
                <input value={formData?.city} onChange={e => handleInputChange('city', e.target.value)} className="w-full px-3 py-2 border rounded mt-1" />
              ) : (
                <p className="mt-1">{displayData?.city || '—'}</p>
              )}
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">State</label>
              {isEditing ? (
                <input value={formData?.state} onChange={e => handleInputChange('state', e.target.value)} className="w-full px-3 py-2 border rounded mt-1" />
              ) : (
                <p className="mt-1">{displayData?.state || '—'}</p>
              )}
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
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-600">Employee ID</label>
              <p className="mt-1 font-medium">{displayData?.employeeId}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Employee Code</label>
              <p className="mt-1">{displayData?.employeeCode}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Department</label>
              {isEditing ? (
                <input value={formData?.department} onChange={e => handleInputChange('department', e.target.value)} className="w-full px-3 py-2 border rounded mt-1" />
              ) : (
                <p className="mt-1">{displayData?.department || '—'}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <div>
              <label className="text-sm font-medium text-gray-600">Designation</label>
              {isEditing ? (
                <input value={formData?.designation} onChange={e => handleInputChange('designation', e.target.value)} className="w-full px-3 py-2 border rounded mt-1" />
              ) : (
                <p className="mt-1">{displayData?.designation || '—'}</p>
              )}
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Date of Joining</label>
              {isEditing ? (
                <input type="date" value={formData?.dateOfJoining} onChange={e => handleInputChange('dateOfJoining', e.target.value)} className="w-full px-3 py-2 border rounded mt-1" />
              ) : (
                <p className="mt-1">{displayData?.dateOfJoining}</p>
              )}
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Employment Type</label>
              {isEditing ? (
                <select value={formData?.employmentType} onChange={e => handleInputChange('employmentType', e.target.value)} className="w-full px-3 py-2 border rounded mt-1">
                  <option>Full-time</option>
                  <option>Part-time</option>
                  <option>Contract</option>
                  <option>Intern</option>
                </select>
              ) : (
                <p className="mt-1">{displayData?.employmentType || '—'}</p>
              )}
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-600">Bank Name</label>
              {isEditing ? (
                <input value={formData?.bankName} onChange={e => handleInputChange('bankName', e.target.value)} className="w-full px-3 py-2 border rounded mt-1" />
              ) : (
                <p className="mt-1">{displayData?.bankName}</p>
              )}
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Account Number</label>
              {isEditing ? (
                <input value={formData?.accountNumber} onChange={e => handleInputChange('accountNumber', e.target.value)} className="w-full px-3 py-2 border rounded mt-1" />
              ) : (
                <p className="mt-1">{displayData?.accountNumber}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Organization Provided */}
      <Card className="bg-white rounded-xl shadow mb-6">
        <CardHeader>
          <CardTitle>Provided By Organization</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-600">Organization Email</label>
              {isEditing ? (
                <input type="email" value={formData?.orgEmail} onChange={e => handleInputChange('orgEmail', e.target.value)} className="w-full px-3 py-2 border rounded mt-1" />
              ) : (
                <p className="mt-1">{displayData?.orgEmail || '—'}</p>
              )}
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Organization Phone</label>
              {isEditing ? (
                <input value={formData?.orgPhone} onChange={e => handleInputChange('orgPhone', e.target.value)} className="w-full px-3 py-2 border rounded mt-1" />
              ) : (
                <p className="mt-1">{displayData?.orgPhone || '—'}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Education */}
      {displayData?.education && displayData.education.length > 0 && (
        <Card className="bg-white rounded-xl shadow mb-6">
          <CardHeader>
            <CardTitle>Educational History</CardTitle>
          </CardHeader>
          <CardContent>
            {displayData.education.map((edu, idx) => (
              <div key={edu.id} className="border p-4 rounded mb-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
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
      {displayData?.experience && displayData.experience.length > 0 && (
        <Card className="bg-white rounded-xl shadow mb-6">
          <CardHeader>
            <CardTitle>Work Experience</CardTitle>
          </CardHeader>
          <CardContent>
            {displayData.experience.map((exp, idx) => (
              <div key={exp.id} className="border p-4 rounded mb-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Employer</label>
                    <p className="mt-1">{exp.employer || '—'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Job Title</label>
                    <p className="mt-1">{exp.jobTitle || '—'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Start Date</label>
                    <p className="mt-1">{exp.startDate || '—'}</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 mt-3">
                  <div>
                    <label className="text-sm font-medium text-gray-600">End Date</label>
                    <p className="mt-1">{exp.endDate || '—'}</p>
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-sm font-medium text-gray-600">Key Responsibilities</label>
                    <p className="mt-1">{exp.responsibilities || '—'}</p>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default EmployeeDetailPage;
