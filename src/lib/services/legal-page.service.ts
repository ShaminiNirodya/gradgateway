import { PlatformContentService } from "@/lib/services/platform-content.service";
import {
  legalPagesFallback,
  type LegalPageContent,
  type LegalPageSlug,
} from "@/lib/content/legal-pages-fallback";

export async function getLegalPageContent(slug: LegalPageSlug): Promise<LegalPageContent> {
  const fallback = legalPagesFallback[slug];

  try {
    const items = await PlatformContentService.getPublished({
      contentType: "Legal",
      slug,
    });
    const item = items[0];
    if (item) {
      return {
        slug,
        title: item.title,
        body: item.body,
      };
    }
  } catch {
    // use fallback
  }

  return fallback;
}
