"use client";

import { Info } from "lucide-react";
import { getFieldOfMajorById, getDegreesForFieldAtUniversity, type FieldOfMajorId } from "@/lib/constants/field-of-major";

type FieldOfMajorSubcategoriesNoticeProps = {
  fieldId: FieldOfMajorId | "";
  university?: string;
  className?: string;
};

/** Shows which degree programs belong to the selected field of major */
export function FieldOfMajorSubcategoriesNotice({
  fieldId,
  university,
  className = "",
}: FieldOfMajorSubcategoriesNoticeProps) {
  const field = fieldId ? getFieldOfMajorById(fieldId) : undefined;
  if (!field) return null;

  const degreesAtUniversity = university ? getDegreesForFieldAtUniversity(fieldId, university) : [];
  const items =
    university && degreesAtUniversity.length > 0
      ? degreesAtUniversity
      : field.subCategories;

  if (!items.length) return null;

  return (
    <div
      className={`rounded-xl border border-indigo-100 bg-indigo-50/80 px-3 py-2.5 text-sm ${className}`}
      role="status"
      aria-live="polite"
    >
      <div className="flex gap-2">
        <Info className="w-4 h-4 text-[#6C5DD3] flex-shrink-0 mt-0.5" />
        <div className="min-w-0">
          <p className="font-semibold text-indigo-900 text-xs mb-1.5">
            {university
              ? `${field.label} at your university includes:`
              : `${field.label} includes these degree programs:`}
          </p>
          <ul className="flex flex-wrap gap-1.5">
            {items.map((item) => (
              <li
                key={item}
                className="inline-flex px-2 py-0.5 rounded-md bg-white/90 text-indigo-800 text-[11px] font-medium border border-indigo-100"
              >
                {item}
              </li>
            ))}
          </ul>
          <p className="text-[11px] text-indigo-600/90 mt-2">
            Choose your exact program in Major / Degree below.
          </p>
        </div>
      </div>
    </div>
  );
}
