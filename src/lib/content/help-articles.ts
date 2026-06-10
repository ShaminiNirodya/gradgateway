export type HelpAudience = "Student" | "Company" | "All";

export interface HelpArticle {
  id: string;
  title: string;
  audiences: HelpAudience[];
  summary: string;
  steps: string[];
  relatedLinks?: Partial<Record<HelpAudience, { href: string; label: string }>>;
}

export const helpArticles: HelpArticle[] = [
  {
    id: "first-project",
    title: "How to create your first project",
    audiences: ["Student", "All"],
    summary: "Showcase your work so companies can see what you have built.",
    steps: [
      "Open My Projects from the student sidebar.",
      "Click Add project and enter a clear title and short description.",
      "List the tech stack you used (e.g. React, ASP.NET Core, SQL Server).",
      "Add a repository or demo link if you have one.",
      "Set the project to public so it appears on your profile and in talent search.",
    ],
    relatedLinks: {
      Student: { href: "/dashboard/student/projects", label: "Go to My Projects" },
      All: { href: "/dashboard/student/projects", label: "Go to My Projects" },
    },
  },
  {
    id: "student-profile",
    title: "Setting up your student profile",
    audiences: ["Student", "All"],
    summary: "A complete profile helps you stand out when applying to opportunities.",
    steps: [
      "Go to Settings from your student dashboard.",
      "Fill in your full name, university, degree, and graduation year.",
      "Upload a profile photo and add your phone number.",
      "Add skills, GPA, and availability so recruiters can match you faster.",
      "Save changes — your profile is used on applications and in the talent directory.",
    ],
    relatedLinks: {
      Student: { href: "/dashboard/student/settings", label: "Open student settings" },
      All: { href: "/dashboard/student/settings", label: "Open student settings" },
    },
  },
  {
    id: "post-jobs",
    title: "How to post and manage job opportunities",
    audiences: ["Company", "All"],
    summary: "Publish internships and graduate roles, then track applications in one place.",
    steps: [
      "From the company dashboard, open Job Posts.",
      "Click Create opportunity and fill in title, description, skills, and location.",
      "Set the work mode (onsite, hybrid, or remote) and application deadline.",
      "Publish the post — it becomes visible to students in Openings.",
      "Edit or deactivate posts anytime from Job Posts; expired posts move off the live feed.",
    ],
    relatedLinks: {
      Company: { href: "/dashboard/company/jobs", label: "Go to Job Posts" },
      All: { href: "/dashboard/company/jobs", label: "Go to Job Posts" },
    },
  },
  {
    id: "find-talent",
    title: "How to find the right talent",
    audiences: ["Company", "All"],
    summary: "Search the student directory and review projects before you reach out.",
    steps: [
      "Open Talent Search from the company sidebar.",
      "Filter by university, skills, or keywords that match your role.",
      "Open a student profile to view their projects, education, and experience.",
      "Start a conversation or wait for applications on your posted opportunities.",
      "Shortlist applicants from the Applications page when you are ready to interview.",
    ],
    relatedLinks: {
      Company: { href: "/dashboard/company/talent", label: "Open Talent Search" },
      All: { href: "/dashboard/company/talent", label: "Open Talent Search" },
    },
  },
  {
    id: "applications-messaging",
    title: "Understanding applications and messaging",
    audiences: ["Student", "Company", "All"],
    summary: "How applications, status updates, and messages work on GradGateway.",
    steps: [
      "Students apply from Openings; each application is tied to one opportunity.",
      "Companies review applications and can update status (pending, shortlisted, hired, etc.).",
      "Either side can start a conversation from Messages once there is an application or outreach.",
      "Notifications alert you to new messages, application updates, and interview invites.",
      "Keep checking Messages and Applications — timely replies improve hiring outcomes.",
    ],
    relatedLinks: {
      Student: { href: "/dashboard/student/applications", label: "View my applications" },
      Company: { href: "/dashboard/company/applications", label: "View applications" },
      All: { href: "/dashboard/student/applications", label: "View applications" },
    },
  },
];

export function getArticlesForAudience(audience: HelpAudience): HelpArticle[] {
  return helpArticles.filter((a) => a.audiences.includes(audience) || a.audiences.includes("All"));
}
