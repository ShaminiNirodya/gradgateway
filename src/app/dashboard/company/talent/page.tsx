"use client";

import { useEffect, useMemo, useState } from "react";
import { Search, LayoutGrid, Download, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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

// State Universities only
const ALL_UNIVERSITIES = [
  "University of Colombo",
  "University of Peradeniya",
  "University of Moratuwa",
  "University of Kelaniya",
  "University of Sri Jayewardenepura",
  "University of Ruhuna",
  "Eastern University",
  "University of Jaffna",
  "Sabaragamuwa University",
  "Wayamba University",
  "Rajarata University",
  "South Eastern University",
  "Uva Wellassa University",
  "University of the Visual & Performing Arts",
  "Open University of Sri Lanka"
].sort();

// All available degrees
const ALL_DEGREES = [
  "BSc (Hons) Computer Science", "BSc Computer Science", "BSc Information Technology",
  "BSc Software Engineering", "BSc Information Systems", "BSc Cyber Security",
  "BSc Data Science", "BSc Artificial Intelligence", "BSc Computer Engineering",
  "BEng (Hons) Electrical Engineering", "BEng (Hons) Mechanical Engineering",
  "BEng (Hons) Civil Engineering", "BEng (Hons) Electronic Engineering",
  "BEng (Hons) Chemical Engineering", "BEng (Hons) Biomedical Engineering",
  "BBA Business Administration", "BSc Business Management", "BSc Accounting & Finance",
  "BSc Marketing", "BSc Human Resource Management", "BSc Economics",
  "BSc (Hons) Mathematics", "BSc (Hons) Physics", "BSc (Hons) Chemistry",
  "BSc (Hons) Biology", "BSc (Hons) Biotechnology", "BSc (Hons) Environmental Science",
  "BA (Hons) Psychology", "BA (Hons) Sociology", "BA (Hons) English",
  "BA (Hons) Mass Communication", "BA (Hons) Political Science",
  "BDes Graphic Design", "BDes UI/UX Design", "BDes Product Design",
  "BA (Hons) Fine Arts", "BSc Multimedia Technology",
  "LLB Law", "MBBS Medicine", "BArch Architecture"
].sort();

// All available skills/technologies (not just the ones students selected)
const ALL_SKILLS = [
  "React", "Vue.js", "Angular", "Svelte", "Next.js", "Node.js", "Express.js",
  "Python", "Django", "Flask", "Java", "Spring Boot", "C++", "C#", ".NET",
  "Go", "Rust", "PHP", "Laravel", "Ruby", "Rails", "TypeScript", "JavaScript",
  "Flutter", "React Native", "Swift", "Kotlin", "Android", "iOS",
  "PostgreSQL", "MySQL", "MongoDB", "Redis", "Firebase", "AWS", "Azure",
  "Google Cloud", "Docker", "Kubernetes", "DevOps", "CI/CD", "Git",
  "Machine Learning", "Data Science", "AI", "TensorFlow", "PyTorch",
  "UI/UX Design", "Figma", "Adobe XD", "Photoshop", "Tailwind CSS",
  "Bootstrap", "Material-UI", "GraphQL", "REST API", "Microservices",
  "Agile", "Scrum", "Leadership", "Communication", "Problem Solving"
].sort();

type Candidate = {
  id: string;
  name: string;
  university: string;
  classOf: number;
  gpa: number;
  skills: string[];
  project: string;
  status: string;
  photoDataUrl?: string;
};

export default function TalentSearchPage() {
  const { show } = useToast();
  const [query, setQuery] = useState("");
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [selectedUniversities, setSelectedUniversities] = useState<Set<string>>(new Set());
  const [selectedDegrees, setSelectedDegrees] = useState<Set<string>>(new Set());
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
  const [universitySearch, setUniversitySearch] = useState("");
  const [degreeSearch, setDegreeSearch] = useState("");
  const [skillSearch, setSkillSearch] = useState("");
  const [isUniversityDropdownOpen, setIsUniversityDropdownOpen] = useState(false);
  const [isDegreeDropdownOpen, setIsDegreeDropdownOpen] = useState(false);
  const [isSkillDropdownOpen, setIsSkillDropdownOpen] = useState(false);

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

          return {
            id: row.studentProfileId,
            name: row.fullName,
            university: row.university,
            classOf: gradYear,
            gpa: Number(row.gpa),
            skills: skillList,
            project: row.degree || "Student Portfolio",
            status: row.availability || "Available Now",
            photoDataUrl: row.photoDataUrl,
          };
        }));
      } catch {
        setCandidates([]);
      }
    };

    load();
  }, []);

  // Use predefined lists instead of dynamic ones from student data
  const allUniversities = ALL_UNIVERSITIES;
  const allSkills = ALL_SKILLS;

  const filtered = useMemo(() => {
    let list = candidates.filter((candidate) => {
      const matchesQuery =
        !query ||
        candidate.name.toLowerCase().includes(query.toLowerCase()) ||
        candidate.skills.join(" ").toLowerCase().includes(query.toLowerCase()) ||
        candidate.project.toLowerCase().includes(query.toLowerCase());

      const matchesUniversity = selectedUniversities.size === 0 || selectedUniversities.has(candidate.university);
      const matchesDegree = selectedDegrees.size === 0 || selectedDegrees.has(candidate.project);
      const matchesYear = (!yearFrom || candidate.classOf >= Number(yearFrom)) && (!yearTo || candidate.classOf <= Number(yearTo));
      const matchesGpa = (!gpaFrom || candidate.gpa >= Number(gpaFrom)) && (!gpaTo || candidate.gpa <= Number(gpaTo));
      const matchesSkill = skills.size === 0 || candidate.skills.some((skill) => skills.has(skill));
      const matchesAvailability = availability.size === 0 || availability.has(candidate.status);

      return matchesQuery && matchesUniversity && matchesDegree && matchesYear && matchesGpa && matchesSkill && matchesAvailability;
    });

    list = [...list].sort((a, b) => {
      if (sortKey === "GPA") return b.gpa - a.gpa;
      if (sortKey === "Class") return b.classOf - a.classOf;
      return 0;
    });

    return list;
  }, [availability, candidates, gpaFrom, gpaTo, query, selectedUniversities, selectedDegrees, skills, sortKey, yearFrom, yearTo]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageItems = filtered.slice((page - 1) * pageSize, page * pageSize);

  const clearFilters = () => {
    setSelectedUniversities(new Set());
    setSelectedDegrees(new Set());
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
          <DropdownMenu open={isUniversityDropdownOpen} onOpenChange={setIsUniversityDropdownOpen}>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="outline"
                className="w-full justify-start text-left font-normal h-10"
              >
                {selectedUniversities.size > 0 
                  ? `${selectedUniversities.size} selected` 
                  : "Select universities..."}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="bg-white w-[320px] rounded-xl shadow-xl border-slate-100 p-0">
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
                {allUniversities
                  .filter(u => u.toLowerCase().includes(universitySearch.toLowerCase()))
                  .map((university) => (
                    <label
                      key={university}
                      className="flex items-center gap-2 p-2 hover:bg-indigo-50 rounded-lg cursor-pointer text-sm"
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
          {selectedUniversities.size > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {Array.from(selectedUniversities).map((uni) => (
                <span
                  key={uni}
                  className="inline-flex items-center gap-1 px-2 py-1 bg-indigo-50 text-indigo-700 rounded-md text-xs"
                >
                  {uni.split(' ').slice(0, 3).join(' ')}
                  <X
                    className="w-3 h-3 cursor-pointer hover:text-indigo-900"
                    onClick={() => toggleSet(setSelectedUniversities, selectedUniversities, uni, false)}
                  />
                </span>
              ))}
            </div>
          )}
        </Section>

        <Section title="Degree / Major">
          <DropdownMenu open={isDegreeDropdownOpen} onOpenChange={setIsDegreeDropdownOpen}>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="outline"
                className="w-full justify-start text-left font-normal h-10"
              >
                {selectedDegrees.size > 0 
                  ? `${selectedDegrees.size} selected` 
                  : "Select degrees..."}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="bg-white w-[320px] rounded-xl shadow-xl border-slate-100 p-0">
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
                {ALL_DEGREES
                  .filter(d => d.toLowerCase().includes(degreeSearch.toLowerCase()))
                  .map((degree) => (
                    <label
                      key={degree}
                      className="flex items-center gap-2 p-2 hover:bg-indigo-50 rounded-lg cursor-pointer text-sm"
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
          {selectedDegrees.size > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {Array.from(selectedDegrees).map((degree) => (
                <span
                  key={degree}
                  className="inline-flex items-center gap-1 px-2 py-1 bg-indigo-50 text-indigo-700 rounded-md text-xs"
                >
                  {degree.split(' ').slice(0, 3).join(' ')}
                  <X
                    className="w-3 h-3 cursor-pointer hover:text-indigo-900"
                    onClick={() => toggleSet(setSelectedDegrees, selectedDegrees, degree, false)}
                  />
                </span>
              ))}
            </div>
          )}
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
          <DropdownMenu open={isSkillDropdownOpen} onOpenChange={setIsSkillDropdownOpen}>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="outline"
                className="w-full justify-start text-left font-normal h-10"
              >
                {skills.size > 0 
                  ? `${skills.size} selected` 
                  : "Select skills..."}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="bg-white w-[320px] rounded-xl shadow-xl border-slate-100 p-0">
              <div className="sticky top-0 bg-white border-b border-slate-100 p-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    type="text"
                    placeholder="Search skills..."
                    value={skillSearch}
                    onChange={(e) => setSkillSearch(e.target.value)}
                    onKeyDown={(e) => e.stopPropagation()}
                    onMouseDown={(e) => e.stopPropagation()}
                    className="pl-9 h-9 rounded-lg border-slate-200"
                  />
                </div>
              </div>
              <div className="max-h-60 overflow-y-auto p-2">
                {allSkills
                  .filter(s => s.toLowerCase().includes(skillSearch.toLowerCase()))
                  .map((skill) => (
                    <label
                      key={skill}
                      className="flex items-center gap-2 p-2 hover:bg-indigo-50 rounded-lg cursor-pointer text-sm"
                    >
                      <Checkbox
                        checked={skills.has(skill)}
                        onCheckedChange={(checked) => 
                          toggleSet(setSkills, skills, skill, !!checked)
                        }
                      />
                      <span className="text-slate-700">{skill}</span>
                    </label>
                  ))}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
          {skills.size > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {Array.from(skills).map((skill) => (
                <span
                  key={skill}
                  className="inline-flex items-center gap-1 px-2 py-1 bg-indigo-50 text-indigo-700 rounded-md text-xs"
                >
                  {skill}
                  <X
                    className="w-3 h-3 cursor-pointer hover:text-indigo-900"
                    onClick={() => toggleSet(setSkills, skills, skill, false)}
                  />
                </span>
              ))}
            </div>
          )}
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
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12 border-2 border-white shadow-sm">
                    {candidate.photoDataUrl && <AvatarImage src={candidate.photoDataUrl} alt={candidate.name} />}
                    <AvatarFallback className="bg-indigo-50 text-[#6C5DD3] text-sm font-bold">
                      {candidate.name.split(" ").map((name) => name[0]).join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-bold text-slate-800 text-sm">{candidate.name}</h3>
                    <p className="text-xs text-slate-500">{candidate.university} • Class {candidate.classOf} • GPA {candidate.gpa.toFixed(2)}</p>
                  </div>
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
            {c.photoDataUrl && <AvatarImage src={c.photoDataUrl} alt={c.name} />}
            <AvatarFallback className="bg-indigo-50 text-[#6C5DD3] text-xl font-bold">
              {c.name.split(" ").map((name) => name[0]).join("")}
            </AvatarFallback>
          </Avatar>
          <span className={`inline-block px-2 py-1 rounded-lg text-[10px] font-bold ${
            c.status === "Available Now" ? "bg-emerald-50 text-emerald-600" :
            c.status === "Actively Looking" ? "bg-blue-50 text-blue-600" :
            c.status === "Open to Offers" ? "bg-amber-50 text-amber-600" :
            "bg-slate-50 text-slate-600"
          }`}>{c.status}</span>
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
