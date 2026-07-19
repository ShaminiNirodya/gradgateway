"use client";

import { Camera, ImagePlus } from "lucide-react";
import { cn } from "@/lib/utils";

type PhotoUploadFieldProps = {
  preview: string | null;
  label: string;
  hint?: string;
  shape?: "circle" | "square";
  accent?: "student" | "company";
  onPick: () => void;
};

export default function PhotoUploadField({
  preview,
  label,
  hint = "PNG or JPG · max 2MB · optional",
  shape = "circle",
  accent = "student",
  onPick,
}: PhotoUploadFieldProps) {
  const accentBg = accent === "student" ? "bg-[#6C5DD3]" : "bg-blue-600";
  const accentHover = accent === "student" ? "group-hover:text-[#6C5DD3]" : "group-hover:text-blue-600";
  const accentRing = accent === "student" ? "group-hover:ring-[#6C5DD3]/30" : "group-hover:ring-blue-500/30";

  return (
    <div className="mb-8 flex flex-col items-center">
      <button
        type="button"
        onClick={onPick}
        className="group relative cursor-pointer outline-none"
        aria-label={label}
      >
        <div
          className={cn(
            "flex h-28 w-28 items-center justify-center overflow-hidden border-4 border-white bg-slate-50 shadow-lg ring-4 ring-transparent transition-all",
            shape === "circle" ? "rounded-full" : "rounded-2xl",
            accentRing,
            "group-hover:bg-slate-100 group-hover:shadow-xl"
          )}
        >
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={preview} alt="" className="h-full w-full object-cover" />
          ) : (
            <Camera className={cn("h-10 w-10 text-slate-300 transition-colors", accentHover)} />
          )}
        </div>
        <div
          className={cn(
            "absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full border-2 border-white text-white shadow-sm",
            accentBg
          )}
        >
          <ImagePlus className="h-4 w-4" />
        </div>
      </button>
      <span className="mt-3 text-sm font-bold text-slate-700">{label}</span>
      <span className="mt-1 text-xs font-medium text-slate-400">{hint}</span>
    </div>
  );
}
