import { API_ENDPOINTS } from '@/lib/config';
import type { PublicTestimonial, SubmitTestimonialPayload } from '@/lib/types/testimonial';

async function getJsonOrThrow<T>(response: Response, fallbackMessage: string): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error?.message || error?.title || `${fallbackMessage} (${response.status})`);
  }
  return response.json();
}

export class TestimonialService {
  static async getPublished(limit = 6): Promise<PublicTestimonial[]> {
    const url = `${API_ENDPOINTS.PLATFORM.TESTIMONIALS}?limit=${limit}`;
    const response = await fetch(url, { cache: 'no-store' });
    const data = await getJsonOrThrow<Array<Record<string, unknown>>>(response, 'Failed to load testimonials');
    return data.map((item) => ({
      id: String(item.id ?? item.Id ?? ''),
      quote: String(item.quote ?? item.Quote ?? ''),
      authorName: String(item.authorName ?? item.AuthorName ?? ''),
      authorRole: String(item.authorRole ?? item.AuthorRole ?? ''),
    }));
  }

  static async submit(
    payload: SubmitTestimonialPayload,
    token: string
  ): Promise<{ message: string }> {
    const response = await fetch(API_ENDPOINTS.TESTIMONIALS.SUBMIT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    return getJsonOrThrow(response, 'Failed to submit testimonial');
  }
}
