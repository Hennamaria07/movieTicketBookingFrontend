import React from 'react';
import { UseFormRegister, FieldError } from 'react-hook-form';
import { Input } from '../../components/ui/input';

interface FormInputProps {
  id: string;
  name: string;
  label: string;
  type?: string;
  register: UseFormRegister<any>;
  error?: FieldError;
  required?: boolean;
  className?: string;
}

export const FormInput: React.FC<FormInputProps> = ({
  id,
  name,
  label,
  type = 'text',
  register,
  error,
  required = false,
  className,
  ...props
}) => {
  return (
    <div className="space-y-2">
      <label 
        htmlFor={id} 
        className="block text-sm font-medium text-gray-700"
      >
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <Input
        id={id}
        type={type}
        className={className}
        {...register(name)}
        {...props}
      />
      {error && (
        <p className="text-sm text-red-600 mt-1">{error.message}</p>
      )}
    </div>
  );
};