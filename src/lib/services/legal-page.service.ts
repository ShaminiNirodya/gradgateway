import { PlatformContentService } from "@/lib/services/platform-content.service";
import type { LegalPageContent, LegalPageSlug } from "@/lib/content/legal-pages-fallback";

export async function getLegalPageContent(slug: LegalPageSlug): Promise<LegalPageContent | null> {
  try {
    const items = await PlatformContentService.getPublished({
      contentType: "Legal",
      slug,
    });
    const item = items[0];
    if (!item) return null;

    return {
      slug,
      title: item.title,
      body: item.body,
    };
  } catch {
    return null;
  }
}
