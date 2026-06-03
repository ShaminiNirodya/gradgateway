export type ApplicationProgressStep = {
  key: string;
  label: string;
};

import { isDirectJobOfferApplication } from "@/lib/constants/application-status";

export { isDirectJobOfferApplication };

type ProgressPhase =
  | "applied"
  | "shortlisted"
  | "interviewed"
  | "hired"
  | "rejected"
  | "offerReceived"
  | "accepted";

function resolveProgressPhase(status: string, isDirectOffer: boolean): ProgressPhase {
  const lower = status.toLowerCase();

  if (lower.includes("reject")) return "rejected";
  if (lower.includes("hire")) return "hired";

  if (isDirectOffer) {
    if (lower.includes("offeraccepted") || lower.includes("offer accepted")) return "accepted";
    if (lower.includes("interview")) return "interviewed";
    if (lower.includes("offer")) return "offerReceived";
    return "offerReceived";
  }

  if (lower.includes("interview")) return "interviewed";
  if (lower.includes("short")) return "shortlisted";
  return "applied";
}

const OPENING_STEPS: ApplicationProgressStep[] = [
  { key: "applied", label: "Applied" },
  { key: "shortlisted", label: "Shortlisted" },
  { key: "interviewed", label: "Interviewed" },
  { key: "result", label: "Result" },
];

const DIRECT_ACCEPTED_STEPS: ApplicationProgressStep[] = [
  { key: "offerReceived", label: "Offer Received" },
  { key: "accepted", label: "Accepted" },
  { key: "interviewed", label: "Interviewed" },
  { key: "result", label: "Result" },
];

const DIRECT_REJECTED_STEPS: ApplicationProgressStep[] = [
  { key: "offerReceived", label: "Offer Received" },
  { key: "rejected", label: "Rejected" },
];

const OPENING_ORDER = ["applied", "shortlisted", "interviewed", "result"];
const DIRECT_ACCEPTED_ORDER = ["offerReceived", "accepted", "interviewed", "result"];

export function getApplicationProgressModel(
  status: string,
  opportunityId?: string | null,
  companyProfileId?: string | null
): {
  steps: ApplicationProgressStep[];
  activeKey: string;
  completedThroughIndex: number;
} {
  const isDirect = isDirectJobOfferApplication(opportunityId, status, companyProfileId);
  const phase = resolveProgressPhase(status, isDirect);

  if (isDirect) {
    if (phase === "rejected") {
      return {
        steps: DIRECT_REJECTED_STEPS,
        activeKey: "rejected",
        completedThroughIndex: 1,
      };
    }

    const steps = DIRECT_ACCEPTED_STEPS.map((step) => {
      if (step.key !== "result") return step;
      if (phase === "hired") return { ...step, label: "Hired" };
      if (phase === "rejected") return { ...step, label: "Rejected" };
      return step;
    });

    let activeKey = "offerReceived";
    if (phase === "accepted") activeKey = "accepted";
    else if (phase === "interviewed") activeKey = "interviewed";
    else if (phase === "hired" || phase === "rejected") activeKey = "result";

    const completedThroughIndex = DIRECT_ACCEPTED_ORDER.indexOf(activeKey);
    return {
      steps,
      activeKey,
      completedThroughIndex: Math.max(0, completedThroughIndex),
    };
  }

  const steps = OPENING_STEPS.map((step) => {
    if (step.key !== "result") return step;
    if (phase === "hired") return { ...step, label: "Hired" };
    if (phase === "rejected") return { ...step, label: "Rejected" };
    return step;
  });

  let activeKey = "applied";
  if (phase === "shortlisted") activeKey = "shortlisted";
  else if (phase === "interviewed") activeKey = "interviewed";
  else if (phase === "hired" || phase === "rejected") activeKey = "result";

  const completedThroughIndex = OPENING_ORDER.indexOf(activeKey);

  return {
    steps,
    activeKey,
    completedThroughIndex: Math.max(0, completedThroughIndex),
  };
}
