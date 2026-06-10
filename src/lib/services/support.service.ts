import { API_ENDPOINTS } from '@/lib/config';

export class SupportService {
  static async submitInquiry(payload: {
    name: string;
    email: string;
    phone?: string;
    type: string;
    message: string;
    attachmentName?: string;
  }): Promise<void> {
    const response = await fetch(API_ENDPOINTS.SUPPORT_INQUIRIES, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error?.message || `Failed to send message (${response.status})`);
    }
  }
}
