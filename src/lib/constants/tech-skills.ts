import { getTechnologies, searchTech, techExists } from "@sparring/tech-catalog";

/** Non-tech skills commonly used in job posts (not in the tech catalog). */
export const SOFT_SKILLS = [
  "Agile",
  "Scrum",
  "Leadership",
  "Communication",
  "Problem Solving",
  "Teamwork",
  "Project Management",
  "UI/UX Design",
] as const;

export type SkillOption = {
  name: string;
  category?: string;
};

let cachedSkillNames: string[] | null = null;
let cachedTechnologyOptions: SkillOption[] | null = null;

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Rank how well a skill name matches a search query (higher = better). */
function scoreSkillName(name: string, query: string): number {
  const lower = name.toLowerCase();
  const q = query.toLowerCase().trim();
  if (!q) return 0;

  if (lower === q) return 1000;
  if (lower.startsWith(q)) return 800;
  if (new RegExp(`\\b${escapeRegExp(q)}`, "i").test(name)) return 650;
  if (lower.endsWith(q)) return 500;
  if (lower.includes(q)) return 300;
  return 0;
}

function getTechnologyOptions(): SkillOption[] {
  if (!cachedTechnologyOptions) {
    cachedTechnologyOptions = getTechnologies().map((t) => ({
      name: t.nombre,
      category: t.tipo,
    }));
  }
  return cachedTechnologyOptions;
}

/** All catalog technology names plus soft skills, sorted alphabetically. */
export function getAllSkillNames(): string[] {
  if (!cachedSkillNames) {
    cachedSkillNames = [
      ...new Set([...getTechnologies().map((t) => t.nombre), ...SOFT_SKILLS]),
    ].sort((a, b) => a.localeCompare(b));
  }
  return cachedSkillNames;
}

export function getSkillCatalogCount(): number {
  return getTechnologies().length;
}

export function isKnownSkill(name: string): boolean {
  return techExists(name) || (SOFT_SKILLS as readonly string[]).includes(name);
}

/** Common picks shown before the user types — not an exhaustive list. */
const BROWSE_SKILL_NAMES = [
  "JavaScript",
  "TypeScript",
  "Python",
  "Java",
  "C#",
  "Go",
  "Rust",
  "React",
  "Next.js",
  "Node.js",
  "Vue.js",
  "Angular",
  ".NET",
  "ASP.NET Core",
  "Spring Boot",
  "Django",
  "FastAPI",
  "PostgreSQL",
  "MySQL",
  "MongoDB",
  "Redis",
  "AWS",
  "Azure",
  "Google Cloud",
  "Docker",
  "Kubernetes",
  "Git",
  "GraphQL",
  "TensorFlow",
  "Figma",
  "Flutter",
  "Swift",
  "Kotlin",
] as const;

function getBrowseSkills(limit = 40): SkillOption[] {
  const byName = new Map(
    getTechnologyOptions().map((option) => [option.name.toLowerCase(), option])
  );
  const results: SkillOption[] = [];
  const seen = new Set<string>();

  for (const name of BROWSE_SKILL_NAMES) {
    const option = byName.get(name.toLowerCase());
    const skill = option ?? { name };
    const key = skill.name.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    results.push(skill);
    if (results.length >= limit) break;
  }

  for (const name of SOFT_SKILLS) {
    const key = name.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    results.push({ name, category: "Soft skill" });
    if (results.length >= limit) break;
  }

  return results;
}

/** Search skills for pickers — ranked substring search with fuzzy fallback for typos. */
export function filterSkills(query: string, limit = 60): SkillOption[] {
  const trimmed = query.trim();
  if (!trimmed) {
    return getBrowseSkills(limit);
  }

  const scored: Array<SkillOption & { score: number }> = [];

  for (const option of getTechnologyOptions()) {
    const score = scoreSkillName(option.name, trimmed);
    if (score > 0) scored.push({ ...option, score });
  }

  for (const name of SOFT_SKILLS) {
    const score = scoreSkillName(name, trimmed);
    if (score > 0) scored.push({ name, category: "Soft skill", score });
  }

  scored.sort((a, b) => b.score - a.score || a.name.localeCompare(b.name));

  let results = scored.slice(0, limit);

  // Typo-tolerant fallback only when direct matches are weak or missing.
  const topScore = results[0]?.score ?? 0;
  if (results.length === 0 || (topScore < 300 && trimmed.length >= 3)) {
    const fuzzyResults = searchTech(trimmed, { fuzzy: true, maxResults: limit });
    const seen = new Set(results.map((r) => r.name.toLowerCase()));

    for (const r of fuzzyResults) {
      const name = r.technology.nombre;
      const key = name.toLowerCase();
      if (seen.has(key)) continue;

      const similarity = typeof r.score === "number" ? r.score : 0;
      if (results.length > 0 && similarity < 0.55) continue;

      seen.add(key);
      results.push({
        name,
        category: r.technology.tipo,
        score: Math.round(similarity * 100),
      });
      if (results.length >= limit) break;
    }

    results.sort((a, b) => b.score - a.score || a.name.localeCompare(b.name));
    results = results.slice(0, limit);
  }

  return results.map(({ name, category }) => ({ name, category }));
}
