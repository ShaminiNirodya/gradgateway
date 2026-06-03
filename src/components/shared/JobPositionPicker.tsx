"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  JOB_POSITION_CATEGORIES,
  JOB_POSITION_OTHER_CATEGORY_ID,
  isOtherJobCategory,
} from "@/lib/constants/job-positions";
import {
  SELECT_UNSET,
  fromControlledSelectValue,
  toControlledSelectValue,
} from "@/lib/utils/controlled-select";

type JobPositionPickerProps = {
  categoryId: string;
  position: string;
  otherPositionName: string;
  otherPositionDetails: string;
  onCategoryChange: (categoryId: string) => void;
  onPositionChange: (position: string) => void;
  onOtherPositionNameChange: (value: string) => void;
  onOtherPositionDetailsChange: (value: string) => void;
  showOtherDetails?: boolean;
  categoryLabel?: string;
  positionLabel?: string;
};

export function JobPositionPicker({
  categoryId,
  position,
  otherPositionName,
  otherPositionDetails,
  onCategoryChange,
  onPositionChange,
  onOtherPositionNameChange,
  onOtherPositionDetailsChange,
  showOtherDetails = true,
  categoryLabel = "Job category",
  positionLabel = "Job position",
}: JobPositionPickerProps) {
  const selectedCategory = JOB_POSITION_CATEGORIES.find((c) => c.id === categoryId);
  const isOther = isOtherJobCategory(categoryId);

  const handleCategoryChange = (value: string) => {
    onCategoryChange(fromControlledSelectValue(value));
    onPositionChange("");
    if (fromControlledSelectValue(value) !== JOB_POSITION_OTHER_CATEGORY_ID) {
      onOtherPositionNameChange("");
      onOtherPositionDetailsChange("");
    }
  };

  return (
    <div className="space-y-4">
      <div className="relative w-full space-y-2">
        <Label>{categoryLabel} *</Label>
        <Select value={toControlledSelectValue(categoryId)} onValueChange={handleCategoryChange}>
          <SelectTrigger className="h-11 w-full rounded-xl border-slate-200/80 bg-white">
            <SelectValue placeholder="Select a category" />
          </SelectTrigger>
          <SelectContent
            position="popper"
            align="start"
            className="max-h-72 rounded-xl border-slate-200/80 bg-white"
          >
            <SelectItem value={SELECT_UNSET} disabled className="hidden">
              Select a category
            </SelectItem>
            {JOB_POSITION_CATEGORIES.map((cat) => (
              <SelectItem key={cat.id} value={cat.id} className="cursor-pointer py-2.5">
                {cat.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {categoryId && !isOther && (
        <div className="relative w-full space-y-2">
          <Label>{positionLabel} *</Label>
          <Select
            value={toControlledSelectValue(position)}
            onValueChange={(value) => onPositionChange(fromControlledSelectValue(value))}
          >
            <SelectTrigger className="h-11 w-full rounded-xl border-slate-200/80 bg-white">
              <SelectValue placeholder="Select a position" />
            </SelectTrigger>
            <SelectContent
              position="popper"
              align="start"
              className="max-h-72 rounded-xl border-slate-200/80 bg-white"
            >
              <SelectItem value={SELECT_UNSET} disabled className="hidden">
                Select a position
              </SelectItem>
              {selectedCategory?.positions.map((pos) => (
                <SelectItem key={pos} value={pos} className="cursor-pointer py-2.5">
                  {pos}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {isOther && (
        <>
          <div className="space-y-2">
            <Label>Position name *</Label>
            <Input
              value={otherPositionName}
              onChange={(e) => onOtherPositionNameChange(e.target.value)}
              placeholder="e.g. Blockchain Developer"
              className="rounded-xl border-slate-200/80"
            />
            <p className="text-xs text-slate-500">
              Use this when the role does not fit any standard category above.
            </p>
          </div>
          {showOtherDetails && (
            <div className="space-y-2">
              <Label>Role details *</Label>
              <textarea
                value={otherPositionDetails}
                onChange={(e) => onOtherPositionDetailsChange(e.target.value)}
                className="min-h-[100px] w-full rounded-xl border border-slate-200/80 bg-white px-3 py-2 text-sm"
                placeholder="Describe responsibilities, level, and expectations for this custom role"
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}
