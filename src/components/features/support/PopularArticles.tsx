"use client";

import Link from "next/link";
import { useState } from "react";
import { ChevronDown, FileText } from "lucide-react";
import { HelpArticle, HelpAudience } from "@/lib/content/help-articles";
import { cn } from "@/lib/utils";

export function PopularArticles({
  articles,
  audience = "All",
}: {
  articles: HelpArticle[];
  audience?: HelpAudience;
}) {
  const [openId, setOpenId] = useState<string | null>(articles[0]?.id ?? null);

  if (articles.length === 0) {
    return (
      <p className="rounded-xl bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
        No articles available for this section.
      </p>
    );
  }

  return (
    <ul className="space-y-2">
      {articles.map((article, index) => {
        const isOpen = openId === article.id;
        return (
          <li key={article.id}>
            <button
              type="button"
              onClick={() => setOpenId(isOpen ? null : article.id)}
              className={cn(
                "flex w-full items-center gap-3 rounded-xl border px-3 py-3 text-left transition-all",
                isOpen
                  ? "border-[#6C5DD3]/30 bg-[#6C5DD3]/5 shadow-sm"
                  : "border-transparent bg-slate-50/80 hover:border-slate-200 hover:bg-slate-50"
              )}
              aria-expanded={isOpen}
            >
              <span
                className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold",
                  isOpen ? "bg-[#6C5DD3] text-white" : "bg-white text-[#6C5DD3] shadow-sm"
                )}
              >
                {index + 1}
              </span>
              <span
                className={cn(
                  "min-w-0 flex-1 text-sm font-semibold",
                  isOpen ? "text-[#5b4ec4]" : "text-slate-800"
                )}
              >
                {article.title}
              </span>
              <ChevronDown
                className={cn(
                  "h-4 w-4 shrink-0 text-slate-400 transition-transform",
                  isOpen && "rotate-180 text-[#6C5DD3]"
                )}
              />
            </button>
            {isOpen && (
              <div className="mx-1 mb-2 mt-2 rounded-xl border border-slate-100 bg-white p-4 text-sm text-slate-600 shadow-sm">
                <div className="mb-3 flex items-start gap-2">
                  <FileText className="mt-0.5 h-4 w-4 shrink-0 text-[#6C5DD3]" />
                  <p className="font-medium leading-relaxed text-slate-700">{article.summary}</p>
                </div>
                <ol className="space-y-2.5 border-l-2 border-[#6C5DD3]/20 pl-4">
                  {article.steps.map((step, stepIdx) => (
                    <li key={step} className="relative leading-relaxed">
                      <span className="absolute -left-[1.35rem] top-2 h-1.5 w-1.5 rounded-full bg-[#6C5DD3]/60" />
                      <span className="text-slate-600">{step}</span>
                    </li>
                  ))}
                </ol>
                {(() => {
                  const link =
                    article.relatedLinks?.[audience] ?? article.relatedLinks?.All;
                  if (!link) return null;
                  return (
                    <Link
                      href={link.href}
                      className="mt-4 inline-flex items-center rounded-lg bg-[#6C5DD3]/10 px-3 py-2 text-sm font-bold text-[#6C5DD3] transition hover:bg-[#6C5DD3]/15"
                    >
                      {link.label} →
                    </Link>
                  );
                })()}
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
