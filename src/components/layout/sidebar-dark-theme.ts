/** Soft dark sidebar — lighter charcoal, not near-black. Main content stays light. */
export const darkSidebar = {
  shell:
    "flex h-full w-72 flex-col overflow-y-auto border-r border-slate-600/40 bg-[#243b53] p-6",//
  sectionLabel: "mb-4 px-4 text-xs font-bold uppercase tracking-wider text-slate-400",
  wordmark: "text-2xl text-slate-100",
  wordmarkAccent: "text-sm font-bold text-slate-400",
  navActive: "bg-[#6C5DD3] text-white shadow-md shadow-[#6C5DD3]/20",
  navInactive: "text-slate-300 hover:bg-slate-600/50 hover:text-white",
  badgeRing: "ring-[#243b53]",//
  badgeRingActive: "ring-[#6C5DD3]",
  helpCard:
    "mx-2 mt-6 rounded-2xl border border-slate-500/30 bg-slate-600/25 p-4",
  helpIcon:
    "flex h-8 w-8 items-center justify-center rounded-lg bg-slate-600/60 text-[#c4b8fd]",
  helpTitle: "text-sm font-bold text-slate-100",
  helpSubtitle: "text-[11px] font-medium text-slate-400",
  helpButton:
    "h-9 w-full rounded-xl bg-slate-600/70 text-[#ddd6fe] shadow-sm hover:bg-slate-500/80 hover:text-white",
  logout:
    "flex items-center gap-3 px-4 py-3 font-semibold text-slate-400 transition-colors hover:text-red-400",
  inquiryBadge: "bg-amber-400/15 text-amber-200",
} as const;
