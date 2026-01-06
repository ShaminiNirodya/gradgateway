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
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      onSubmit={handleSubmit(onNext)} 
      className="space-y-6"
    >
      <div className="space-y-5">
        
        {/* University Selection (Custom Select) */}
        <div className="space-y-2">
          <Label className="text-slate-700 font-medium">University</Label>
          <Controller
            name="university"
            control={control}
            render={({ field }) => (
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <SelectTrigger className="h-11 border-slate-200 bg-slate-50/50 focus:ring-violet-500 hover:border-violet-300 transition-colors">
                  <div className="flex items-center gap-2 text-slate-600">
                    <GraduationCap className="w-4 h-4 text-violet-500" />
                    <SelectValue placeholder="Select your university" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  {UNIVERSITIES.map((uni) => (
                    <SelectItem key={uni} value={uni}>{uni}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.university && <p className="text-xs text-red-500 font-medium ml-1">{errors.university.message}</p>}
        </div>

        {/* Student ID */}
        <div className="space-y-2">
          <Label className="text-slate-700 font-medium">Student Registration ID</Label>
          <div className="relative group">
            <Hash className="absolute left-3 top-3 h-5 w-5 text-slate-400 group-focus-within:text-violet-500 transition-colors" />
            <Input 
              id="studentId" 
              {...register("studentId")} 
              className="pl-10 h-11 border-slate-200 bg-slate-50/50 focus:border-violet-500 transition-all" 
              placeholder="e.g. 2025001" 
            />
          </div>
          {errors.studentId && <p className="text-xs text-red-500 font-medium ml-1">{errors.studentId.message}</p>}
        </div>

        {/* Degree Program (Custom Select) */}
        <div className="space-y-2">
          <Label className="text-slate-700 font-medium">Degree Program</Label>
          <Controller
            name="degree"
            control={control}
            render={({ field }) => (
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <SelectTrigger className="h-11 border-slate-200 bg-slate-50/50 focus:ring-violet-500 hover:border-violet-300 transition-colors">
                  <div className="flex items-center gap-2 text-slate-600">
                    <BookOpen className="w-4 h-4 text-violet-500" />
                    <SelectValue placeholder="Select degree program" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  {DEGREES.map((deg) => (
                    <SelectItem key={deg} value={deg}>{deg}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.degree && <p className="text-xs text-red-500 font-medium ml-1">{errors.degree.message}</p>}
        </div>

        {/* GPA & Year Row */}
        <div className="grid grid-cols-2 gap-5">
          <div className="space-y-2">
            <Label className="text-slate-700 font-medium">Current GPA</Label>
            <div className="relative group">
                <Award className="absolute left-3 top-3 h-5 w-5 text-slate-400 group-focus-within:text-violet-500 transition-colors" />
                <Input 
                  id="gpa" 
                  {...register("gpa")} 
                  className="pl-10 h-11 border-slate-200 bg-slate-50/50 focus:border-violet-500 transition-all"
                  placeholder="e.g. 3.8" 
                  type="number" 
                  step="0.01" 
                />
            </div>
             {errors.gpa && <p className="text-xs text-red-500 font-medium ml-1">{errors.gpa.message}</p>}
          </div>

          <div className="space-y-2">
            <Label className="text-slate-700 font-medium">Graduation Year</Label>
            <div className="relative group">
                <Calendar className="absolute left-3 top-3 h-5 w-5 text-slate-400 group-focus-within:text-violet-500 transition-colors" />
                <Input 
                  id="gradYear" 
                  {...register("gradYear")} 
                  className="pl-10 h-11 border-slate-200 bg-slate-50/50 focus:border-violet-500 transition-all"
                  placeholder="e.g. 2026" 
                  type="number" 
                />
            </div>
            {errors.gradYear && <p className="text-xs text-red-500 font-medium ml-1">{errors.gradYear.message}</p>}
          </div>
        </div>
      </div>

      <div className="flex gap-4 pt-6">
        <Button 
            type="button" 
            variant="outline" 
            onClick={onBack} 
            className="w-1/3 h-11 text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-slate-900"
        >
          Back
        </Button>
        <Button 
            type="submit" 
            className="w-2/3 h-11 bg-violet-600 hover:bg-violet-700 text-white shadow-lg shadow-violet-200 hover:shadow-violet-300 transition-all"
        >
          Next: Security
        </Button>
      </div>
    </motion.form>
  );
}
