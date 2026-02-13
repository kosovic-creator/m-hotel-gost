
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ReactNode } from 'react';

type FormWrapperProps = {
  title: string;
  action: (formData: FormData) => void | Promise<void>;
  children: ReactNode;
  submitLabel: string;
  cancelLabel: string;
  cancelHref: string;
  description?: string;
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
  description,
  noValidate = true,
  className = '',
}: FormWrapperProps) {
  return (
    <div className={`flex flex-col items-center justify-center min-h-screen px-4 py-8 pt-24 ${className}`}>
      <div className="w-full max-w-2xl bg-white dark:bg-gray-950 rounded-xl shadow-lg border border-gray-200 dark:border-gray-800 p-6 sm:p-8">
        <div className="mb-6">
          <h1 className="text-xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">{title}</h1>
          {description && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              {description}
            </p>
          )}
        </div>
        <form action={action} className="space-y-6" noValidate={noValidate}>
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
    <div className="flex flex-col sm:flex-row gap-3 mt-4 pt-4 border-t">
      <a href={cancelHref} className="flex-1">
        <Button type="button" variant="outline" className="w-full">
          <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
          {cancelLabel}
        </Button>
      </a>
      <Button type="submit" className="flex-1">
        <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
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
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      {children}
      {error && (
        <p className="text-red-600 dark:text-red-400 text-sm mt-1 flex items-center gap-1">
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
}

type InputFieldProps = {
  name: string;
  label?: string;
  type?: 'text' | 'email' | 'password' | 'number' | 'date' | 'tel';
  placeholder?: string;
  defaultValue?: string;
  value?: string;
  error?: string;
  required?: boolean;
  className?: string;
  readOnly?: boolean;
  min?: string;
  max?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

export function InputField({
  name,
  label,
  type = 'text',
  placeholder,
  defaultValue,
  value,
  error,
  required,
  className = '',
  readOnly = false,
  min,
  max,
  onChange,
}: InputFieldProps) {
  const inputClassName = readOnly ? `${className} bg-gray-100 cursor-not-allowed` : className;

  return (
    <FormField label={label} error={error} required={required}>
      <Input
        name={name}
        type={type}
        placeholder={placeholder}
        defaultValue={value !== undefined ? undefined : defaultValue}
        value={value}
        required={required}
        readOnly={readOnly}
        min={min}
        max={max}
        onChange={onChange}
        aria-invalid={!!error}
        className={inputClassName}
      />
    </FormField>
  );
}

type SelectOption = {
  value: string | number;
  label: string;
  statusColor?: string;
};

type SelectFieldProps = {
  name: string;
  label?: string;
  options: SelectOption[];
  defaultValue?: string | number;
  value?: string;
  placeholder?: string;
  error?: string;
  required?: boolean;
  className?: string;
  readOnly?: boolean;
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
};

export function SelectField({
  name,
  label,
  options,
  defaultValue,
  value,
  placeholder,
  error,
  required,
  className = '',
  readOnly = false,
  onChange,
}: SelectFieldProps) {
  const selectClassName = readOnly
    ? `h-9 w-full rounded-md border border-Input px-3 py-1 text-sm shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive disabled:cursor-not-allowed disabled:opacity-50 dark:bg-Input/30 bg-gray-100 cursor-not-allowed pointer-events-none ${className}`
    : `h-9 w-full rounded-md border border-Input bg-transparent px-3 py-1 text-sm shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive disabled:cursor-not-allowed disabled:opacity-50 dark:bg-Input/30 ${className}`;

  // Ako koristimo value (kontrolisana komponenta), osiguraj da je string
  const selectValue = value !== undefined ? String(value) : (defaultValue !== undefined ? String(defaultValue) : '');
  const isControlled = value !== undefined;

  return (
    <FormField label={label} error={error} required={required}>
      <select
        name={name}
        className={selectClassName}
        required={required}
        defaultValue={!isControlled ? selectValue : undefined}
        value={isControlled ? selectValue : undefined}
        onChange={onChange}
        aria-invalid={!!error}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((option) => (
          <option key={option.value} value={option.value} style={option.statusColor ? { backgroundColor: 'var(--status-bg)', color: 'var(--status-text)' } : {}} className={option.statusColor}>
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
