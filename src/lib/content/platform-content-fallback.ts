export type HelpAudience = "Student" | "Company" | "All";

export interface HelpArticle {
  id: string;
  title: string;
  audiences: HelpAudience[];
  summary: string;
  steps: string[];
  relatedLinks?: Partial<Record<HelpAudience, { href: string; label: string }>>;
};

export type ContentFaq = {
  q: string;
  a: string;
  audiences?: HelpAudience[];
};

export type ContentArticle = {
  id: string;
  title: string;
  summary: string;
  body: string;
  audiences: HelpAudience[];
  category?: string;
};

export const publicFaqs: ContentFaq[] = [
  {
    q: "Is GradGateway free for students?",
    a: "Yes. Creating a profile, publishing projects, applying to openings, and messaging companies is completely free for students.",
  },
  {
    q: "Who can register as a student?",
    a: "Any undergraduate or recent graduate of a Sri Lankan university. You'll add your university, degree, and graduation year when creating your profile.",
  },
  {
    q: "How do companies find me?",
    a: "Companies search the talent directory by skills, degree, university, and availability. Your skills come from your profile and the tech stacks of your published projects.",
  },
  {
    q: "How do I apply for an opening?",
    a: "Browse Openings in your dashboard, open a role, and submit your application with an optional cover letter. You can track the status under Applications.",
  },
  {
    q: "What happens after a company shortlists me?",
    a: "You'll get a notification and the company can message you directly, schedule an interview, or send a job offer — all visible in your dashboard.",
  },
  {
    q: "Can companies post any kind of role?",
    a: "Companies post internships, graduate roles, part-time and full-time positions. Our admin team monitors postings, and you can report anything suspicious via support.",
  },
  {
    q: "How do I delete my account or my data?",
    a: "Contact support through the contact page and we'll process your request in line with our privacy policy.",
  },
  {
    q: "I forgot my password. What do I do?",
    a: "Use the Forgot Password link on the login page. We'll email you a 6-digit verification code to reset your password.",
  },
];

export const helpCenterFaqs: ContentFaq[] = [
  {
    audiences: ["Student", "All"],
    q: "How do I get started as a student?",
    a: "Create an account, complete your profile, browse opportunities, and apply to roles that match your skills.",
  },
  {
    audiences: ["Company", "All"],
    q: "How do companies post jobs?",
    a: "Register as a company, complete your profile, then create opportunities from your dashboard.",
  },
  {
    audiences: ["Student", "Company", "All"],
    q: "How long until support replies?",
    a: "We aim to respond within 24–48 hours on business days. Urgent issues can be marked in your message.",
  },
  {
    audiences: ["Student", "Company", "All"],
    q: "Where does my support message go?",
    a: "Every request from this page is saved to the platform database and shown in the admin Help & inquiries section.",
  },
];

export const contactFaqs: ContentFaq[] = [
  {
    q: "Do I need a GradGateway account to contact you?",
    a: "No. The contact form is open to everyone. Your inquiry is sent to the admin team even if you have not registered yet.",
  },
  {
    q: "How quickly will I receive a response?",
    a: "We typically respond within 24–48 business hours. Choose Support as the inquiry type for urgent issues.",
  },
  {
    q: "What should I include in my message?",
    a: "Tell us who you are, what you need, and include links or context that help us understand your request.",
  },
  {
    q: "Can universities or career centers reach out?",
    a: "Yes. Select Campus / University or Partnership and describe how you would like to collaborate.",
  },
];

export const helpGuides: HelpArticle[] = [
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
      All: { href: "/dashboard/student/applications", label: "View my applications" },
    },
  },
];

export const helpArticlesList: ContentArticle[] = [
  {
    id: "student-cv-tips",
    title: "Tips for a standout student CV",
    summary: "Small changes that help recruiters understand your fit quickly.",
    body: "Lead with your degree, university, and graduation year. Highlight 2–3 projects with links to repos or demos. List skills that match the roles you want, and keep descriptions concise — recruiters often scan profiles in under a minute.",
    audiences: ["Student", "All"],
    category: "Profile & Projects",
  },
  {
    id: "job-post-tips",
    title: "Writing job posts that attract graduates",
    summary: "Clear roles get better applications.",
    body: "Use a specific title, state whether the role is internship or graduate, and mention the tech stack honestly. Include location or remote policy, stipend or salary range if possible, and a realistic deadline so students can plan applications.",
    audiences: ["Company", "All"],
    category: "For Companies",
  },
  {
    id: "profile-safety",
    title: "Staying safe when sharing your profile",
    summary: "How GradGateway handles your data and visibility.",
    body: "You control which projects are public. Companies only see what you publish and what you submit in applications. Report suspicious messages or postings via support — our admin team reviews every inquiry.",
    audiences: ["Student", "Company", "All"],
    category: "Technical Support",
  },
];

export function getGuidesForAudience(audience: HelpAudience): HelpArticle[] {
  return helpGuides.filter((a) => a.audiences.includes(audience) || a.audiences.includes("All"));
}

export function getHelpFaqsForAudience(audience: HelpAudience): ContentFaq[] {
  if (audience === "All") return helpCenterFaqs;
  return helpCenterFaqs.filter(
    (item) =>
      !item.audiences ||
      item.audiences.includes(audience) ||
      item.audiences.includes("All")
  );
}

export function getArticlesForAudience(audience: HelpAudience): ContentArticle[] {
  return helpArticlesList.filter(
    (a) => a.audiences.includes(audience) || a.audiences.includes("All")
  );
}
