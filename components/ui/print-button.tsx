'use client';

import { Button } from './button';

interface PrintButtonProps {
  children: React.ReactNode;
  className?: string;
}

export function PrintButton({ children, className }: PrintButtonProps) {
  const handlePrint = () => {
    window.print();
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handlePrint}
      className={`print:hidden ${className || ''}`}
    >
      {children}
    </Button>
  );
}