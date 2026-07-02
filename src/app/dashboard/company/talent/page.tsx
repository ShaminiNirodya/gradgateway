"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  Search,
  LayoutGrid,
  List as ListIcon,
  Download,
  X,
  SlidersHorizontal,
  Sparkles,
  FileText,
  MessageSquare,
  UserRound,
  GraduationCap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/components/ui/toast";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CompanyPageHeader } from "@/components/layout/company/CompanyPageHeader";
import { AuthService } from "@/lib/services/auth.service";
import { StudentService } from "@/lib/services/student.service";
import {
  ALL_UNIVERSITIES,
  ALL_DEGREES,
  getDegreesForUniversity,
  getUniversitiesForDegree,
  normalizeDegreeName,
} from "@/lib/constants/university-degrees";
import {
  FIELDS_OF_MAJOR,
  getDegreesForFieldOfMajor,
  resolveFieldOfMajorLabel,
  type FieldOfMajorId,
} from "@/lib/constants/field-of-major";
import { SkillsPicker } from "@/components/shared/SkillsPicker";
import {
  GRADUATION_YEARS,
} from "@/lib/constants/academic-options";
import {
  SELECT_UNSET,
  fromControlledSelectValue,
  toControlledSelectValue,
} from "@/lib/utils/controlled-select";

type Candidate = {
  id: string;
  name: string;
  university: string;
  degree: string;
  fieldOfMajor: string;
  classOf: number;
  gpa: number;
  skills: string[];
  status: string;
  photoDataUrl?: string;
  cvUrl?: string;
};

