"use client";

import { useEffect, useMemo, useState } from "react";
import { Search, LayoutGrid, Download } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/components/ui/toast";
import Link from "next/link";
import { AuthService } from "@/lib/services/auth.service";
import { StudentService } from "@/lib/services/student.service";

type Candidate = {
  id: string;
  name: string;
  university: string;
  classOf: number;
  gpa: number;
  skills: string[];
  project: string;
  status: "Available for Internship" | "Open to Opportunities" | "Available Immediately";
};

export default function TalentSearchPage() {
  const { show } = useToast();
  const [query, setQuery] = useState("");
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [selectedUniversities, setSelectedUniversities] = useState<Set<string>>(new Set());
  const [yearFrom, setYearFrom] = useState<string>("");
  const [yearTo, setYearTo] = useState<string>("");
  const [gpaFrom, setGpaFrom] = useState<string>("");
  const [gpaTo, setGpaTo] = useState<string>("");
  const [skills, setSkills] = useState<Set<string>>(new Set());
  const [availability, setAvailability] = useState<Set<string>>(new Set());
  const [sortKey, setSortKey] = useState<"Relevance" | "GPA" | "Class">("Relevance");
  const [gridView, setGridView] = useState(true);
  const [page, setPage] = useState(1);
  const pageSize = 6;

  useEffect(() => {
    const load = async () => {
      try {
        const token = await AuthService.getIdToken();
        if (!token) {
          setCandidates([]);
          return;
        }

        const rows = await StudentService.getStudentDirectory(token);
        const currentYear = new Date().getFullYear();

        setCandidates(rows.map((row) => {
          const gradYear = Number(row.gradYear);
          const skillList = row.skills
            ? row.skills.split(",").map((item) => item.trim()).filter(Boolean)
            : [];

          const status: Candidate["status"] =
            gradYear <= currentYear
              ? "Open to Opportunities"
              : gradYear === currentYear + 1
                ? "Available for Internship"
                : "Available Immediately";

          return {
            id: row.studentProfileId,
            name: row.fullName,
            university: row.university,
            classOf: gradYear,
            gpa: Number(row.gpa),
            skills: skillList,
            project: row.degree || "Student Portfolio",
            status,
          };
        }));
      } catch {
        setCandidates([]);
      }
    };

    load();
  }, []);

  const allUniversities = useMemo(
    () => Array.from(new Set(candidates.map((candidate) => candidate.university))).sort(),
    [candidates]
  );

  const allSkills = useMemo(
    () => Array.from(new Set(candidates.flatMap((candidate) => candidate.skills))).sort(),
    [candidates]
  );

  const filtered = useMemo(() => {
    let list = candidates.filter((candidate) => {
      const matchesQuery =
        !query ||
        candidate.name.toLowerCase().includes(query.toLowerCase()) ||
        candidate.skills.join(" ").toLowerCase().includes(query.toLowerCase()) ||
        candidate.project.toLowerCase().includes(query.toLowerCase());

      const matchesUniversity = selectedUniversities.size === 0 || selectedUniversities.has(candidate.university);
      const matchesYear = (!yearFrom || candidate.classOf >= Number(yearFrom)) && (!yearTo || candidate.classOf <= Number(yearTo));
      const matchesGpa = (!gpaFrom || candidate.gpa >= Number(gpaFrom)) && (!gpaTo || candidate.gpa <= Number(gpaTo));
      const matchesSkill = skills.size === 0 || candidate.skills.some((skill) => skills.has(skill));
      const matchesAvailability = availability.size === 0 || availability.has(candidate.status);

      return matchesQuery && matchesUniversity && matchesYear && matchesGpa && matchesSkill && matchesAvailability;
    });

    list = [...list].sort((a, b) => {
      if (sortKey === "GPA") return b.gpa - a.gpa;
      if (sortKey === "Class") return b.classOf - a.classOf;
      return 0;
    });

    return list;
  }, [availability, candidates, gpaFrom, gpaTo, query, selectedUniversities, skills, sortKey, yearFrom, yearTo]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageItems = filtered.slice((page - 1) * pageSize, page * pageSize);

  const clearFilters = () => {
    setSelectedUniversities(new Set());
    setYearFrom("");
    setYearTo("");
    setGpaFrom("");
    setGpaTo("");
    setSkills(new Set());
    setAvailability(new Set());
    setSortKey("Relevance");
    setPage(1);
  };

  const exportCSV = () => {
    if (filtered.length === 0) {
      show({ title: "No data", description: "No candidates to export", variant: "error" });
      return;
    }

    // CSV headers
    const headers = ["Name", "University", "Class Of", "GPA", "Skills", "Project", "Status"];
    
    // CSV rows
    const rows = filtered.map(candidate => [
      candidate.name,
      candidate.university,
      candidate.classOf.toString(),
      candidate.gpa.toString(),
      candidate.skills.join("; "),
      candidate.project,
      candidate.status
    ]);

    // Combine headers and rows
    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `talent-results-${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    show({ title: "Exported", description: "Results saved as CSV", variant: "success" });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
      <aside className="lg:col-span-1 bg-white rounded-[24px] p-6 shadow-sm lg:sticky lg:top-24">
        <h3 className="font-bold text-slate-800 mb-4">Filters</h3>

        <Section title="University">
          {allUniversities.map((university) => (
            <FilterRow
              key={university}
              label={university}
              checked={selectedUniversities.has(university)}
              onChange={(value: boolean) => toggleSet(setSelectedUniversities, selectedUniversities, university, !!value)}
            />
          ))}
        </Section>

        <Section title="Graduation Year">
          <div className="grid grid-cols-2 gap-2">
            <Input value={yearFrom} onChange={(event) => setYearFrom(event.target.value)} placeholder="From" className="h-9" />
            <Input value={yearTo} onChange={(event) => setYearTo(event.target.value)} placeholder="To" className="h-9" />
          </div>
        </Section>

        <Section title="GPA Range">
          <div className="grid grid-cols-2 gap-2">
            <Input value={gpaFrom} onChange={(event) => setGpaFrom(event.target.value)} placeholder="2.0" className="h-9" />
            <Input value={gpaTo} onChange={(event) => setGpaTo(event.target.value)} placeholder="4.0" className="h-9" />
          </div>
        </Section>

        <Section title="Skills">
          {allSkills.map((skill) => (
            <FilterRow
              key={skill}
              label={skill}
              checked={skills.has(skill)}
              onChange={(value: boolean) => toggleSet(setSkills, skills, skill, !!value)}
            />
          ))}
        </Section>

        <Section title="Availability">
          {["Available Immediately", "Available for Internship", "Open to Opportunities"].map((label) => (
            <FilterRow
              key={label}
              label={label}
              checked={availability.has(label)}
              onChange={(value: boolean) => toggleSet(setAvailability, availability, label, !!value)}
            />
          ))}
        </Section>

        <Button variant="ghost" className="w-full mt-2" onClick={clearFilters}>Clear All Filters</Button>
      </aside>

      <main className="lg:col-span-3 space-y-6">
        <div className="flex items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <Input value={query} onChange={(event) => setQuery(event.target.value)} className="h-12 pl-12 rounded-xl bg-white border-none shadow-sm" />
          </div>
          <Button variant="ghost" onClick={() => setGridView((value) => !value)}>
            <LayoutGrid className="w-4 h-4 mr-2" />
            {gridView ? "Grid" : "List"}
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button>
                <Download className="w-4 h-4 mr-2" /> Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-white">
              <DropdownMenuItem onClick={exportCSV}>Export CSV</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <p className="text-xs text-slate-400">Showing {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, filtered.length)} of {filtered.length} results</p>

        {gridView ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {pageItems.length === 0 ? (
              <div className="col-span-full bg-white rounded-2xl p-10 text-center shadow-sm">
                <p className="text-slate-700 font-bold">No candidates match your filters</p>
              </div>
            ) : (
              pageItems.map((candidate) => <CandidateCard key={candidate.id} c={candidate} />)
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {pageItems.map((candidate) => (
              <div key={candidate.id} className="bg-white rounded-[18px] p-4 shadow-sm flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-800 text-sm">{candidate.name}</h3>
                  <p className="text-xs text-slate-500">{candidate.university} • Class {candidate.classOf} • GPA {candidate.gpa.toFixed(2)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button asChild variant="outline" size="sm"><Link href={`/dashboard/company/student-dashboard/${encodeURIComponent(candidate.name.toLowerCase().replace(/\s+/g, "-"))}?id=${candidate.id}`}>View Profile</Link></Button>
                  <Button asChild size="sm"><Link href={`/dashboard/company/messages?studentProfileId=${encodeURIComponent(candidate.id)}`}>Message</Link></Button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between">
          <Button variant="ghost" disabled={page === 1} onClick={() => setPage((current) => Math.max(1, current - 1))}>Previous</Button>
          <div className="flex items-center gap-2">
            {Array.from({ length: totalPages }).map((_, index) => (
              <button key={index} onClick={() => setPage(index + 1)} className={`w-9 h-9 rounded-xl text-sm font-bold ${page === index + 1 ? "bg-[#6C5DD3] text-white" : "bg-white text-slate-700"}`}>{index + 1}</button>
            ))}
          </div>
          <Button variant="ghost" disabled={page === totalPages} onClick={() => setPage((current) => Math.min(totalPages, current + 1))}>Next</Button>
        </div>
      </main>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-6">
      <h4 className="text-sm font-bold text-slate-800 mb-3">{title}</h4>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function FilterRow({ label, checked, onChange }: { label: string; checked?: boolean; onChange?: (v: boolean) => void }) {
  return (
    <label className="flex items-center gap-2 text-sm text-slate-600">
      <Checkbox className="w-4 h-4" checked={checked} onCheckedChange={onChange} /> {label}
    </label>
  );
}

function CandidateCard({ c }: { c: Candidate }) {
  return (
    <div className="bg-white rounded-[24px] shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden group border border-slate-100 hover:border-indigo-100 flex flex-col h-full">
      <div className="h-24 bg-gradient-to-r from-[#6C5DD3] via-indigo-500 to-[#6C5DD3] opacity-10 group-hover:opacity-20 transition-opacity" />
      <div className="px-6 pb-6 -mt-10 flex flex-col flex-1">
        <div className="flex justify-between items-start mb-4">
          <Avatar className="h-20 w-20 border-4 border-white shadow-md">
            <AvatarFallback className="bg-indigo-50 text-[#6C5DD3] text-xl font-bold">
              {c.name.split(" ").map((name) => name[0]).join("")}
            </AvatarFallback>
          </Avatar>
          <span className="inline-block px-2 py-1 rounded-lg text-[10px] font-bold bg-indigo-50 text-indigo-600">{c.status}</span>
        </div>

        <div className="mb-4">
          <h3 className="font-bold text-slate-800 text-lg group-hover:text-[#6C5DD3] transition-colors">{c.name}</h3>
          <p className="text-sm text-slate-500 font-medium">{c.university}</p>
          <p className="text-xs text-slate-400 mt-1">Class of {c.classOf} • GPA {c.gpa.toFixed(2)}</p>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          {c.skills.slice(0, 3).map((skill) => (
            <span key={skill} className="inline-block px-2 py-1 rounded-lg bg-slate-100 text-slate-700 text-[10px] font-bold">{skill}</span>
          ))}
        </div>

        <div className="mt-auto grid grid-cols-2 gap-3">
          <Button asChild variant="outline">
            <Link href={`/dashboard/company/messages?studentProfileId=${encodeURIComponent(c.id)}`}>Message</Link>
          </Button>
          <Button asChild>
            <Link href={`/dashboard/company/student-dashboard/${encodeURIComponent(c.name.toLowerCase().replace(/\s+/g, "-"))}?id=${c.id}`}>View Profile</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

function toggleSet<T>(setFn: (s: Set<T>) => void, current: Set<T>, item: T, enabled: boolean) {
  const next = new Set(current);
  if (enabled) next.add(item);
  else next.delete(item);
  setFn(next);
}
