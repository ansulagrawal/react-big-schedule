import type { ReactNode } from 'react';

interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  children?: ReactNode;
}

export default function Switch({ checked, onChange, children }: SwitchProps) {
  return (
    <label className="ex-switch">
      <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} />
      <span className="ex-switch-track" />
      {children}
    </label>
  );
}