export default function TalentSearchPage() {
  const { show } = useToast();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState("");
  const [pageItems, setPageItems] = useState<Candidate[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedUniversities, setSelectedUniversities] = useState<Set<string>>(new Set());
  const [selectedFieldsOfMajor, setSelectedFieldsOfMajor] = useState<Set<FieldOfMajorId>>(new Set());
  const [selectedDegrees, setSelectedDegrees] = useState<Set<string>>(new Set());
  const [graduationYear, setGraduationYear] = useState<string>("");
  const [gpaFrom, setGpaFrom] = useState<string>("");
  const [gpaTo, setGpaTo] = useState<string>("");
  const [skills, setSkills] = useState<Set<string>>(new Set());
  const [availability, setAvailability] = useState<Set<string>>(new Set());
  const [sortKey, setSortKey] = useState<"Relevance" | "GPA" | "Class">("Relevance");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [page, setPage] = useState(1);
  const pageSize = 6;
  const [universitySearch, setUniversitySearch] = useState("");
  const [degreeSearch, setDegreeSearch] = useState("");
  const [isUniversityDropdownOpen, setIsUniversityDropdownOpen] = useState(false);
  const [isFieldOfMajorDropdownOpen, setIsFieldOfMajorDropdownOpen] = useState(false);
  const [isDegreeDropdownOpen, setIsDegreeDropdownOpen] = useState(false);

  useEffect(() => {
    const qParam = searchParams.get("q");
    if (qParam) setQuery(qParam);
  }, [searchParams]);

  // Dynamic filtering based on selections
  const availableDegrees = useMemo(() => {
    let degrees: string[];
    if (selectedUniversities.size === 0) {
      degrees = [...ALL_DEGREES];
    } else {
      const degreesSet = new Set<string>();
      selectedUniversities.forEach((uni) => {
        getDegreesForUniversity(uni).forEach((d) => degreesSet.add(d));
      });
      degrees = Array.from(degreesSet);
    }
    if (selectedFieldsOfMajor.size > 0) {
      const fieldDegrees = new Set<string>();
      selectedFieldsOfMajor.forEach((fieldId) => {
        getDegreesForFieldOfMajor(fieldId).forEach((d) => fieldDegrees.add(d));
      });
      degrees = degrees.filter((d) => fieldDegrees.has(d));
    }
    return degrees.sort();
  }, [selectedUniversities, selectedFieldsOfMajor]);

  const availableUniversities = useMemo(() => {
    if (selectedDegrees.size > 0) {
      const universitiesSet = new Set<string>();
      selectedDegrees.forEach((degree) => {
        getUniversitiesForDegree(degree).forEach((u) => universitiesSet.add(u));
      });
      return Array.from(universitiesSet).sort();
    }
    if (selectedFieldsOfMajor.size > 0) {
      const universitiesSet = new Set<string>();
      selectedFieldsOfMajor.forEach((fieldId) => {
        getDegreesForFieldOfMajor(fieldId).forEach((degree) => {
          getUniversitiesForDegree(degree).forEach((u) => universitiesSet.add(u));
        });
      });
      return Array.from(universitiesSet).sort();
    }
    return ALL_UNIVERSITIES;
  }, [selectedDegrees, selectedFieldsOfMajor]);

  const effectiveDegrees = useMemo(() => {
    let degrees: string[] = [];
    if (selectedFieldsOfMajor.size > 0) {
      const fieldDegrees = new Set<string>();
      selectedFieldsOfMajor.forEach((fieldId) => {
        getDegreesForFieldOfMajor(fieldId).forEach((d) => fieldDegrees.add(d));
      });
      degrees = Array.from(fieldDegrees);
    }
    if (selectedDegrees.size > 0) {
      const picked = Array.from(selectedDegrees);
      degrees = degrees.length > 0 ? degrees.filter((d) => selectedDegrees.has(d)) : picked;
    }
    return degrees;
  }, [selectedFieldsOfMajor, selectedDegrees]);

  const mapDirectoryToCandidate = (row: {
    studentProfileId: string;
    fullName: string;
    university: string;
    degree: string;
    fieldOfMajor: string;
    gradYear: number;
    gpa: number;
    skills: string;
    availability: string;
    photoDataUrl?: string;
    cvUrl?: string;
  }): Candidate => {
    const skillList = row.skills
      ? row.skills.split(",").map((item) => item.trim()).filter(Boolean)
      : [];

    return {
      id: row.studentProfileId,
      name: row.fullName,
      university: row.university,
      degree: normalizeDegreeName(row.degree),
      fieldOfMajor: row.fieldOfMajor || "",
      classOf: Number(row.gradYear),
      gpa: Number(row.gpa),
      skills: skillList,
      status: row.availability || "Available Now",
      photoDataUrl: row.photoDataUrl,
      cvUrl: row.cvUrl,
    };
  };

  useEffect(() => {
    setPage(1);
  }, [
    query,
    selectedUniversities,
    selectedFieldsOfMajor,
    selectedDegrees,
    graduationYear,
    gpaFrom,
    gpaTo,
    skills,
    availability,
    sortKey,
  ]);

  useEffect(() => {
    let cancelled = false;
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const token = await AuthService.getIdToken();
        if (!token) {
          if (!cancelled) {
            setPageItems([]);
            setTotalCount(0);
            setTotalPages(0);
          }
          return;
        }

        const minGpa = gpaFrom.trim() === "" ? undefined : Number(gpaFrom);
        const maxGpa = gpaTo.trim() === "" ? undefined : Number(gpaTo);

        const result = await StudentService.searchStudentDirectory(token, {
          q: query.trim() || undefined,
          universities:
            selectedUniversities.size > 0 ? Array.from(selectedUniversities) : undefined,
          degrees: effectiveDegrees.length > 0 ? effectiveDegrees : undefined,
          gradYear: graduationYear ? Number(graduationYear) : undefined,
          gpaMin: minGpa != null && !Number.isNaN(minGpa) ? minGpa : undefined,
          gpaMax: maxGpa != null && !Number.isNaN(maxGpa) ? maxGpa : undefined,
          skills: skills.size > 0 ? Array.from(skills) : undefined,
          availability: availability.size > 0 ? Array.from(availability) : undefined,
          sort: sortKey,
          page,
          pageSize,
        });

        if (cancelled) return;

        setPageItems(result.items.map(mapDirectoryToCandidate));
        setTotalCount(result.totalCount);
        setTotalPages(Math.max(1, result.totalPages));
      } catch {
        if (!cancelled) {
          setPageItems([]);
          setTotalCount(0);
          setTotalPages(0);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, 300);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [
    query,
    selectedUniversities,
    effectiveDegrees,
    graduationYear,
    gpaFrom,
    gpaTo,
    skills,
    availability,
    sortKey,
    page,
    pageSize,
  ]);

  const activeFilterCount = useMemo(() => {
    let count =
      selectedUniversities.size +
      selectedFieldsOfMajor.size +
      selectedDegrees.size +
      skills.size +
      availability.size;
    if (graduationYear) count += 1;
    if (gpaFrom || gpaTo) count += 1;
    return count;
  }, [
    selectedUniversities,
    selectedFieldsOfMajor,
    selectedDegrees,
    skills,
    availability,
    graduationYear,
    gpaFrom,
    gpaTo,
  ]);

  const clearFilters = () => {
    setSelectedUniversities(new Set());
    setSelectedFieldsOfMajor(new Set());
    setSelectedDegrees(new Set());
    setGraduationYear("");
    setGpaFrom("");
    setGpaTo("");
    setSkills(new Set());
    setAvailability(new Set());
    setSortKey("Relevance");
    setPage(1);
  };

  const exportCSV = async () => {
    if (totalCount === 0) {
      show({ title: "No data", description: "No candidates to export", variant: "error" });
      return;
    }

    try {
      const token = await AuthService.getIdToken();
      if (!token) return;

      const minGpa = gpaFrom.trim() === "" ? undefined : Number(gpaFrom);
      const maxGpa = gpaTo.trim() === "" ? undefined : Number(gpaTo);

      const result = await StudentService.searchStudentDirectory(token, {
        q: query.trim() || undefined,
        universities:
          selectedUniversities.size > 0 ? Array.from(selectedUniversities) : undefined,
        degrees: effectiveDegrees.length > 0 ? effectiveDegrees : undefined,
        gradYear: graduationYear ? Number(graduationYear) : undefined,
        gpaMin: minGpa != null && !Number.isNaN(minGpa) ? minGpa : undefined,
        gpaMax: maxGpa != null && !Number.isNaN(maxGpa) ? maxGpa : undefined,
        skills: skills.size > 0 ? Array.from(skills) : undefined,
        availability: availability.size > 0 ? Array.from(availability) : undefined,
        sort: sortKey,
        page: 1,
        pageSize: 100,
      });

      const exportRows = result.items.map(mapDirectoryToCandidate);
      if (exportRows.length === 0) {
        show({ title: "No data", description: "No candidates to export", variant: "error" });
        return;
      }

    // CSV headers
    const headers = ["Name", "University", "Field of Major", "Degree", "Class Of", "GPA", "Skills", "Status"];
    
    const rows = exportRows.map(candidate => [
      candidate.name,
      candidate.university,
      resolveFieldOfMajorLabel(candidate.fieldOfMajor, candidate.degree),
      candidate.degree,
      candidate.classOf.toString(),
      candidate.gpa.toString(),
      candidate.skills.join("; "),
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
    } catch {
      show({ title: "Export failed", description: "Could not export results.", variant: "error" });
    }
  };

  const filterTriggerClass =
    "w-full min-h-9 h-auto py-1.5 justify-start text-left font-normal rounded-lg border-slate-200 text-sm shadow-none";

  return (
    <div className="space-y-6">
      <CompanyPageHeader
        eyebrow="Find talent"
        title="Talent Search"
        subtitle="Discover graduates and filter by university, skills, and availability"
        showSearch={false}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(260px,300px)_1fr]">
      <aside className="rounded-2xl border border-slate-200/80 bg-white p-5 lg:sticky lg:top-20 lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto">
        <div className="mb-5 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4 text-slate-500" />
            <h3 className="text-sm font-bold text-slate-800">Filters</h3>
          </div>
          {activeFilterCount > 0 && (
            <span className="rounded-full bg-[#6C5DD3]/10 px-2 py-0.5 text-xs font-semibold text-[#6C5DD3]">
              {activeFilterCount} active
            </span>
          )}
        </div>

        <Section title="University">
          <DropdownMenu open={isUniversityDropdownOpen} onOpenChange={setIsUniversityDropdownOpen}>
            <DropdownMenuTrigger asChild>
              <Button type="button" variant="outline" className={filterTriggerClass}>
                <FilterMultiSelectChips
                  placeholder="Select universities..."
                  items={Array.from(selectedUniversities).map((uni) => ({ key: uni, label: uni }))}
                  onRemove={(key) => toggleSet(setSelectedUniversities, selectedUniversities, key, false)}
                />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-[min(320px,100vw)] rounded-xl border border-slate-200 bg-white p-0 shadow-lg">
              <div className="sticky top-0 bg-white border-b border-slate-100 p-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    type="text"
                    placeholder="Search universities..."
                    value={universitySearch}
                    onChange={(e) => setUniversitySearch(e.target.value)}
                    onKeyDown={(e) => e.stopPropagation()}
                    onMouseDown={(e) => e.stopPropagation()}
                    className="pl-9 h-9 rounded-lg border-slate-200"
                  />
                </div>
              </div>
              <div className="max-h-60 overflow-y-auto p-2">
                {availableUniversities
                  .filter(u => u.toLowerCase().includes(universitySearch.toLowerCase()))
                  .map((university) => (
                    <label
                      key={university}
                      className="flex cursor-pointer items-center gap-2 rounded-md p-2 text-sm hover:bg-slate-50"
                    >
                      <Checkbox
                        checked={selectedUniversities.has(university)}
                        onCheckedChange={(checked) => 
                          toggleSet(setSelectedUniversities, selectedUniversities, university, !!checked)
                        }
                      />
                      <span className="text-slate-700">{university}</span>
                    </label>
                  ))}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </Section>

        <Section title="Field of Major">
          <DropdownMenu open={isFieldOfMajorDropdownOpen} onOpenChange={setIsFieldOfMajorDropdownOpen}>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="outline"
                className={filterTriggerClass}
              >
                <FilterMultiSelectChips
                  placeholder="Select fields..."
                  items={Array.from(selectedFieldsOfMajor).map((fieldId) => ({
                    key: fieldId,
                    label: FIELDS_OF_MAJOR.find((f) => f.id === fieldId)?.label ?? fieldId,
                  }))}
                  onRemove={(key) =>
                    toggleSet(setSelectedFieldsOfMajor, selectedFieldsOfMajor, key as FieldOfMajorId, false)
                  }
                />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-[min(320px,100vw)] rounded-xl border border-slate-200 bg-white p-0 shadow-lg">
              <div className="max-h-60 overflow-y-auto p-2">
                {FIELDS_OF_MAJOR.map((field) => (
                  <label
                    key={field.id}
                    className="flex cursor-pointer items-center gap-2 rounded-md p-2 text-sm hover:bg-slate-50"
                  >
                    <Checkbox
                      checked={selectedFieldsOfMajor.has(field.id)}
                      onCheckedChange={(checked) => {
                        toggleSet(setSelectedFieldsOfMajor, selectedFieldsOfMajor, field.id, !!checked);
                        if (!checked) return;
                        const allowed = new Set(getDegreesForFieldOfMajor(field.id));
                        setSelectedDegrees((prev) => {
                          const next = new Set<string>();
                          prev.forEach((d) => {
                            if (allowed.has(d)) next.add(d);
                          });
                          return next;
                        });
                      }}
                    />
                    <span className="text-slate-700">{field.label}</span>
                  </label>
                ))}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </Section>

        <Section title="Degree">
          <DropdownMenu open={isDegreeDropdownOpen} onOpenChange={setIsDegreeDropdownOpen}>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="outline"
                className={filterTriggerClass}
              >
                <FilterMultiSelectChips
                  placeholder="Select degrees..."
                  items={Array.from(selectedDegrees).map((degree) => ({ key: degree, label: degree }))}
                  onRemove={(key) => toggleSet(setSelectedDegrees, selectedDegrees, key, false)}
                />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-[min(320px,100vw)] rounded-xl border border-slate-200 bg-white p-0 shadow-lg">
              <div className="sticky top-0 bg-white border-b border-slate-100 p-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    type="text"
                    placeholder="Search degrees..."
                    value={degreeSearch}
                    onChange={(e) => setDegreeSearch(e.target.value)}
                    onKeyDown={(e) => e.stopPropagation()}
                    onMouseDown={(e) => e.stopPropagation()}
                    className="pl-9 h-9 rounded-lg border-slate-200"
                  />
                </div>
              </div>
              <div className="max-h-60 overflow-y-auto p-2">
                {availableDegrees
                  .filter(d => d.toLowerCase().includes(degreeSearch.toLowerCase()))
                  .map((degree) => (
                    <label
                      key={degree}
                      className="flex cursor-pointer items-center gap-2 rounded-md p-2 text-sm hover:bg-slate-50"
                    >
                      <Checkbox
                        checked={selectedDegrees.has(degree)}
                        onCheckedChange={(checked) => 
                          toggleSet(setSelectedDegrees, selectedDegrees, degree, !!checked)
                        }
                      />
                      <span className="text-slate-700">{degree}</span>
                    </label>
                  ))}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </Section>

        <Section title="Graduation Year">
          <Select
            value={toControlledSelectValue(graduationYear)}
            onValueChange={(val) => setGraduationYear(fromControlledSelectValue(val))}
          >
            <SelectTrigger className="h-9 w-full rounded-lg border-slate-200 text-sm">
              <SelectValue placeholder="Any year" />
            </SelectTrigger>
            <SelectContent className="max-h-60 rounded-xl">
              <SelectItem value={SELECT_UNSET} className="cursor-pointer rounded-lg text-slate-500">
                Any year
              </SelectItem>
              {GRADUATION_YEARS.map((year) => (
                <SelectItem key={year} value={String(year)} className="cursor-pointer rounded-lg">
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Section>

        <Section title="GPA Range">
          <div className="grid grid-cols-2 gap-2">
            <Input
              type="number"
              inputMode="decimal"
              step="0.1"
              min="0"
              max="4"
              value={gpaFrom}
              onChange={(event) => setGpaFrom(event.target.value)}
              placeholder="Min"
              className="h-9 rounded-lg border-slate-200"
            />
            <Input
              type="number"
              inputMode="decimal"
              step="0.1"
              min="0"
              max="4"
              value={gpaTo}
              onChange={(event) => setGpaTo(event.target.value)}
              placeholder="Max"
              className="h-9 rounded-lg border-slate-200"
            />
          </div>
        </Section>

        <Section title="Skills">
          <SkillsPicker
            selected={skills}
            onToggle={(skill) => toggleSet(setSkills, skills, skill, !skills.has(skill))}
            showLabel={false}
            placeholder="Select skills..."
            triggerClassName={filterTriggerClass}
          />
        </Section>

        <Section title="Availability">
          {["Available Now", "Actively Looking", "Open to Offers", "Not Looking"].map((label) => (
            <FilterRow
              key={label}
              label={label}
              checked={availability.has(label)}
              onChange={(value: boolean) => toggleSet(setAvailability, availability, label, !!value)}
            />
          ))}
        </Section>

        <Button
          variant="softSurface"
          className="mt-4 w-full"
          onClick={clearFilters}
          disabled={activeFilterCount === 0}
        >
          Clear all filters
        </Button>
      </aside>

      <main className="min-w-0 space-y-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative min-w-0 flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by name, university, degree, or skill..."
              className="h-11 rounded-xl border-slate-200 bg-white pl-10 shadow-none"
            />
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:justify-end">
            <select
              value={sortKey}
              onChange={(e) => setSortKey(e.target.value as "Relevance" | "GPA" | "Class")}
              className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 outline-none focus:border-[#6C5DD3] focus:ring-1 focus:ring-[#6C5DD3]/30"
              aria-label="Sort candidates"
            >
              <option value="Relevance">Sort: Relevance</option>
              <option value="GPA">Sort: GPA</option>
              <option value="Class">Sort: Class year</option>
            </select>
            <div className="flex gap-1 rounded-xl bg-slate-100 p-1">
              <button
                type="button"
                onClick={() => setView("grid")}
                aria-label="Grid view"
                className={cn(
                  "rounded-lg p-2.5 transition-colors",
                  view === "grid" ? "bg-white text-[#6C5DD3] shadow-sm" : "text-slate-500 hover:text-slate-700"
                )}
              >
                <LayoutGrid className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={() => setView("list")}
                aria-label="List view"
                className={cn(
                  "rounded-lg p-2.5 transition-colors",
                  view === "list" ? "bg-white text-[#6C5DD3] shadow-sm" : "text-slate-500 hover:text-slate-700"
                )}
              >
                <ListIcon className="h-5 w-5" />
              </button>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="h-11 rounded-xl border-slate-200 font-medium">
                  <Download className="mr-2 h-4 w-4" /> Export
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="rounded-xl border border-slate-200 bg-white">
                <DropdownMenuItem onClick={exportCSV}>Export CSV</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
          <p className="font-medium text-slate-600">
            {totalCount === 0
              ? "No results"
              : `Showing ${(page - 1) * pageSize + 1}–${Math.min(page * pageSize, totalCount)} of ${totalCount}`}
          </p>
          {loading && <p className="text-slate-500">Loading candidates…</p>}
        </div>

        {loading ? (
          <div className="rounded-2xl border border-slate-100 bg-white p-12 text-center text-slate-500 shadow-sm">
            Loading candidates…
          </div>
        ) : pageItems.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 px-6 py-16 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-white border border-slate-200">
              <Sparkles className="h-6 w-6 text-slate-400" />
            </div>
            <p className="font-bold text-slate-800">No candidates match your criteria</p>
            <p className="mt-1 text-sm text-slate-500">Adjust filters or clear your search to see more profiles.</p>
            {(activeFilterCount > 0 || query.trim()) && (
              <Button
                variant="outline"
                className="mt-4 rounded-lg"
                onClick={() => {
                  clearFilters();
                  setQuery("");
                }}
              >
                Reset search & filters
              </Button>
            )}
          </div>
        ) : view === "grid" ? (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3">
            {pageItems.map((candidate) => (
              <CandidateCard key={candidate.id} c={candidate} />
            ))}
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white divide-y divide-slate-100">
            {pageItems.map((candidate) => (
              <CandidateListRow key={candidate.id} c={candidate} />
            ))}
          </div>
        )}

        {pageItems.length > 0 && totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-slate-100 pt-4">
            <Button
              variant="outline"
              size="sm"
              className="rounded-lg"
              disabled={page === 1}
              onClick={() => setPage((current) => Math.max(1, current - 1))}
            >
              Previous
            </Button>
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }).map((_, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => setPage(index + 1)}
                  className={cn(
                    "flex h-9 min-w-9 items-center justify-center rounded-lg text-sm font-semibold transition-colors",
                    page === index + 1
                      ? "bg-[#6C5DD3] text-white"
                      : "text-slate-600 hover:bg-slate-100"
                  )}
                >
                  {index + 1}
                </button>
              ))}
            </div>
            <Button
              variant="outline"
              size="sm"
              className="rounded-lg"
              disabled={page === totalPages}
              onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
            >
              Next
            </Button>
          </div>
        )}
      </main>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-4">
      <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">{title}</h4>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function FilterRow({ label, checked, onChange }: { label: string; checked?: boolean; onChange?: (v: boolean) => void }) {
  return (
    <label className="flex cursor-pointer items-center gap-2.5 rounded-md py-1 text-sm text-slate-700 hover:text-slate-900">
      <Checkbox className="h-4 w-4" checked={checked} onCheckedChange={onChange} />
      <span>{label}</span>
    </label>
  );
}

function candidateProfileHref(c: Candidate) {
  return `/dashboard/company/student-dashboard/${encodeURIComponent(c.name.toLowerCase().replace(/\s+/g, "-"))}?id=${c.id}`;
}

function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center rounded-md px-2 py-0.5 text-[11px] font-semibold",
        status === "Available Now" && "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/10",
        status === "Actively Looking" && "bg-sky-50 text-sky-700 ring-1 ring-sky-600/10",
        status === "Open to Offers" && "bg-amber-50 text-amber-800 ring-1 ring-amber-600/10",
        status !== "Available Now" &&
          status !== "Actively Looking" &&
          status !== "Open to Offers" &&
          "bg-slate-100 text-slate-600 ring-1 ring-slate-200"
      )}
    >
      {status}
    </span>
  );
}

