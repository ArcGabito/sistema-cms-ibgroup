import { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";
import { FieldError } from "react-hook-form";

const labelClass = "mb-1.5 block text-[11px] font-semibold tracking-wider text-ink/50 uppercase";
const controlClass =
  "w-full rounded-md border border-black/10 bg-white px-4 py-2.5 text-sm text-ink outline-none transition-colors focus:border-brand";
const errorClass = "mt-1 text-xs text-brand";

interface FieldWrapperProps {
  label: string;
  error?: FieldError;
  wrapperClassName?: string;
  children: React.ReactNode;
}

function FieldWrapper({ label, error, wrapperClassName = "", children }: FieldWrapperProps) {
  return (
    <div className={wrapperClassName}>
      <label className={labelClass}>{label}</label>
      {children}
      {error && <p className={errorClass}>{error.message}</p>}
    </div>
  );
}

export function TextField({
  label,
  error,
  className = "",
  ...props
}: { label: string; error?: FieldError } & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <FieldWrapper label={label} error={error} wrapperClassName={className}>
      <input className={controlClass} {...props} />
    </FieldWrapper>
  );
}

export function SelectField({
  label,
  error,
  options,
  placeholder = "Seleccione",
  className = "",
  ...props
}: {
  label: string;
  error?: FieldError;
  options: string[];
  placeholder?: string;
} & SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <FieldWrapper label={label} error={error} wrapperClassName={className}>
      <select className={`${controlClass} cursor-pointer`} defaultValue="" {...props}>
        <option value="" disabled>
          {placeholder}
        </option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </FieldWrapper>
  );
}

export function TextareaField({
  label,
  error,
  className = "",
  ...props
}: { label: string; error?: FieldError } & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <FieldWrapper label={label} error={error} wrapperClassName={className}>
      <textarea className={`${controlClass} resize-none`} rows={4} {...props} />
    </FieldWrapper>
  );
}
