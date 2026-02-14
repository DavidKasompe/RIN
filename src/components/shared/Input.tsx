import { InputHTMLAttributes, SelectHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

interface SliderProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  min?: number;
  max?: number;
  value?: number;
  showValue?: boolean;
  unit?: string;
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: { value: string; label: string }[];
  error?: string;
}

export function Input({ label, error, helperText, className = '', ...props }: InputProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
          {label}
        </label>
      )}
      <input
        className={`w-full px-4 py-3 rounded-xl border border-[var(--color-muted)] bg-white text-[var(--color-text)] placeholder:text-[var(--color-text-light)] focus:outline-none focus:ring-2 focus:ring-[var(--color-cta)] focus:border-transparent transition-all ${
          error ? 'border-red-500 focus:ring-red-500' : ''
        } ${className}`}
        {...props}
      />
      {helperText && !error && (
        <p className="mt-1 text-xs text-[var(--color-text-light)]">{helperText}</p>
      )}
      {error && (
        <p className="mt-1 text-xs text-red-500">{error}</p>
      )}
    </div>
  );
}

export function Slider({ label, min = 0, max = 100, value = 50, showValue = true, unit = '%', className = '', ...props }: SliderProps) {
  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-2">
        {label && (
          <label className="text-sm font-medium text-[var(--color-text)]">
            {label}
          </label>
        )}
        {showValue && (
          <span className="text-sm font-semibold text-[var(--color-primary)]">
            {value}{unit}
          </span>
        )}
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        className={`w-full h-2 rounded-full appearance-none cursor-pointer bg-[var(--color-card)] accent-[var(--color-cta)] ${className}`}
        style={{
          background: `linear-gradient(to right, var(--color-cta) 0%, var(--color-cta) ${((value - min) / (max - min)) * 100}%, var(--color-card) ${((value - min) / (max - min)) * 100}%, var(--color-card) 100%)`
        }}
        {...props}
      />
      <div className="flex justify-between mt-1">
        <span className="text-xs text-[var(--color-text-light)]">{min}{unit}</span>
        <span className="text-xs text-[var(--color-text-light)]">{max}{unit}</span>
      </div>
    </div>
  );
}

export function Select({ label, options, error, className = '', ...props }: SelectProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
          {label}
        </label>
      )}
      <select
        className={`w-full px-4 py-3 rounded-xl border border-[var(--color-muted)] bg-white text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-cta)] focus:border-transparent transition-all appearance-none cursor-pointer ${
          error ? 'border-red-500 focus:ring-red-500' : ''
        } ${className}`}
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236b6b6b'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'right 12px center',
          backgroundSize: '20px',
        }}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <p className="mt-1 text-xs text-red-500">{error}</p>
      )}
    </div>
  );
}