function CandidateCardSection({
  title,
  children,
  className,
}: {
  title?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("border-t border-slate-100/90 px-5 py-4", className)}>
      {title ? (
        <h4 className="mb-3 text-[10px] font-bold uppercase tracking-[0.14em] text-[#6C5DD3]/80">
          {title}
        </h4>
      ) : null}
      {children}
    </section>
  );
}

function CandidateDetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-0.5">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">{label}</p>
      <p className="text-sm font-semibold leading-snug text-slate-800">{value}</p>
    </div>
  );
}

function CandidateCard({ c }: { c: Candidate }) {
  const majorLabel = resolveFieldOfMajorLabel(c.fieldOfMajor, c.degree);
  const showDegreeRow =
    Boolean(c.degree) &&
    Boolean(majorLabel) &&
    c.degree.trim().toLowerCase() !== majorLabel.trim().toLowerCase();
  const extraSkills = Math.max(0, c.skills.length - 4);
  const messageHref = `/dashboard/company/messages?studentProfileId=${encodeURIComponent(c.id)}`;

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-[#6C5DD3]/25 hover:shadow-md hover:shadow-indigo-100/40">
      {/* Identity */}
      <section className="p-5 pb-4">
        <div className="flex gap-4">
          <Avatar className="h-16 w-16 shrink-0 border-2 border-white shadow-md ring-2 ring-slate-100 transition-shadow group-hover:ring-[#6C5DD3]/20">
            {c.photoDataUrl && <AvatarImage src={c.photoDataUrl} alt={c.name} />}
            <AvatarFallback className="bg-gradient-to-br from-indigo-50 to-violet-100 text-base font-bold text-[#6C5DD3]">
              {c.name.split(" ").map((name) => name[0]).join("")}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5">
              <h3 className="text-base font-extrabold leading-snug text-slate-900">{c.name}</h3>
              <StatusBadge status={c.status} />
            </div>
            <p
              className="mt-2 flex items-start gap-1.5 text-sm leading-relaxed text-slate-600"
              title={c.university}
            >
              <GraduationCap className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" aria-hidden />
              <span className="line-clamp-2">{c.university}</span>
            </p>
          </div>
        </div>
      </section>

      {/* Education */}
      <CandidateCardSection title="Education">
        <div className="space-y-3">
          {(majorLabel || c.degree) && (
            <CandidateDetailRow label="Major" value={majorLabel || c.degree} />
          )}
          {showDegreeRow && <CandidateDetailRow label="Degree" value={c.degree} />}
          <div className="flex flex-wrap items-center gap-2 rounded-xl bg-slate-50/90 px-3 py-2 text-xs font-semibold text-slate-600">
            <span>Class of {c.classOf}</span>
            <span className="text-slate-300" aria-hidden>
              ·
            </span>
            <span>GPA {c.gpa.toFixed(2)}</span>
          </div>
        </div>
      </CandidateCardSection>

      {/* Skills */}
      {c.skills.length > 0 && (
        <CandidateCardSection title="Skills" className="flex-1">
          <div className="flex flex-wrap gap-1.5">
            {c.skills.slice(0, 4).map((skill) => (
              <span
                key={skill}
                className="rounded-lg border border-indigo-100/80 bg-indigo-50/60 px-2.5 py-1 text-xs font-semibold text-indigo-900/90"
              >
                {skill}
              </span>
            ))}
            {extraSkills > 0 && (
              <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-500">
                +{extraSkills} more
              </span>
            )}
          </div>
        </CandidateCardSection>
      )}

      {/* Actions — stacked layout prevents button overlap */}
      <section className="mt-auto border-t border-slate-100 bg-gradient-to-b from-slate-50/30 to-slate-50/80 px-5 py-4">
        <div className="flex flex-col gap-2">
          {c.cvUrl ? (
            <Button
              asChild
              variant="outline"
              size="sm"
              className="h-10 w-full rounded-xl border-slate-200 bg-white font-semibold text-slate-700 shadow-sm hover:border-[#6C5DD3]/30 hover:bg-white"
            >
              <a href={c.cvUrl} target="_blank" rel="noopener noreferrer">
                <FileText className="mr-2 h-4 w-4 shrink-0" />
                View CV
              </a>
            </Button>
          ) : null}
          <div className="grid grid-cols-2 gap-2">
            <Button
              asChild
              variant="outline"
              size="sm"
              className="h-10 w-full rounded-xl border-slate-200 bg-white font-semibold text-slate-700 shadow-sm hover:border-[#6C5DD3]/30"
            >
              <Link href={messageHref}>
                <MessageSquare className="mr-2 h-4 w-4 shrink-0" />
                Message
              </Link>
            </Button>
            <Button
              asChild
              size="sm"
              className="h-10 w-full rounded-xl bg-[#6C5DD3] font-semibold shadow-sm hover:bg-[#5b4eb8]"
            >
              <Link href={candidateProfileHref(c)}>
                <UserRound className="mr-2 h-4 w-4 shrink-0" />
                Profile
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </article>
  );
}

