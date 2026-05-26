export type Project = {
  title: string;
  slug: string;
  category: string;
  image: string;
  views: number;
  likes: number;
  date: string; // ISO
  summary?: string;
};

export const categories = ["Web Development", "Mobile App", "AI/ML", "Blockchain", "Data Science"] as const;

export const allProjects: Project[] = [
  {
    title: "E-Commerce Dashboard",
    slug: "e-commerce-dashboard",
    category: "Web Development",
    image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085",
    views: 432,
    likes: 28,
    date: "2026-01-10",
    summary: "A responsive admin dashboard for e-commerce analytics and inventory management.",
  },
  {
    title: "Finance Mobile App",
    slug: "finance-mobile-app",
    category: "Mobile App",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71",
    views: 313,
    likes: 19,
    date: "2026-01-12",
    summary: "Cross-platform budgeting app with charts and secure sync.",
  },
  {
    title: "AI Chatbot Assistant",
    slug: "ai-chatbot-assistant",
    category: "AI/ML",
    image: "https://images.unsplash.com/photo-1515879218367-8466d910aaa4",
    views: 638,
    likes: 54,
    date: "2026-01-08",
    summary: "Conversational assistant powered by NLP and intent classification.",
  },
];
