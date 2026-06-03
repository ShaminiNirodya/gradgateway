"use client";

import { useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { academicInfoSchema, AcademicInfoData } from "@/lib/validators/student-register";
import { Input } from "@/components/ui/input";
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
import { GraduationCap, BookOpen, Calendar, Award } from "lucide-react";
import { ALL_UNIVERSITIES, getDegreesForUniversity } from "@/lib/constants/university-degrees";
import {
  getDegreesForFieldOfMajor,
  degreeBelongsToField,
  fieldOfMajorFromDegreeSelection,
  type FieldOfMajorId,
} from "@/lib/constants/field-of-major";
import { FieldOfMajorSelect } from "@/components/shared/FieldOfMajorSelect";
import { FieldOfMajorSubcategoriesNotice } from "@/components/shared/FieldOfMajorSubcategoriesNotice";
import {
  SELECT_UNSET,
  fromControlledSelectValue,
  toControlledSelectValue,
} from "@/lib/utils/controlled-select";

interface Step2Props {
  onNext: (data: AcademicInfoData) => void;
  onBack: () => void;
}

export default function Step2Academic({ onNext, onBack }: Step2Props) {
  const { control, register, handleSubmit, watch, setValue, formState: { errors } } = useForm<AcademicInfoData>({
    resolver: zodResolver(academicInfoSchema)
  });

  const selectedUniversity = watch("university");
  const selectedFieldOfMajor = watch("fieldOfMajor");
  const selectedDegree = watch("degree");

  const availableDegrees = useMemo(() => {
    if (!selectedUniversity) return [];
    let degrees = getDegreesForUniversity(selectedUniversity);
    if (selectedFieldOfMajor) {
      const fieldSet = new Set(getDegreesForFieldOfMajor(selectedFieldOfMajor));
      degrees = degrees.filter((d) => fieldSet.has(d));
    }
    return degrees;
  }, [selectedUniversity, selectedFieldOfMajor]);

  return (
    <motion.form
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      onSubmit={handleSubmit(onNext)}
      className="space-y-6"
    >
      <div className="space-y-5">
        <div className="space-y-2">
          <Label className="text-slate-600 font-bold ml-1">University</Label>
          <Controller
            name="university"
            control={control}
            render={({ field }) => (
              <Select
                value={toControlledSelectValue(field.value)}
                onValueChange={(val) => field.onChange(fromControlledSelectValue(val))}
              >
                <SelectTrigger className="h-14 rounded-2xl bg-slate-50 border-transparent focus:ring-0 focus:border-[#6C5DD3] data-[state=open]:border-[#6C5DD3]">
                  <div className="flex items-center gap-3 text-slate-700">
                    <GraduationCap className="w-5 h-5 text-[#6C5DD3]" />
                    <SelectValue placeholder="Select University" />
                  </div>
                </SelectTrigger>
                <SelectContent className="rounded-xl border-none shadow-xl max-h-72">
                  <SelectItem value={SELECT_UNSET} disabled className="hidden">
                    Select University
                  </SelectItem>
                  {ALL_UNIVERSITIES.map((u) => (
                    <SelectItem key={u} value={u} className="rounded-lg my-1 cursor-pointer">{u}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.university && <p className="text-xs text-red-500 font-bold ml-2">{errors.university.message}</p>}
        </div>

        <div className="space-y-2">
          <Label className="text-slate-600 font-bold ml-1">Field of Major</Label>
          <Controller
            name="fieldOfMajor"
            control={control}
            render={({ field }) => (
              <FieldOfMajorSelect
                value={(field.value as FieldOfMajorId) || ""}
                onValueChange={(val) => {
                  field.onChange(val);
                  if (selectedDegree && !degreeBelongsToField(selectedDegree, val)) {
                    setValue("degree", "");
                  }
                }}
                placeholder="Select Field of Major"
                triggerClassName="h-14 rounded-2xl bg-slate-50 border-transparent focus:ring-0 focus:border-[#6C5DD3] data-[state=open]:border-[#6C5DD3]"
                contentClassName="rounded-xl border-none shadow-xl max-h-72"
              />
            )}
          />
          {errors.fieldOfMajor && <p className="text-xs text-red-500 font-bold ml-2">{errors.fieldOfMajor.message}</p>}
          <FieldOfMajorSubcategoriesNotice fieldId={(selectedFieldOfMajor as FieldOfMajorId) || ""} />
        </div>

        <div className="space-y-2">
          <Label className="text-slate-600 font-bold ml-1">Degree Program</Label>
          <Controller
            name="degree"
            control={control}
            render={({ field }) => (
              <Select
                value={toControlledSelectValue(field.value)}
                onValueChange={(val) => {
                  const next = fromControlledSelectValue(val);
                  field.onChange(next);
                  const inferred = fieldOfMajorFromDegreeSelection(
                    next,
                    (selectedFieldOfMajor as FieldOfMajorId) || ""
                  );
                  if (inferred) setValue("fieldOfMajor", inferred);
                }}
                disabled={!selectedUniversity}
              >
                <SelectTrigger className="h-14 rounded-2xl bg-slate-50 border-transparent focus:ring-0 focus:border-[#6C5DD3]">
                  <div className="flex items-center gap-3 text-slate-700">
                    <BookOpen className="w-5 h-5 text-[#6C5DD3]" />
                    <SelectValue
                      placeholder={
                        !selectedUniversity ? "Select university first" : "Select Degree"
                      }
                    />
                  </div>
                </SelectTrigger>
                <SelectContent className="rounded-xl border-none shadow-xl max-h-72">
                  <SelectItem value={SELECT_UNSET} disabled className="hidden">
                    Select Degree
                  </SelectItem>
                  {availableDegrees.map((d) => (
                    <SelectItem key={d} value={d} className="rounded-lg my-1 cursor-pointer">{d}</SelectItem>
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
                <SelectTrigger className="h-14 rounded-2xl bg-slate-50 border-transparent focus:ring-0 focus:border-[#6C5DD3]">
                  <div className="flex items-center gap-3 text-slate-700">
                    <GraduationCap className="w-5 h-5 text-[#6C5DD3]" />
                    <SelectValue placeholder="Select Academic Year" />
                  </div>
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
            <div className="relative">
              <Award className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <Input {...register("gpa")} type="number" step="0.01" className="pl-12 h-14 rounded-2xl bg-slate-50 border-transparent focus:bg-white focus:border-[#6C5DD3] focus:ring-0 font-medium" placeholder="3.8" />
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-slate-600 font-bold ml-1">Grad Year</Label>
            <div className="relative">
              <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <Input {...register("gradYear")} type="number" className="pl-12 h-14 rounded-2xl bg-slate-50 border-transparent focus:bg-white focus:border-[#6C5DD3] focus:ring-0 font-medium" placeholder="2026" />
            </div>
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
