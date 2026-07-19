export type HelpAudience = "Student" | "Company" | "All";

export interface HelpArticle {
  id: string;
  title: string;
  audiences: HelpAudience[];
  summary: string;
  steps: string[];
  relatedLinks?: Partial<Record<HelpAudience, { href: string; label: string }>>;
}

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

export function getGuidesForAudience(_audience: HelpAudience): HelpArticle[] {
  return [];
}

export function getHelpFaqsForAudience(_audience: HelpAudience): ContentFaq[] {
  return [];
}

export function getArticlesForAudience(_audience: HelpAudience): ContentArticle[] {
  return [];
}
