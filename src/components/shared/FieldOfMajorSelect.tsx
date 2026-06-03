"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FIELDS_OF_MAJOR, type FieldOfMajorId } from "@/lib/constants/field-of-major";
import {
  SELECT_UNSET,
  fromControlledSelectValue,
  toControlledSelectValue,
} from "@/lib/utils/controlled-select";

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
      value={toControlledSelectValue(value)}
      onValueChange={(val) => {
        const next = fromControlledSelectValue(val);
        if (next) onValueChange(next as FieldOfMajorId);
      }}
      disabled={disabled}
    >
      <SelectTrigger className={triggerClassName}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent className={contentClassName}>
        <SelectItem value={SELECT_UNSET} disabled className="hidden">
          {placeholder}
        </SelectItem>
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
