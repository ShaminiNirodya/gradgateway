"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FIELDS_OF_MAJOR, type FieldOfMajorId } from "@/lib/constants/field-of-major";

type FieldOfMajorSelectProps = {
  value: FieldOfMajorId | "";
  onValueChange: (value: FieldOfMajorId) => void;
  disabled?: boolean;
  placeholder?: string;
  triggerClassName?: string;
  contentClassName?: string;
};

export function FieldOfMajorSelect({
  value,
  onValueChange,
  disabled = false,
  placeholder = "Select your field of major...",
  triggerClassName = "rounded-xl h-10",
  contentClassName = "rounded-xl max-h-72",
}: FieldOfMajorSelectProps) {
  return (
    <Select
      value={value || undefined}
      onValueChange={(val) => onValueChange(val as FieldOfMajorId)}
      disabled={disabled}
    >
      <SelectTrigger className={triggerClassName}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent className={contentClassName}>
        {FIELDS_OF_MAJOR.map((field) => (
          <SelectItem
            key={field.id}
            value={field.id}
            className="rounded-lg cursor-pointer"
          >
            {field.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
