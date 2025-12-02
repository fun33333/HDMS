'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/Button';
import { useRouter } from 'next/navigation';

type Education = { id: string; degree: string; institute: string; passingYear: string };
type Experience = { id: string; employer: string; jobTitle: string; startDate: string; endDate: string; responsibilities: string };

const newEducation = (): Education => ({ id: String(Date.now()) + Math.random(), degree: '', institute: '', passingYear: '' });
const newExperience = (): Experience => ({ id: String(Date.now()) + Math.random(), employer: '', jobTitle: '', startDate: '', endDate: '', responsibilities: '' });

const EmployeeForm: React.FC = () => {
  const router = useRouter();

  // Auto-generated IDs
  const [employeeId] = useState(() => `EMP-${Date.now().toString().slice(-6)}`);
  const [employeeCode] = useState(() => `ECODE${Math.floor(Math.random() * 9000) + 1000}`);

  // Personal
  const [fullName, setFullName] = useState('');
  const [dob, setDob] = useState('');
  const [cnic, setCnic] = useState('');
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [nationality, setNationality] = useState('');
  const [religion, setReligion] = useState('');

  // Contact
  const [personalEmail, setPersonalEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [emergencyPhone, setEmergencyPhone] = useState('');
  const [residentialAddress, setResidentialAddress] = useState('');
  const [permanentAddress, setPermanentAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');

  // Employment
  const [department, setDepartment] = useState('');
  const [designation, setDesignation] = useState('');
  const [dateOfJoining, setDateOfJoining] = useState('');
  const [employmentType, setEmploymentType] = useState('Full-time');

  // Bank
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');

  // Provided by org
  const [orgEmail, setOrgEmail] = useState('');
  const [orgPhone, setOrgPhone] = useState('');

  // Education & Experience
  const [education, setEducation] = useState<Education[]>([newEducation()]);
  const [experience, setExperience] = useState<Experience[]>([newExperience()]);

  // Resume
  const [resumeFile, setResumeFile] = useState<File | null>(null);

  const addEducation = () => setEducation(prev => [...prev, newEducation()]);
  const removeEducation = (id: string) => setEducation(prev => prev.filter(e => e.id !== id));

  const addExperience = () => setExperience(prev => [...prev, newExperience()]);
  const removeExperience = (id: string) => setExperience(prev => prev.filter(e => e.id !== id));

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setResumeFile(file);
  };

  const validate = () => {
    if (!fullName.trim()) return 'Full name is required';
    if (!personalEmail.trim()) return 'Personal email is required';
    if (!mobile.trim()) return 'Mobile number is required';
    if (!residentialAddress.trim()) return 'Residential address is required';
    if (!bankName.trim() || !accountNumber.trim()) return 'Bank information is required';
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const err = validate();
    if (err) {
      alert(err);
      return;
    }

    // Build payload
    const payload: any = {
      employeeId,
      employeeCode,
      fullName,
      dob,
      cnic,
      gender,
      nationality,
      religion,
      personalEmail,
      mobile,
      emergencyPhone,
      residentialAddress,
      permanentAddress,
      city,
      state,
      department,
      designation,
      dateOfJoining: dateOfJoining || new Date().toISOString().slice(0, 10),
      employmentType,
      bankName,
      accountNumber,
      orgEmail,
      orgPhone,
      education,
      experience,
    };

    try {
      // Save to localStorage for demo
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem('employees');
        const existing = stored ? JSON.parse(stored) : [];
        const updated = [...existing, payload];
        localStorage.setItem('employees', JSON.stringify(updated));
      }

      if (resumeFile) {
        const form = new FormData();
        form.append('payload', new Blob([JSON.stringify(payload)], { type: 'application/json' }));
        form.append('resume', resumeFile);
        // Demo: POST to placeholder route
        try {
          await fetch('/api/admin/employees', { method: 'POST', body: form });
        } catch {
          // Ignore errors for demo API
        }
      }
      
      alert('Employee created successfully!');
      router.push(`/${'admin'}/employees`);
    } catch (error) {
      console.error(error);
      alert('Failed to save employee');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Button variant="outline" type="button" onClick={() => router.back()}>Back</Button>
          <h2 className="text-xl font-bold">Create Employee</h2>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="bg-white rounded-xl shadow">
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Full Name *</label>
                <input value={fullName} onChange={e => setFullName(e.target.value)} className="w-full px-3 py-2 border rounded" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Date of Birth</label>
                <input type="date" value={dob} onChange={e => setDob(e.target.value)} className="w-full px-3 py-2 border rounded" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">CNIC</label>
                <input value={cnic} onChange={e => setCnic(e.target.value)} className="w-full px-3 py-2 border rounded" placeholder="12345-1234567-1" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium mb-1">Gender</label>
                <select value={gender} onChange={e => setGender(e.target.value as any)} className="w-full px-3 py-2 border rounded">
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Nationality</label>
                <input value={nationality} onChange={e => setNationality(e.target.value)} className="w-full px-3 py-2 border rounded" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Religion</label>
                <input value={religion} onChange={e => setReligion(e.target.value)} className="w-full px-3 py-2 border rounded" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white rounded-xl shadow">
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Personal Email *</label>
                <input type="email" value={personalEmail} onChange={e => setPersonalEmail(e.target.value)} className="w-full px-3 py-2 border rounded" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Mobile Number *</label>
                <input value={mobile} onChange={e => setMobile(e.target.value)} placeholder="+92-3XX-XXXXXXX" className="w-full px-3 py-2 border rounded" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Emergency Phone</label>
                <input value={emergencyPhone} onChange={e => setEmergencyPhone(e.target.value)} className="w-full px-3 py-2 border rounded" />
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium mb-1">Residential Address *</label>
              <input value={residentialAddress} onChange={e => setResidentialAddress(e.target.value)} className="w-full px-3 py-2 border rounded" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium mb-1">Permanent Address</label>
                <input value={permanentAddress} onChange={e => setPermanentAddress(e.target.value)} className="w-full px-3 py-2 border rounded" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">City</label>
                <input value={city} onChange={e => setCity(e.target.value)} className="w-full px-3 py-2 border rounded" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">State</label>
                <input value={state} onChange={e => setState(e.target.value)} className="w-full px-3 py-2 border rounded" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white rounded-xl shadow">
          <CardHeader>
            <CardTitle>Employment Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Department</label>
                <input value={department} onChange={e => setDepartment(e.target.value)} className="w-full px-3 py-2 border rounded" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Designation</label>
                <input value={designation} onChange={e => setDesignation(e.target.value)} className="w-full px-3 py-2 border rounded" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Employee ID (auto)</label>
                <input value={employeeId} readOnly className="w-full px-3 py-2 border rounded bg-gray-50" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium mb-1">Employee Code (auto)</label>
                <input value={employeeCode} readOnly className="w-full px-3 py-2 border rounded bg-gray-50" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Date of Joining</label>
                <input type="date" value={dateOfJoining} onChange={e => setDateOfJoining(e.target.value)} className="w-full px-3 py-2 border rounded" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Employment Type</label>
                <select value={employmentType} onChange={e => setEmploymentType(e.target.value)} className="w-full px-3 py-2 border rounded">
                  <option>Full-time</option>
                  <option>Part-time</option>
                  <option>Contract</option>
                  <option>Intern</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white rounded-xl shadow">
          <CardHeader>
            <CardTitle>Bank Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Bank Name *</label>
                <input value={bankName} onChange={e => setBankName(e.target.value)} className="w-full px-3 py-2 border rounded" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Account Number *</label>
                <input value={accountNumber} onChange={e => setAccountNumber(e.target.value)} className="w-full px-3 py-2 border rounded" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white rounded-xl shadow">
          <CardHeader>
            <CardTitle>Provided By Organization</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input value={orgEmail} onChange={e => setOrgEmail(e.target.value)} className="w-full px-3 py-2 border rounded" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Phone Number</label>
                <input value={orgPhone} onChange={e => setOrgPhone(e.target.value)} className="w-full px-3 py-2 border rounded" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white rounded-xl shadow">
          <CardHeader>
            <CardTitle>Educational History</CardTitle>
          </CardHeader>
          <CardContent>
            {education.map((edu, idx) => (
              <div key={edu.id} className="border p-4 rounded mb-3">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-sm mb-1">Degree/Certificate</label>
                    <input value={edu.degree} onChange={e => setEducation(prev => prev.map(p => p.id === edu.id ? { ...p, degree: e.target.value } : p))} className="w-full px-3 py-2 border rounded" />
                  </div>
                  <div>
                    <label className="block text-sm mb-1">Institute Name</label>
                    <input value={edu.institute} onChange={e => setEducation(prev => prev.map(p => p.id === edu.id ? { ...p, institute: e.target.value } : p))} className="w-full px-3 py-2 border rounded" />
                  </div>
                  <div>
                    <label className="block text-sm mb-1">Passing Year</label>
                    <input value={edu.passingYear} onChange={e => setEducation(prev => prev.map(p => p.id === edu.id ? { ...p, passingYear: e.target.value } : p))} className="w-full px-3 py-2 border rounded" />
                  </div>
                </div>
                <div className="flex gap-2 mt-3">
                  {education.length > 1 && <Button variant="outline" type="button" onClick={() => removeEducation(edu.id)}>Remove</Button>}
                  {idx === education.length - 1 && <Button type="button" onClick={addEducation}>Add Education</Button>}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="bg-white rounded-xl shadow">
          <CardHeader>
            <CardTitle>Work Experience</CardTitle>
          </CardHeader>
          <CardContent>
            {experience.map((exp, idx) => (
              <div key={exp.id} className="border p-4 rounded mb-3">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-sm mb-1">Employer</label>
                    <input value={exp.employer} onChange={e => setExperience(prev => prev.map(p => p.id === exp.id ? { ...p, employer: e.target.value } : p))} className="w-full px-3 py-2 border rounded" />
                  </div>
                  <div>
                    <label className="block text-sm mb-1">Job Title</label>
                    <input value={exp.jobTitle} onChange={e => setExperience(prev => prev.map(p => p.id === exp.id ? { ...p, jobTitle: e.target.value } : p))} className="w-full px-3 py-2 border rounded" />
                  </div>
                  <div>
                    <label className="block text-sm mb-1">Start Date</label>
                    <input type="date" value={exp.startDate} onChange={e => setExperience(prev => prev.map(p => p.id === exp.id ? { ...p, startDate: e.target.value } : p))} className="w-full px-3 py-2 border rounded" />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3">
                  <div>
                    <label className="block text-sm mb-1">End Date</label>
                    <input type="date" value={exp.endDate} onChange={e => setExperience(prev => prev.map(p => p.id === exp.id ? { ...p, endDate: e.target.value } : p))} className="w-full px-3 py-2 border rounded" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm mb-1">Key Responsibilities</label>
                    <textarea value={exp.responsibilities} onChange={e => setExperience(prev => prev.map(p => p.id === exp.id ? { ...p, responsibilities: e.target.value } : p))} className="w-full px-3 py-2 border rounded" rows={3} />
                  </div>
                </div>
                <div className="flex gap-2 mt-3">
                  {experience.length > 1 && <Button variant="outline" type="button" onClick={() => removeExperience(exp.id)}>Remove</Button>}
                  {idx === experience.length - 1 && <Button type="button" onClick={addExperience}>Add Experience</Button>}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="bg-white rounded-xl shadow">
          <CardHeader>
            <CardTitle>Resume</CardTitle>
          </CardHeader>
          <CardContent>
            <input type="file" accept=".pdf,.doc,.docx" onChange={handleFileChange} />
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Button variant="outline" type="button" onClick={() => router.push(`/${'admin'}/employees`)}>Cancel</Button>
          <Button type="submit">Create Employee</Button>
        </div>
      </form>
    </div>
  );
};

export default EmployeeForm;
