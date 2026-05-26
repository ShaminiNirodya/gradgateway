"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";

export type ApplicationStatus = "New" | "Shortlisted" | "Interviewed" | "Offer Sent" | "Hired" | "Rejected";

export interface Application {
    id: string;
    jobId: number;
    jobTitle: string;
    companyName: string;
    studentId: string;
    studentName: string;
    studentImg?: string;
    studentUni?: string;
    studentGpa?: number;
    status: ApplicationStatus;
    appliedDate: string;
}

interface ApplicationContextType {
    applications: Application[];
    applyToJob: (job: any) => void;
    updateApplicationStatus: (id: string, status: ApplicationStatus) => void;
    getStudentApplications: (studentId: string) => Application[];
    getJobApplications: (jobId: number) => Application[];
}

const ApplicationContext = createContext<ApplicationContextType | undefined>(undefined);

export function ApplicationProvider({ children }: { children: React.ReactNode }) {
    const { user, userData } = useAuth();
    const [applications, setApplications] = useState<Application[]>([]);

    // Initialize with some mock data for the company side
    useEffect(() => {
        const initialApps: Application[] = [
            {
                id: "1",
                jobId: 1,
                jobTitle: "Software Engineer Intern",
                companyName: "TechCorp Inc.",
                studentId: "student_1",
                studentName: "Sarah Johnson",
                studentUni: "MIT",
                studentGpa: 3.8,
                studentImg: "https://i.pravatar.cc/150?u=1",
                status: "New",
                appliedDate: "2026-02-10",
            },
            {
                id: "2",
                jobId: 2,
                jobTitle: "Junior Data Analyst",
                companyName: "DataSystems LLC",
                studentId: "student_2",
                studentName: "Michael Chen",
                studentUni: "Stanford",
                studentGpa: 3.9,
                studentImg: "https://i.pravatar.cc/150?u=2",
                status: "Interviewed",
                appliedDate: "2026-02-09",
            },
        ];
        setApplications(initialApps);
    }, []);

    const applyToJob = (job: any) => {
        if (!user) return;

        const newApp: Application = {
            id: Math.random().toString(36).substr(2, 9),
            jobId: job.id,
            jobTitle: job.title,
            companyName: job.company,
            studentId: user.uid,
            studentName: user.email?.split("@")[0] || "Student",
            studentUni: "University of Colombo", // Mock
            studentGpa: 3.8, // Mock
            status: "New",
            appliedDate: new Date().toISOString().split("T")[0],
            studentImg: user.photoURL || undefined,
        };

        setApplications((prev) => [...prev, newApp]);
    };

    const updateApplicationStatus = (id: string, status: ApplicationStatus) => {
        setApplications((prev) =>
            prev.map((app) => (app.id === id ? { ...app, status } : app))
        );
    };

    const getStudentApplications = (studentId: string) => {
        return applications.filter((app) => app.studentId === studentId);
    };

    const getJobApplications = (jobId: number) => {
        return applications.filter((app) => app.jobId === jobId);
    };

    return (
        <ApplicationContext.Provider
            value={{
                applications,
                applyToJob,
                updateApplicationStatus,
                getStudentApplications,
                getJobApplications,
            }}
        >
            {children}
        </ApplicationContext.Provider>
    );
}

export function useApplications() {
    const context = useContext(ApplicationContext);
    if (context === undefined) {
        throw new Error("useApplications must be used within an ApplicationProvider");
    }
    return context;
}
