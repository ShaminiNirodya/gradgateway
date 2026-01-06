"use client";

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
import { GraduationCap, BookOpen, Calendar, Award, Hash } from "lucide-react";

// Mock Data
const UNIVERSITIES = [
  "University of Moratuwa", 
  "University of Colombo", 
  "University of Peradeniya",
  "University of Kelaniya",
  "University of Jayewardenepura",
  "SLIIT", 
  "IIT", 
  "NSBM"
];

const DEGREES = [
  "BSc (Hons) Computer Science", 
  "BSc (Hons) Software Engineering", 
  "BSc (Hons) Information Systems", 
  "BSc (Hons) Data Science",
  "BSc (Hons) Cyber Security"
];

interface Step2Props {
  onNext: (data: AcademicInfoData) => void;
  onBack: () => void;
}

export default function Step2Academic({ onNext, onBack }: Step2Props) {
  const { control, register, handleSubmit, formState: { errors } } = useForm<AcademicInfoData>({
    resolver: zodResolver(academicInfoSchema)
  });

  return (
    <motion.form 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      onSubmit={handleSubmit(onNext)} 
      className="space-y-6"
    >
      <div className="space-y-5">
        {/* University */}
        <div className="space-y-2">
          <Label className="text-slate-600 font-bold ml-1">University</Label>
          <Controller
            name="university"
            control={control}
            render={({ field }) => (
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <SelectTrigger className="h-14 rounded-2xl bg-slate-50 border-transparent focus:ring-0 focus:border-[#6C5DD3] data-[state=open]:border-[#6C5DD3]">
                  <div className="flex items-center gap-3 text-slate-700">
                    <GraduationCap className="w-5 h-5 text-[#6C5DD3]" />
                    <SelectValue placeholder="Select University" />
                  </div>
                </SelectTrigger>
                <SelectContent className="rounded-xl border-none shadow-xl">
                  {UNIVERSITIES.map((u) => <SelectItem key={u} value={u} className="rounded-lg my-1 cursor-pointer">{u}</SelectItem>)}
                </SelectContent>
              </Select>
            )}
          />
          {errors.university && <p className="text-xs text-red-500 font-bold ml-2">{errors.university.message}</p>}
        </div>

        {/* Student ID */}
        <div className="space-y-2">
          <Label className="text-slate-600 font-bold ml-1">Student ID</Label>
          <div className="relative">
            <Hash className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <Input {...register("studentId")} className="pl-12 h-14 rounded-2xl bg-slate-50 border-transparent focus:bg-white focus:border-[#6C5DD3] focus:ring-0 transition-all font-medium" placeholder="e.g. 2025001" />
          </div>
          {errors.studentId && <p className="text-xs text-red-500 font-bold ml-2">{errors.studentId.message}</p>}
        </div>

        {/* Degree */}
        <div className="space-y-2">
          <Label className="text-slate-600 font-bold ml-1">Degree Program</Label>
          <Controller
            name="degree"
            control={control}
            render={({ field }) => (
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <SelectTrigger className="h-14 rounded-2xl bg-slate-50 border-transparent focus:ring-0 focus:border-[#6C5DD3]">
                  <div className="flex items-center gap-3 text-slate-700">
                    <BookOpen className="w-5 h-5 text-[#6C5DD3]" />
                    <SelectValue placeholder="Select Degree" />
                  </div>
                </SelectTrigger>
                <SelectContent className="rounded-xl border-none shadow-xl">
                  {DEGREES.map((d) => <SelectItem key={d} value={d} className="rounded-lg my-1 cursor-pointer">{d}</SelectItem>)}
                </SelectContent>
              </Select>
            )}
          />
          {errors.degree && <p className="text-xs text-red-500 font-bold ml-2">{errors.degree.message}</p>}
        </div>

        {/* GPA & Year */}
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
