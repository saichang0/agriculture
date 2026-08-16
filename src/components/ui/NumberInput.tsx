import { InputHTMLAttributes, forwardRef, useState, useEffect } from "react";

interface NumberInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "value" | "onChange" | "type"> {
  label?: string;
  error?: string;
  value: string;
  onChange: (value: string) => void;
}

function formatWithCommas(raw: string): string {
  if (!raw) return "";
  const [intPart, decimalPart] = raw.split(".");
  const formattedInt = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return decimalPart !== undefined ? `${formattedInt}.${decimalPart}` : formattedInt;
}

function stripCommas(formatted: string): string {
  return formatted.replace(/,/g, "");
}

function stripLeadingZeros(raw: string): string {
  const [intPart, decimalPart] = raw.split(".");
  const trimmedInt = intPart.replace(/^0+(?=\d)/, "");
  return decimalPart !== undefined ? `${trimmedInt}.${decimalPart}` : trimmedInt;
}

export const NumberInput = forwardRef<HTMLInputElement, NumberInputProps>(
  ({ label, error, value, onChange, className = "", id, ...props }, ref) => {
    const [display, setDisplay] = useState(() => formatWithCommas(value));

    useEffect(() => {
      setDisplay(formatWithCommas(value));
    }, [value]);

    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
      const rawInput = stripCommas(e.target.value);
      if (rawInput !== "" && !/^\d*\.?\d*$/.test(rawInput)) return;
      const raw = stripLeadingZeros(rawInput);
      setDisplay(formatWithCommas(raw));
      onChange(raw);
    }

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={id} className="text-sm font-medium text-text-secondary">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={id}
          type="text"
          inputMode="decimal"
          value={display}
          onChange={handleChange}
          className={`h-11 rounded-control border border-border bg-surface px-3.5 text-sm text-text-primary placeholder:text-text-muted outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/10 ${error ? "border-danger focus:border-danger focus:ring-danger/10" : ""} ${className}`}
          {...props}
        />
        {error && <span className="text-xs text-danger">{error}</span>}
      </div>
    );
  }
);
NumberInput.displayName = "NumberInput";
