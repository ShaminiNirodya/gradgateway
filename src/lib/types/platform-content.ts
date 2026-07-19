export type PlatformContentType = "Faq" | "Guide" | "Article" | "Legal";
export type PlatformContentSection = "Public" | "HelpCenter" | "Contact" | "Legal";
export type PlatformContentAudience = "Student" | "Company" | "All";
export type PlatformContentStatus = "Published" | "Draft";

export interface PlatformContentItem {
  id: string;
  contentType: PlatformContentType;
  section: PlatformContentSection;
  title: string;
  body: string;
  summary?: string | null;
  steps: string[];
  audiences: PlatformContentAudience[];
  category?: string | null;
  slug?: string | null;
  relatedLinkHref?: string | null;
  relatedLinkLabel?: string | null;
  status?: PlatformContentStatus;
  sortOrder: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface PlatformContentFormValues {
  contentType: PlatformContentType;
  section: PlatformContentSection;
  title: string;
  body: string;
  summary: string;
  stepsText: string;
  audiences: PlatformContentAudience[];
  category: string;
  slug: string;
  relatedLinkHref: string;
  relatedLinkLabel: string;
  status: PlatformContentStatus;
  sortOrder: number;
}

export function mapPlatformContentItem(raw: Record<string, unknown>): PlatformContentItem {
  const steps = raw.steps ?? raw.Steps;
  const audiences = raw.audiences ?? raw.Audiences;

  return {
    id: String(raw.id ?? raw.Id ?? ""),
    contentType: String(raw.contentType ?? raw.ContentType ?? "Faq") as PlatformContentType,
    section: String(raw.section ?? raw.Section ?? "Public") as PlatformContentSection,
    title: String(raw.title ?? raw.Title ?? ""),
    body: String(raw.body ?? raw.Body ?? ""),
    summary: (raw.summary ?? raw.Summary) as string | null | undefined,
    steps: Array.isArray(steps) ? steps.map(String) : [],
    audiences: Array.isArray(audiences)
      ? (audiences.map(String) as PlatformContentAudience[])
      : ["All"],
    category: (raw.category ?? raw.Category) as string | null | undefined,
    slug: (raw.slug ?? raw.Slug) as string | null | undefined,
    relatedLinkHref: (raw.relatedLinkHref ?? raw.RelatedLinkHref) as string | null | undefined,
    relatedLinkLabel: (raw.relatedLinkLabel ?? raw.RelatedLinkLabel) as string | null | undefined,
    status: String(raw.status ?? raw.Status ?? "Published") as PlatformContentStatus,
    sortOrder: Number(raw.sortOrder ?? raw.SortOrder ?? 0),
    createdAt: raw.createdAt ? String(raw.createdAt) : raw.CreatedAt ? String(raw.CreatedAt) : undefined,
    updatedAt: raw.updatedAt ? String(raw.updatedAt) : raw.UpdatedAt ? String(raw.UpdatedAt) : undefined,
  };
}

export function toGuideArticle(item: PlatformContentItem) {
  return {
    id: item.slug ?? item.id,
    title: item.title,
    audiences: item.audiences,
    summary: item.summary ?? "",
    steps: item.steps,
    relatedLinks:
      item.relatedLinkHref && item.relatedLinkLabel
        ? {
            All: { href: item.relatedLinkHref, label: item.relatedLinkLabel },
            Student: { href: item.relatedLinkHref, label: item.relatedLinkLabel },
            Company: { href: item.relatedLinkHref, label: item.relatedLinkLabel },
          }
        : undefined,
  };
}

export function parseStepsText(stepsText: string): string[] {
  return stepsText
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

export function stepsToText(steps: string[]): string {
  return steps.join("\n");
}

export function toApiPayload(values: PlatformContentFormValues) {
  return {
    contentType: values.contentType,
    section: values.section,
    title: values.title,
    body: values.body,
    summary: values.summary || null,
    steps: parseStepsText(values.stepsText),
    audiences: values.audiences.length > 0 ? values.audiences : ["All"],
    category: values.category || null,
    slug: values.slug || null,
    relatedLinkHref: values.relatedLinkHref || null,
    relatedLinkLabel: values.relatedLinkLabel || null,
    status: values.status,
    sortOrder: values.sortOrder,
  };
}

export function toFormValues(item?: PlatformContentItem): PlatformContentFormValues {
  return {
    contentType: item?.contentType ?? "Faq",
    section: item?.section ?? "Public",
    title: item?.title ?? "",
    body: item?.body ?? "",
    summary: item?.summary ?? "",
    stepsText: stepsToText(item?.steps ?? []),
    audiences: item?.audiences ?? ["All"],
    category: item?.category ?? "",
    slug: item?.slug ?? "",
    relatedLinkHref: item?.relatedLinkHref ?? "",
    relatedLinkLabel: item?.relatedLinkLabel ?? "",
    status: item?.status ?? "Draft",
    sortOrder: item?.sortOrder ?? 0,
  };
}
