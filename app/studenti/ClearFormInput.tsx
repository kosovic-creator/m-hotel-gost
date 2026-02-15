'use client';

import { useTransition } from 'react';
import handleSubmit from '@/actions/student';

type ClearFormInputProps = {
  placeholder?: string;
};

export function ClearFormInput({ placeholder = 'Unesi tekst' }: ClearFormInputProps) {
  const [isPending, startTransition] = useTransition();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    startTransition(async () => {
      await handleSubmit({ query: value });
    });
  };

  return (
    <input
      type="text"
      placeholder={placeholder}
      onChange={handleChange}
      disabled={isPending}
      className="px-3 py-2 border rounded"
    />
  );
}
