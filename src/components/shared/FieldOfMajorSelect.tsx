"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FIELDS_OF_MAJOR, type FieldOfMajorId, type FieldOfMajorOption } from "@/lib/constants/field-of-major";
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
  /** When set, only these fields appear (e.g. filtered by university) */
  fields?: FieldOfMajorOption[];
};

export function FieldOfMajorSelect({
  value,
  onValueChange,
  disabled = false,
  placeholder = "Select your field of major...",
  triggerClassName = "rounded-xl h-10",
  contentClassName = "rounded-xl max-h-72",
  fields,
}: FieldOfMajorSelectProps) {
  const options = fields ?? FIELDS_OF_MAJOR;

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
        {options.length === 0 ? (
          <SelectItem value="__none__" disabled className="rounded-lg text-slate-400">
            No majors available for this university
          </SelectItem>
        ) : (
          options.map((field) => (
            <SelectItem
              key={field.id}
              value={field.id}
              className="cursor-pointer rounded-lg"
            >
              {field.label}
            </SelectItem>
          ))
        )}
      </SelectContent>
    </Select>
  );
}
