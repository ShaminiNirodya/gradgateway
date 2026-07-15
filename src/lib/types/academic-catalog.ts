export type PublicAcademicCatalog = {
  universities: PublicUniversityCatalogItem[];
  degrees: string[];
};

export type PublicUniversityCatalogItem = {
  id: string;
  name: string;
  degrees: string[];
};

export type CatalogUniversityAdmin = {
  id: string;
  name: string;
  isActive: boolean;
  sortOrder: number;
  degreeCount: number;
  updatedAt: string;
};

export type CatalogDegreeAdmin = {
  id: string;
  name: string;
  isActive: boolean;
  sortOrder: number;
  universityCount: number;
  updatedAt: string;
};

export type CatalogUniversityDetail = {
  id: string;
  name: string;
  isActive: boolean;
  sortOrder: number;
  degrees: CatalogDegreeLink[];
  updatedAt: string;
};

export type CatalogDegreeLink = {
  id: string;
  name: string;
  isActive: boolean;
  offeringIsActive: boolean;
};

export type UpsertCatalogUniversityPayload = {
  name: string;
  isActive?: boolean;
  sortOrder?: number;
};

export type UpsertCatalogDegreePayload = {
  name: string;
  isActive?: boolean;
  sortOrder?: number;
};

export function buildUniversityDegreeMap(
  catalog: PublicAcademicCatalog
): Record<string, string[]> {
  const map: Record<string, string[]> = {};
  for (const university of catalog.universities) {
    map[university.name] = [...university.degrees].sort();
  }
  return map;
}