function CandidateListRow({ c }: { c: Candidate }) {
  const majorLabel = resolveFieldOfMajorLabel(c.fieldOfMajor, c.degree);
  const messageHref = `/dashboard/company/messages?studentProfileId=${encodeURIComponent(c.id)}`;

  return (
    <div className="flex flex-col gap-4 p-5 transition-colors hover:bg-indigo-50/20 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
      <div className="flex min-w-0 items-center gap-4">
        <Avatar className="h-12 w-12 shrink-0 border-2 border-white shadow-sm ring-1 ring-slate-100">
          {c.photoDataUrl && <AvatarImage src={c.photoDataUrl} alt={c.name} />}
          <AvatarFallback className="bg-indigo-50 text-sm font-bold text-[#6C5DD3]">
            {c.name.split(" ").map((name) => name[0]).join("")}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-extrabold text-slate-900">{c.name}</h3>
            <StatusBadge status={c.status} />
          </div>
          <p className="mt-1 text-sm text-slate-600 line-clamp-1" title={c.university}>
            {c.university}
            {(majorLabel || c.degree) && ` · ${majorLabel || c.degree}`}
          </p>
          <p className="mt-1 text-xs font-semibold text-slate-500">
            Class of {c.classOf} · GPA {c.gpa.toFixed(2)}
            {c.skills.length > 0 && ` · ${c.skills.slice(0, 3).join(", ")}${c.skills.length > 3 ? "…" : ""}`}
          </p>
        </div>
      </div>
      <div className="flex w-full shrink-0 flex-wrap gap-2 sm:w-auto sm:justify-end">
        {c.cvUrl ? (
          <Button asChild variant="outline" size="sm" className="h-9 rounded-xl border-slate-200 font-semibold">
            <a href={c.cvUrl} target="_blank" rel="noopener noreferrer">
              <FileText className="mr-1.5 h-3.5 w-3.5" />
              CV
            </a>
          </Button>
        ) : null}
        <Button asChild variant="outline" size="sm" className="h-9 rounded-xl border-slate-200 font-semibold">
          <Link href={messageHref}>
            <MessageSquare className="mr-1.5 h-3.5 w-3.5" />
            Message
          </Link>
        </Button>
        <Button asChild size="sm" className="h-9 rounded-xl bg-[#6C5DD3] font-semibold hover:bg-[#5b4eb8]">
          <Link href={candidateProfileHref(c)}>
            <UserRound className="mr-1.5 h-3.5 w-3.5" />
            Profile
          </Link>
        </Button>
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

function FilterMultiSelectChips({
  placeholder,
  items,
  onRemove,
}: {
  placeholder: string;
  items: { key: string; label: string }[];
  onRemove: (key: string) => void;
}) {
  if (items.length === 0) {
    return <span className="text-slate-500 font-normal">{placeholder}</span>;
  }

  return (
    <div className="flex flex-wrap gap-1.5 w-full">
      {items.map(({ key, label }) => (
        <span
          key={key}
          className="inline-flex max-w-full items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700"
        >
          <span className="truncate">{label}</span>
          <button
            type="button"
            className="flex-shrink-0 rounded-sm hover:text-indigo-900"
            aria-label={`Remove ${label}`}
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onRemove(key);
            }}
          >
            <X className="w-3 h-3" />
          </button>
        </span>
      ))}
    </div>
  );
}
