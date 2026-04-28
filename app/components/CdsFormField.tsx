"use client";

import { Select } from "@coinbase/cds-web/alpha/select";
import { TextInput } from "@coinbase/cds-web/controls";
import type React from "react";

export interface CdsOption {
  value: string;
  label: string;
  description?: string;
  disabled?: boolean;
}

interface CdsSelectFieldProps {
  label: string;
  value: string;
  options: CdsOption[];
  onChange: (value: string) => void;
  helperText?: string;
  placeholder?: string;
  disabled?: boolean;
}

export function CdsSelectField({
  label,
  value,
  options,
  onChange,
  helperText,
  placeholder,
  disabled,
}: CdsSelectFieldProps) {
  return (
    <Select
      label={label}
      value={value}
      onChange={(nextValue) => {
        if (typeof nextValue === "string") {
          onChange(nextValue);
        }
      }}
      options={options}
      helperText={helperText}
      placeholder={placeholder}
      disabled={disabled}
    />
  );
}

interface CdsTextFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  helperText?: string;
  type?: string;
  readOnly?: boolean;
  suffix?: string;
  start?: React.ReactNode;
}

export function CdsTextField({
  label,
  value,
  onChange,
  placeholder,
  helperText,
  type = "text",
  readOnly,
  suffix,
  start,
}: CdsTextFieldProps) {
  return (
    <TextInput
      label={label}
      value={value}
      onChange={(event) => onChange(event.currentTarget.value)}
      placeholder={placeholder}
      helperText={helperText}
      type={type}
      readOnly={readOnly}
      suffix={suffix}
      start={start ? <span className="cds-input-prefix">{start}</span> : undefined}
      className={start ? "cds-amount-input" : undefined}
    />
  );
}
