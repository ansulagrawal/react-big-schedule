interface SelectProps<T extends string> {
  value: T;
  options: readonly { value: T; label: string }[];
  onChange: (value: T) => void;
  label?: string;
}

export default function Select<T extends string>({ value, options, onChange, label }: SelectProps<T>) {
  return (
    <select
      className="ex-select"
      aria-label={label}
      value={value}
      onChange={e => {
        // the option values are exactly the T values handed in
        const next = options.find(o => o.value === e.target.value);
        if (next) onChange(next.value);
      }}
    >
      {options.map(o => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}
