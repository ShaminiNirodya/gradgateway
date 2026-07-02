export type LegalPageSlug = "privacy-policy" | "terms-of-service" | "cookies";

export type LegalPageContent = {
  title: string;
  body: string;
  slug: LegalPageSlug;
};

export const legalPageSlugs: LegalPageSlug[] = [
  "privacy-policy",
  "terms-of-service",
  "cookies",
];

export const legalPageLabels: Record<LegalPageSlug, string> = {
  "privacy-policy": "Privacy Policy",
  "terms-of-service": "Terms of Service",
  cookies: "Cookie Policy",
};
