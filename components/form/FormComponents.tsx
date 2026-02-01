"use client";

import { Button } from '@/components/ui/button';
import { ReactNode } from 'react';

type FormWrapperProps = {
  title: string;
  action: (formData: FormData) => void | Promise<void>;
  children: ReactNode;
  submitLabel: string;
  cancelLabel: string;
  cancelHref: string;
  noValidate?: boolean;
  className?: string;
};

export function FormWrapper({
  title,
  action,
  children,
  submitLabel,
  cancelLabel,
  cancelHref,
  noValidate = true,
  className = '',
}: FormWrapperProps) {
  return (
    <div className={`flex flex-col items-center justify-center min-h-screen px-2 sm:px-0 bg-gray-50 ${className}`}>
      <div className="w-full max-w-md bg-white rounded-lg shadow-md p-4 sm:p-8 mt-8">
        <h1 className="text-xl sm:text-2xl font-bold mb-4 text-center">{title}</h1>
        <form action={action} className="mb-8 flex gap-4 flex-col max-w-md mt-4 w-full" noValidate={noValidate}>
          {children}
          <FormActions
            submitLabel={submitLabel}
            cancelLabel={cancelLabel}
            cancelHref={cancelHref}
          />
        </form>
      </div>
    </div>
  );
}

type FormActionsProps = {
  submitLabel: string;
  cancelLabel: string;
  cancelHref: string;
};

export function FormActions({ submitLabel, cancelLabel, cancelHref }: FormActionsProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:gap-x-0 gap-y-3 mt-1 pt-3 border-t">
      <a
        href={cancelHref}
        className="flex-1 py-2 text-base text-gray-600 hover:text-blue-900 border rounded text-center flex items-center justify-center"
      >
        {cancelLabel}
      </a>
      <Button type="submit">
        {submitLabel}
      </Button>
    </div>
  );
}

type FormFieldProps = {
  label?: string;
  error?: string;
  required?: boolean;
  className?: string;
  children: ReactNode;
};

export function FormField({ label, error, required, className = '', children }: FormFieldProps) {
  return (
    <label className={className}>
      {label && (
        <span className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </span>
      )}
      {children}
      {error && <span className="text-red-600 text-xs block mt-1">{error}</span>}
    </label>
  );
}

type InputFieldProps = {
  name: string;
  label?: string;
  type?: 'text' | 'email' | 'password' | 'number' | 'date' | 'tel';
  placeholder?: string;
  defaultValue?: string;
  error?: string;
  required?: boolean;
  className?: string;
  readOnly?: boolean;
};

export function InputField({
  name,
  label,
  type = 'text',
  placeholder,
  defaultValue,
  error,
  required,
  className = '',
  readOnly = false,
}: InputFieldProps) {
  return (
    <FormField label={label} error={error} required={required}>
      <input
        name={name}
        type={type}
        placeholder={placeholder}
        defaultValue={defaultValue}
        required={required}
        readOnly={readOnly}
        className={`border rounded px-2 py-1 w-full ${className} ${readOnly ? 'bg-gray-100' : ''}`}
      />
    </FormField>
  );
}

type SelectOption = {
  value: string | number;
  label: string;
};

type SelectFieldProps = {
  name: string;
  label?: string;
  options: SelectOption[];
  defaultValue?: string | number;
  placeholder?: string;
  error?: string;
  required?: boolean;
  className?: string;
};

export function SelectField({
  name,
  label,
  options,
  defaultValue,
  placeholder,
  error,
  required,
  className = '',
}: SelectFieldProps) {
  return (
    <FormField label={label} error={error} required={required}>
      <select
        name={name}
        className={`border rounded px-2 py-1 w-full ${className}`}
        required={required}
        defaultValue={defaultValue}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </FormField>
  );
}

type HiddenFieldProps = {
  name: string;
  value: string | number;
};

export function HiddenField({ name, value }: HiddenFieldProps) {
  return <input type="hidden" name={name} value={value} />;
}
