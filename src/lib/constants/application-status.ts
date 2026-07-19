export const APPLICATION_STATUS_OPTIONS = [
  { filterKey: "New", label: "New Applied", apiStatus: "Pending" },
  { filterKey: "Shortlisted", label: "Shortlisted", apiStatus: "Shortlisted" },
  { filterKey: "Interviewed", label: "Interviewed", apiStatus: "Interviewed" },
  { filterKey: "Offers", label: "Offers", apiStatus: "OfferSent" },
  { filterKey: "Hired", label: "Hired", apiStatus: "Hired" },
  { filterKey: "Rejected", label: "Rejected", apiStatus: "Rejected" },
] as const;

export type ApplicationStatusFilterKey =
  (typeof APPLICATION_STATUS_OPTIONS)[number]["filterKey"];

/** Opening-application pipeline filters (excludes offers and hired roster). */
export const OPENING_APPLICATION_FILTER_OPTIONS = APPLICATION_STATUS_OPTIONS.filter(
  (option) => option.filterKey !== "Offers" && option.filterKey !== "Hired"
);

export const HIRED_APPLICATION_FILTER_OPTION = APPLICATION_STATUS_OPTIONS.find(
  (option) => option.filterKey === "Hired"
)!;

export const OFFERS_APPLICATION_FILTER_OPTION = APPLICATION_STATUS_OPTIONS.find(
  (option) => option.filterKey === "Offers"
)!;

export type CompanyStatusActionOption = (typeof APPLICATION_STATUS_OPTIONS)[number];

/** Company Actions menu when an application is in the offer stage (sent or accepted). */
export const COMPANY_OFFER_STATUS_ACTION_OPTIONS: CompanyStatusActionOption[] = [
  { filterKey: "Interviewed", label: "Interviewed", apiStatus: "Interviewed" },
  { filterKey: "Rejected", label: "Rejected", apiStatus: "Rejected" },
  { filterKey: "Hired", label: "Hired", apiStatus: "Hired" },
];

export function isCompanyInitiatedOfferApplication(app: {
  companyProfileId?: string | null;
}): boolean {
  const id = app.companyProfileId;
  return id != null && id !== "";
}

export function isCompanyOfferWorkflowApplication(
  status: string,
  companyProfileId?: string | null
): boolean {
  if (isCompanyInitiatedOfferApplication({ companyProfileId })) {
    const lower = status.toLowerCase().trim();
    if (lower.includes("reject") || lower.includes("hire")) return false;
    return true;
  }

  const lower = status.toLowerCase().trim();
  if (lower.includes("reject") || lower.includes("hire")) return false;

  return (
    lower.includes("offersent") ||
    lower === "offer sent" ||
    lower.includes("offeraccepted") ||
    lower.includes("offer accepted") ||
    (lower.includes("offer") && !lower.includes("interview"))
  );
}

export function getCompanyStatusActionOptions(app: {
  status: string;
  companyProfileId?: string | null;
}): CompanyStatusActionOption[] {
  if (isCompanyOfferWorkflowApplication(app.status, app.companyProfileId)) {
    return COMPANY_OFFER_STATUS_ACTION_OPTIONS;
  }

  return APPLICATION_STATUS_OPTIONS.filter((option) => option.filterKey !== "New");
}

export function isDirectJobOfferApplication(
  opportunityId?: string | null,
  status?: string,
  companyProfileId?: string | null
): boolean {
  if (isCompanyInitiatedOfferApplication({ companyProfileId })) return true;
  if (opportunityId == null || opportunityId === "") return true;
  if (!status) return false;
  const lower = status.toLowerCase();
  return (
    lower.includes("offersent") ||
    lower.includes("offer sent") ||
    lower.includes("offeraccepted") ||
    lower.includes("offer accepted")
  );
}

export function normalizeApplicationStatus(status: string): ApplicationStatusFilterKey {
  const lower = status.toLowerCase().trim();

  if (lower.includes("reject")) return "Rejected";
  if (lower.includes("hire")) return "Hired";
  if (lower.includes("offeraccepted") || lower.includes("offer accepted")) return "Offers";
  if (lower.includes("offersent") || lower === "offer sent") return "Offers";
  if (lower.includes("interview")) return "Interviewed";
  if (lower.includes("short")) return "Shortlisted";
  if (
    lower.includes("pending") ||
    lower === "new" ||
    lower.includes("new applied") ||
    lower.includes("submitted")
  ) {
    return "New";
  }
  if (lower.includes("applied")) return "New";
  if (lower.includes("offer")) return "Offers";
  return "New";
}

/** Offers tab: company-sent job offers (any status) plus opening-related offer statuses. */
export function matchesOffersFilter(app: {
  status: string;
  opportunityId?: string | null;
  companyProfileId?: string | null;
}): boolean {
  if (isCompanyInitiatedOfferApplication(app)) return true;

  const lower = app.status.toLowerCase().trim();
  if (lower.includes("reject") || lower.includes("hire")) return false;

  if (isDirectJobOfferApplication(app.opportunityId, app.status, app.companyProfileId)) {
    return (
      lower.includes("offersent") ||
      lower === "offer sent" ||
      lower.includes("offeraccepted") ||
      lower.includes("offer accepted") ||
      lower.includes("offer")
    );
  }

  return normalizeApplicationStatus(app.status) === "Offers";
}

export function matchesApplicationFilter(
  app: {
    status: string;
    opportunityId?: string | null;
    companyProfileId?: string | null;
  },
  filterKey: string
): boolean {
  if (filterKey === "All") return true;
  if (filterKey === "Offers") return matchesOffersFilter(app);
  return normalizeApplicationStatus(app.status) === filterKey;
}

export function applicationStatusLabel(status: string): string {
  const lower = status.toLowerCase();
  if (lower.includes("offeraccepted") || lower.includes("offer accepted")) {
    return "Offer Accepted";
  }
  const key = normalizeApplicationStatus(status);
  return APPLICATION_STATUS_OPTIONS.find((o) => o.filterKey === key)?.label ?? status;
}

export function applicationStatusBadgeClass(filterKey: ApplicationStatusFilterKey): string {
  const styles: Record<ApplicationStatusFilterKey, string> = {
    New: "bg-blue-50 text-blue-600 ring-blue-100",
    Shortlisted: "bg-purple-50 text-purple-600 ring-purple-100",
    Interviewed: "bg-amber-50 text-amber-700 ring-amber-100",
    Offers: "bg-emerald-50 text-emerald-600 ring-emerald-100",
    Hired: "bg-indigo-50 text-indigo-600 ring-indigo-100",
    Rejected: "bg-slate-50 text-slate-500 ring-slate-100",
  };
  return styles[filterKey];
}
