import React from 'react';
import EmployeeForm from '../../../../../components/admin/EmployeeForm';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../../components/ui/card';
import { THEME } from '../../../../../lib/theme';

const NewEmployeePage = () => {
  return (
    <div className="p-4 md:p-6 lg:p-8 min-h-screen" style={{ backgroundColor: THEME.colors.background }}>
      <Card className="bg-white rounded-2xl shadow-xl border-0">
        <CardHeader className="p-4 md:p-6 lg:p-8">
          <CardTitle className="text-2xl font-bold" style={{ color: THEME.colors.primary }}>
            Create Employee
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 md:p-6 lg:p-8">
          <EmployeeForm />
        </CardContent>
      </Card>
    </div>
  );
};

export default NewEmployeePage;
