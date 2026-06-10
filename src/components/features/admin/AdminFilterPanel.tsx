import { cn } from "@/lib/utils";

export function AdminFilterPanel({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-3 rounded-[18px] border border-slate-100 bg-white p-4 shadow-sm",
        className
      )}
    >
      {children}
    </div>
  );
}
