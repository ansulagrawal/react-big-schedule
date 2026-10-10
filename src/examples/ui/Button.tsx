import type { ButtonHTMLAttributes } from 'react';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'default' | 'primary' | 'ghost' };

export default function Button({ variant = 'default', className = '', type = 'button', ...rest }: ButtonProps) {
  return <button type={type} className={`ex-btn ex-btn-${variant} ${className}`.trim()} {...rest} />;
}
