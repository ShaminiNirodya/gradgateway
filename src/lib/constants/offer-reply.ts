export const OFFER_REPLY_INTERVIEW =
  "I am open for an interview. Please share the available dates and times.";

export const OFFER_REPLY_REJECTED =
  "Thank you for the offer. I am not moving forward with this opportunity at this time.";

export function matchesJobOfferAcceptReply(content: string): boolean {
  const trimmed = content.trim();
  return (
    trimmed === OFFER_REPLY_INTERVIEW ||
    /open for an interview/i.test(trimmed)
  );
}

export function matchesJobOfferDeclineReply(content: string): boolean {
  const trimmed = content.trim();
  return (
    trimmed === OFFER_REPLY_REJECTED ||
    /not moving forward with this opportunity/i.test(trimmed)
  );
}

export function matchesJobOfferReply(content: string): boolean {
  return matchesJobOfferAcceptReply(content) || matchesJobOfferDeclineReply(content);
}

export function notifyApplicationsRefresh(): void {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("applications:refresh"));
  }
}
