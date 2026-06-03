const HIGHLIGHT_RING_CLASSES = [
  "ring-2",
  "ring-[#6C5DD3]",
  "ring-offset-2",
  "animate-pulse",
  "shadow-lg",
  "shadow-indigo-200/60",
] as const;

/** Scroll to a DOM node by id and briefly emphasize it (e.g. from notification deep links). */
export function scrollAndHighlightElement(
  elementId: string,
  options?: { durationMs?: number }
): void {
  const el = document.getElementById(elementId);
  if (!el) return;

  el.scrollIntoView({ behavior: "smooth", block: "center" });
  el.classList.add(...HIGHLIGHT_RING_CLASSES);

  const durationMs = options?.durationMs ?? 4500;
  window.setTimeout(() => {
    el.classList.remove(...HIGHLIGHT_RING_CLASSES);
  }, durationMs);
}

export function applicationHighlightElementId(applicationId: string): string {
  return `application-${applicationId}`;
}

export function conversationHighlightElementId(conversationId: string): string {
  return `conversation-${conversationId}`;
}
