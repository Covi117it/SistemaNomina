import React from 'react';
import { Empleado } from '../../types/empleado';
import { PersonalInfoSection } from './PersonalInfoSection';
import { WorkInfoSection } from './WorkInfoSection';

interface EmployeeFormFieldsProps {
  formData: Partial<Empleado>;
  onChange: (field: keyof Empleado, value: any) => void;
  isEditMode?: boolean;
}

export const EmployeeFormFields: React.FC<EmployeeFormFieldsProps> = ({
  formData,
  onChange,
  isEditMode = false,
}) => {
  return (
    <div className="space-y-6">
      <PersonalInfoSection formData={formData} onChange={onChange} />
      <WorkInfoSection formData={formData} onChange={onChange} isEditMode={isEditMode} />
    </div>
  );
};