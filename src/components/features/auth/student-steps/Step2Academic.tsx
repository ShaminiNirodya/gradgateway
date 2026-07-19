"use client";

import { useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { academicInfoSchema, AcademicInfoData } from "@/lib/validators/student-register";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { motion } from "framer-motion";
import RegistrationStepHeader from "@/components/features/auth/RegistrationStepHeader";
import { GraduationCap, BookOpen, Calendar, Award } from "lucide-react";
import {
  SELECT_UNSET,
  fromControlledSelectValue,
  toControlledSelectValue,
} from "@/lib/utils/controlled-select";
import { GPA_OPTIONS, GRADUATION_YEARS } from "@/lib/constants/academic-options";
import { useAcademicCatalog } from "@/lib/hooks/use-academic-catalog";

interface Step2Props {
  onNext: (data: AcademicInfoData) => void;
  onBack: () => void;
  defaultValues?: Partial<AcademicInfoData>;
}

export default function Step2Academic({ onNext, onBack, defaultValues }: Step2Props) {
  const { universities, loading, getDegreesForUniversity } = useAcademicCatalog();
  const { control, handleSubmit, watch, setValue, formState: { errors } } = useForm<AcademicInfoData>({
    resolver: zodResolver(academicInfoSchema),
    defaultValues,
  });

  const selectedUniversity = watch("university");

  const availableDegrees = useMemo(() => {
    if (!selectedUniversity) return [];
    return getDegreesForUniversity(selectedUniversity);
  }, [selectedUniversity, getDegreesForUniversity]);

  const selectTriggerClass =
    "h-14 w-full min-w-0 rounded-2xl bg-slate-50 border-transparent focus:ring-0 focus:border-[#6C5DD3] data-[state=open]:border-[#6C5DD3]";

  return (
    <motion.form
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      onSubmit={handleSubmit(onNext)}
      className="min-w-0 space-y-6"
    >
      <RegistrationStepHeader
        accent="student"
        title="Academic background"
        description="Select your university and degree program."
      />

      <div className="space-y-5">
        <div className="space-y-2">
          <Label className="text-slate-600 font-bold ml-1">University</Label>
          <Controller
            name="university"
            control={control}
            render={({ field }) => (
              <Select
                value={toControlledSelectValue(field.value)}
                onValueChange={(val) => {
                  const nextUniversity = fromControlledSelectValue(val);
                  field.onChange(nextUniversity);
                  setValue("degree", "");
                }}
                disabled={loading}
              >
                <SelectTrigger className={selectTriggerClass}>
                  <GraduationCap className="h-5 w-5 shrink-0 text-[#6C5DD3]" />
                  <SelectValue placeholder={loading ? "Loading universities…" : "Select University"} />
                </SelectTrigger>
                <SelectContent
                  position="popper"
                  align="start"
                  className="max-h-72 w-[var(--radix-select-trigger-width)] rounded-xl border-slate-200 shadow-xl"
                >
                  <SelectItem value={SELECT_UNSET} disabled className="hidden">
                    Select University
                  </SelectItem>
                  {universities.map((u) => (
                    <SelectItem
                      key={u}
                      value={u}
                      className="cursor-pointer whitespace-normal rounded-lg py-2.5 leading-snug"
                    >
                      {u}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.university && <p className="text-xs text-red-500 font-bold ml-2">{errors.university.message}</p>}
        </div>

        <div className="space-y-2">
          <Label className="text-slate-600 font-bold ml-1">Degree Program</Label>
          <Controller
            name="degree"
            control={control}
            render={({ field }) => (
              <Select
                value={toControlledSelectValue(field.value)}
                onValueChange={(val) => field.onChange(fromControlledSelectValue(val))}
                disabled={!selectedUniversity}
              >
                <SelectTrigger className={selectTriggerClass}>
                  <BookOpen className="h-5 w-5 shrink-0 text-[#6C5DD3]" />
                  <SelectValue
                    placeholder={
                      !selectedUniversity
                        ? "Select university first"
                        : availableDegrees.length === 0
                          ? "No degrees listed for this university"
                          : "Select degree"
                    }
                  />
                </SelectTrigger>
                <SelectContent
                  position="popper"
                  align="start"
                  className="max-h-72 w-[var(--radix-select-trigger-width)] rounded-xl border-slate-200 shadow-xl"
                >
                  <SelectItem value={SELECT_UNSET} disabled className="hidden">
                    Select Degree
                  </SelectItem>
                  {availableDegrees.map((d) => (
                    <SelectItem
                      key={d}
                      value={d}
                      className="cursor-pointer whitespace-normal rounded-lg py-2.5 leading-snug"
                    >
                      {d}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.degree && <p className="text-xs text-red-500 font-bold ml-2">{errors.degree.message}</p>}
        </div>

        <div className="space-y-2">
          <Label className="text-slate-600 font-bold ml-1">Current Academic Year</Label>
          <Controller
            name="currentYear"
            control={control}
            render={({ field }) => (
              <Select
                value={toControlledSelectValue(
                  field.value != null ? String(field.value) : ""
                )}
                onValueChange={(val) => {
                  const next = fromControlledSelectValue(val);
                  field.onChange(next === "" ? undefined : parseInt(next, 10));
                }}
              >
                <SelectTrigger className={selectTriggerClass}>
                  <GraduationCap className="h-5 w-5 shrink-0 text-[#6C5DD3]" />
                  <SelectValue placeholder="Select Academic Year" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-none shadow-xl">
                  <SelectItem value={SELECT_UNSET} disabled className="hidden">
                    Select Academic Year
                  </SelectItem>
                  <SelectItem value="1" className="rounded-lg my-1 cursor-pointer">1st Year</SelectItem>
                  <SelectItem value="2" className="rounded-lg my-1 cursor-pointer">2nd Year</SelectItem>
                  <SelectItem value="3" className="rounded-lg my-1 cursor-pointer">3rd Year</SelectItem>
                  <SelectItem value="4" className="rounded-lg my-1 cursor-pointer">4th Year</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
          {errors.currentYear && <p className="text-xs text-red-500 font-bold ml-2">{errors.currentYear.message}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-slate-600 font-bold ml-1">GPA</Label>
            <Controller
              name="gpa"
              control={control}
              render={({ field }) => (
                <Select
                  value={toControlledSelectValue(field.value)}
                  onValueChange={(val) => field.onChange(fromControlledSelectValue(val))}
                >
                  <SelectTrigger className={selectTriggerClass}>
                    <Award className="h-5 w-5 shrink-0 text-[#6C5DD3]" />
                    <SelectValue placeholder="Select GPA" />
                  </SelectTrigger>
                  <SelectContent className="max-h-60 rounded-xl border-none shadow-xl">
                    <SelectItem value={SELECT_UNSET} disabled className="hidden">
                      Select GPA
                    </SelectItem>
                    {GPA_OPTIONS.map((option) => (
                      <SelectItem
                        key={option.value}
                        value={option.value}
                        className="cursor-pointer rounded-lg my-1"
                      >
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.gpa && <p className="text-xs text-red-500 font-bold ml-2">{errors.gpa.message}</p>}
          </div>
          <div className="space-y-2">
            <Label className="text-slate-600 font-bold ml-1">Grad Year</Label>
            <Controller
              name="gradYear"
              control={control}
              render={({ field }) => (
                <Select
                  value={toControlledSelectValue(field.value)}
                  onValueChange={(val) => field.onChange(fromControlledSelectValue(val))}
                >
                  <SelectTrigger className={selectTriggerClass}>
                    <Calendar className="h-5 w-5 shrink-0 text-[#6C5DD3]" />
                    <SelectValue placeholder="Select year" />
                  </SelectTrigger>
                  <SelectContent className="max-h-60 rounded-xl border-none shadow-xl">
                    <SelectItem value={SELECT_UNSET} disabled className="hidden">
                      Select year
                    </SelectItem>
                    {GRADUATION_YEARS.map((year) => (
                      <SelectItem
                        key={year}
                        value={String(year)}
                        className="cursor-pointer rounded-lg my-1"
                      >
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.gradYear && <p className="text-xs text-red-500 font-bold ml-2">{errors.gradYear.message}</p>}
          </div>
        </div>
      </div>

      <div className="flex gap-4 pt-6">
        <Button type="button" variant="ghost" onClick={onBack} className="w-1/3 h-14 rounded-2xl text-slate-500 font-bold hover:bg-slate-100 hover:text-slate-700">Back</Button>
        <Button type="submit" className="w-2/3 h-14 rounded-2xl bg-[#6C5DD3] hover:bg-[#5b4eb8] text-white text-lg font-bold shadow-lg shadow-indigo-200">Next Step</Button>
      </div>
    </motion.form>
  );
}
