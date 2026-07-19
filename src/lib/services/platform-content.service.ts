import { API_ENDPOINTS } from "@/lib/config";
import { mapPlatformContentItem, type PlatformContentItem } from "@/lib/types/platform-content";

async function getJson<T>(response: Response, fallbackMessage: string): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(
      (error as { message?: string })?.message ||
        (error as { title?: string })?.title ||
        `${fallbackMessage} (${response.status})`
    );
  }
  return response.json();
}

function mapList(raw: unknown): PlatformContentItem[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((item) => mapPlatformContentItem(item as Record<string, unknown>));
}

export class PlatformContentService {
  static async getPublished(params?: {
    contentType?: string;
    section?: string;
    audience?: string;
    slug?: string;
  }): Promise<PlatformContentItem[]> {
    const search = new URLSearchParams();
    if (params?.contentType) search.set("contentType", params.contentType);
    if (params?.section) search.set("section", params.section);
    if (params?.audience) search.set("audience", params.audience);
    if (params?.slug) search.set("slug", params.slug);

    const url = search.toString()
      ? `${API_ENDPOINTS.PLATFORM.CONTENT}?${search}`
      : API_ENDPOINTS.PLATFORM.CONTENT;

    const response = await fetch(url, { next: { revalidate: 60 } });
    const data = await getJson<unknown>(response, "Failed to load content");
    return mapList(data);
  }
}
