"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AcademicCatalogService } from "@/lib/services/academic-catalog.service";
import type { PublicAcademicCatalog } from "@/lib/types/academic-catalog";
import {
  ALL_DEGREES,
  ALL_UNIVERSITIES,
  getDegreesForUniversity as getStaticDegreesForUniversity,
  getUniversitiesForDegree as getStaticUniversitiesForDegree,
  normalizeDegreeName,
} from "@/lib/constants/university-degrees";

export function useAcademicCatalog(activeOnly = true) {
  const [catalog, setCatalog] = useState<PublicAcademicCatalog | null>(null);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const data = await AcademicCatalogService.getPublicCatalog(true);
      setCatalog(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  const universityDegreeMap = useMemo(() => {
    if (!catalog) return null;
    return AcademicCatalogService.getUniversityDegreeMap(catalog);
  }, [catalog]);

  const universities = useMemo(() => {
    if (!catalog) return ALL_UNIVERSITIES;
    const names = catalog.universities.map((u) => u.name).sort();
    return activeOnly ? names : names;
  }, [catalog, activeOnly]);

  const allDegrees = useMemo(() => {
    if (!catalog?.degrees?.length) return ALL_DEGREES;
    return [...catalog.degrees].sort();
  }, [catalog]);

  const getDegreesForUniversity = useCallback(
    (university: string) => {
      if (universityDegreeMap && universityDegreeMap[university]) {
        return universityDegreeMap[university];
      }
      return getStaticDegreesForUniversity(university);
    },
    [universityDegreeMap]
  );

  const getUniversitiesForDegree = useCallback(
    (degree: string) => {
      const normalized = normalizeDegreeName(degree);
      if (universityDegreeMap) {
        return Object.entries(universityDegreeMap)
          .filter(([, degrees]) => degrees.includes(normalized))
          .map(([university]) => university)
          .sort();
      }
      return getStaticUniversitiesForDegree(normalized);
    },
    [universityDegreeMap]
  );

  return {
    catalog,
    loading,
    reload,
    universities,
    allDegrees,
    getDegreesForUniversity,
    getUniversitiesForDegree,
  };
}
