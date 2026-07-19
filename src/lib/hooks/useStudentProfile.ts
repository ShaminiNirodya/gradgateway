"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AuthService } from "@/lib/services/auth.service";
import { StudentService } from "@/lib/services/student.service";
import { StudentProfile } from "@/lib/types/student";

function getInitials(name: string | undefined): string {
  if (!name) return "ST";
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "ST";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

export function useStudentProfile() {
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const token = await AuthService.getIdToken();
      if (!token) {
        setProfile(null);
        setLoading(false);
        return;
      }

      const student = await StudentService.getCurrentStudent(token);
      setProfile(student);
    } catch (err: any) {
      setProfile(null);
      setError(err?.message || "Failed to load student profile");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const displayName = useMemo(() => {
    if (!profile?.fullName) return "Student";
    return profile.fullName;
  }, [profile?.fullName]);

  const initials = useMemo(() => getInitials(profile?.fullName), [profile?.fullName]);

  return {
    profile,
    loading,
    error,
    refresh,
    displayName,
    initials,
  };
}
