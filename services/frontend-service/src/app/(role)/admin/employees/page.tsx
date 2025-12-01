'use client';

import React, { useMemo, useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/card';
import { Button } from '../../../../components/ui/Button';
import { THEME } from '../../../../lib/theme';

interface Employee {
	employeeId: string;
	employeeCode: string;
	fullName: string;
	personalEmail: string;
	mobile: string;
	department: string;
	designation: string;
	dateOfJoining: string;
}

const EmployeesListPage: React.FC = () => {
	const [employees, setEmployees] = useState<Employee[]>([]);

	// Initialize with demo employees from localStorage or defaults
	useEffect(() => {
		const stored = typeof window !== 'undefined' ? localStorage.getItem('employees') : null;
		if (stored) {
			try {
				setEmployees(JSON.parse(stored));
			} catch {
				setEmployees(getDefaultEmployees());
			}
		} else {
			setEmployees(getDefaultEmployees());
		}
	}, []);

	const getDefaultEmployees = () => Array.from({ length: 8 }).map((_, i) => ({
		employeeId: `EMP${String(i + 1).padStart(4, '0')}`,
		employeeCode: `ECODE${1000 + i}`,
		fullName: `Employee ${i + 1}`,
		personalEmail: `employee${i + 1}@example.com`,
		mobile: `+92-300-${String(i).padStart(7, '0')}`,
		department: ['IT', 'Finance', 'Procurement', 'HR'][i % 4],
		designation: ['Developer', 'Analyst', 'Technician', 'Supervisor'][i % 4],
		dateOfJoining: new Date(2024, i % 12, (i + 1) * 2).toISOString().slice(0, 10)
	}));

	return (
		<div className="p-4 md:p-6 lg:p-8 min-h-screen" style={{ backgroundColor: THEME.colors.background }}>
			<Card className="bg-white rounded-2xl shadow-xl border-0">
				<CardHeader className="p-4 md:p-6 lg:p-8 flex items-center justify-between">
					<div>
						<CardTitle className="text-2xl font-bold" style={{ color: THEME.colors.primary }}>
							Employees
						</CardTitle>
						<p className="text-sm" style={{ color: THEME.colors.gray }}>Manage employees and their records ({employees.length} total)</p>
					</div>
					<div className="flex items-center gap-2">
						<Link href={`/${'admin'}/employees/new`}>
							<Button variant="primary">Add Employee</Button>
						</Link>
					</div>
				</CardHeader>
				<CardContent className="p-4 md:p-6 lg:p-8">
					<div className="overflow-x-auto">
						<table className="min-w-full divide-y">
							<thead>
								<tr>
									<th className="text-left py-2 px-4">Employee ID</th>
									<th className="text-left py-2 px-4">Code</th>
									<th className="text-left py-2 px-4">Name</th>
									<th className="text-left py-2 px-4">Email</th>
									<th className="text-left py-2 px-4">Department</th>
									<th className="text-left py-2 px-4">Designation</th>
									<th className="text-left py-2 px-4">Date of Joining</th>
									<th className="text-left py-2 px-4">Action</th>
								</tr>
							</thead>
							<tbody>
								{employees.map(emp => (
									<tr key={emp.employeeId} className="hover:bg-gray-50">
										<td className="py-3 px-4 font-medium">{emp.employeeId}</td>
										<td className="py-3 px-4">{emp.employeeCode}</td>
										<td className="py-3 px-4">{emp.fullName}</td>
										<td className="py-3 px-4">{emp.personalEmail}</td>
										<td className="py-3 px-4">{emp.department}</td>
										<td className="py-3 px-4">{emp.designation}</td>
										<td className="py-3 px-4">{emp.dateOfJoining}</td>
										<td className="py-3 px-4">
											<Link href={`/${'admin'}/employees/${emp.employeeId}`}>
												<Button variant="outline" size="sm">View</Button>
											</Link>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</CardContent>
			</Card>
		</div>
	);
};

export default EmployeesListPage;

