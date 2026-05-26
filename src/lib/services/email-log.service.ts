import { API_ENDPOINTS } from '@/lib/config';

export type EmailLogTrackPayload = {
  toEmail: string;
  templateType: string;
  purpose: string;
  status: 'Queued' | 'Sent' | 'Failed' | 'Simulated';
  provider?: string;
  providerMessageId?: string;
  payloadJson?: string;
  error?: string;
  sentAt?: string;
};

export class EmailLogService {
  static async track(token: string, payload: EmailLogTrackPayload): Promise<void> {
    await fetch(API_ENDPOINTS.EMAIL_LOGS.TRACK, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
  }
}
