"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";

export function AdminStatCards({
  items,
  columns = 4,
}: {
  items: Array<{ label: string; value: string | number; href?: string; highlight?: boolean }>;
  columns?: 2 | 3 | 4 | 6;
}) {
  const gridClass =
    columns === 6
      ? "lg:grid-cols-6 md:grid-cols-3"
      : columns === 4
        ? "lg:grid-cols-4 md:grid-cols-2"
        : columns === 3
          ? "md:grid-cols-3"
          : "md:grid-cols-2";

  return (
    <div className={cn("grid grid-cols-1 gap-4", gridClass)}>
      {items.map((item) => {
        const inner = (
          <>
            <p className="text-xs text-slate-400">{item.label}</p>
            <h3
              className={cn(
                "font-bold text-slate-800",
                columns === 6 ? "text-lg" : "text-2xl"
              )}
            >
              {item.value}
            </h3>
          </>
        );

        const className = cn(
          "rounded-[18px] bg-white p-4 shadow-sm",
          item.href && "transition-shadow hover:shadow-md",
          item.highlight && "ring-2 ring-amber-200"
        );

        if (item.href) {
          return (
            <Link key={item.label} href={item.href} className={className}>
              {inner}
            </Link>
          );
        }

        return (
          <div key={item.label} className={className}>
            {inner}
          </div>
        );
      })}
    </div>
  );
}
