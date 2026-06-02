import { API_ENDPOINTS } from '@/lib/config';
import {
  ApplicationItem,
  ConversationItem,
  NotificationItem,
  OpportunityItem,
  ScheduleInterviewsResult,
} from '@/lib/types/dashboard';

async function getJsonOrThrow<T>(response: Response, fallbackMessage: string): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error?.message || error?.title || `${fallbackMessage} (${response.status})`);
  }

  return response.json();
}

async function fetchWithTimeout(input: RequestInfo | URL, init: RequestInit, timeoutMs = 12000): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(input, {
      ...init,
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timer);
  }
}

export class DashboardService {
  private static conversationsCache: { data: ConversationItem[]; cachedAt: number } | null = null;
  private static conversationsInFlight: Promise<ConversationItem[]> | null = null;
  private static messagesCache = new Map<string, { data: Array<{
    id: string;
    conversationId: string;
    senderUserId: string;
    senderName: string;
    content: string;
    isRead: boolean;
    sentAt: string;
  }>; cachedAt: number }>();
  private static messagesInFlight = new Map<string, Promise<Array<{
    id: string;
    conversationId: string;
    senderUserId: string;
    senderName: string;
    content: string;
    isRead: boolean;
    sentAt: string;
  }>>>();

  private static readonly CONVERSATIONS_TTL_MS = 5_000;
  private static readonly MESSAGES_TTL_MS = 3_000;

  static async getStudentOpportunities(): Promise<OpportunityItem[]> {
    const response = await fetch(API_ENDPOINTS.OPPORTUNITIES.LIST, {
      headers: { 'Content-Type': 'application/json' },
    });

    return getJsonOrThrow<OpportunityItem[]>(response, 'Failed to load opportunities');
  }

  static async getMyApplications(token: string): Promise<ApplicationItem[]> {
    const response = await fetch(API_ENDPOINTS.APPLICATIONS.STUDENT_ME, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    return getJsonOrThrow<ApplicationItem[]>(response, 'Failed to load applications');
  }

  static async getMyConversations(token: string): Promise<ConversationItem[]> {
    const now = Date.now();
    if (this.conversationsCache && now - this.conversationsCache.cachedAt < this.CONVERSATIONS_TTL_MS) {
      return this.conversationsCache.data;
    }

    if (this.conversationsInFlight) {
      return this.conversationsInFlight;
    }

    this.conversationsInFlight = (async () => {
      const response = await fetchWithTimeout(API_ENDPOINTS.CONVERSATIONS.ME, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await getJsonOrThrow<ConversationItem[]>(response, 'Failed to load conversations');
      const normalized = data.map((row) => normalizeConversationItem(row));
      this.conversationsCache = { data: normalized, cachedAt: Date.now() };
      return normalized;
    })();

    try {
      return await this.conversationsInFlight;
    } finally {
      this.conversationsInFlight = null;
    }
  }

  static async startConversation(
    token: string,
    payload: { opportunityId?: string; studentProfileId?: string; companyProfileId?: string }
  ): Promise<ConversationItem> {
    const response = await fetch(API_ENDPOINTS.CONVERSATIONS.START, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const created = await getJsonOrThrow<ConversationItem & { HasUnread?: boolean }>(
      response,
      'Failed to start conversation'
    );
    return normalizeConversationItem(created);
  }

  static async getConversationMessages(token: string, conversationId: string) {
    const now = Date.now();
    const cached = this.messagesCache.get(conversationId);
    if (cached && now - cached.cachedAt < this.MESSAGES_TTL_MS) {
      return cached.data;
    }

    const existingRequest = this.messagesInFlight.get(conversationId);
    if (existingRequest) {
      return existingRequest;
    }

    const request = (async () => {
      const response = await fetchWithTimeout(API_ENDPOINTS.CONVERSATIONS.MESSAGES(conversationId), {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await getJsonOrThrow<Array<{
        id: string;
        conversationId: string;
        senderUserId: string;
        senderName: string;
        content: string;
        isRead: boolean;
        sentAt: string;
      }>>(response, 'Failed to load conversation messages');

      this.messagesCache.set(conversationId, { data, cachedAt: Date.now() });
      this.conversationsCache = null;
      return data;
    })();

    this.messagesInFlight.set(conversationId, request);
    try {
      return await request;
    } finally {
      this.messagesInFlight.delete(conversationId);
    }
  }

  static async sendConversationMessage(token: string, conversationId: string, content: string) {
    const response = await fetchWithTimeout(API_ENDPOINTS.CONVERSATIONS.MESSAGES(conversationId), {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ content }),
    });

    const data = await getJsonOrThrow<{
      id: string;
      conversationId: string;
      senderUserId: string;
      senderName: string;
      content: string;
      isRead: boolean;
      sentAt: string;
    }>(response, 'Failed to send message');

    // Invalidate relevant caches so UI gets fresh data after sending.
    this.messagesCache.delete(conversationId);
    this.conversationsCache = null;

    return data;
  }

  static clearConversationsCache() {
    this.conversationsCache = null;
  }

  static async getOpportunityById(opportunityId: string): Promise<OpportunityItem> {
    const response = await fetch(API_ENDPOINTS.OPPORTUNITIES.BY_ID(opportunityId), {
      headers: { 'Content-Type': 'application/json' },
    });

    return getJsonOrThrow<OpportunityItem>(response, 'Failed to load opportunity details');
  }

  static async getCompanyApplications(token: string): Promise<ApplicationItem[]> {
    const response = await fetch(API_ENDPOINTS.APPLICATIONS.COMPANY_ME, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    return getJsonOrThrow<ApplicationItem[]>(response, 'Failed to load company applications');
  }

  static async getCompanyOpportunities(token: string): Promise<OpportunityItem[]> {
    const response = await fetch(API_ENDPOINTS.OPPORTUNITIES.COMPANY_ME, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    return getJsonOrThrow<OpportunityItem[]>(response, 'Failed to load company opportunities');
  }

  static async createCompanyOpportunity(
    token: string,
    payload: {
      title: string;
      description: string;
      opportunityType: string;
      workMode: string;
      location: string;
      requiredSkills: string;
      monthlyStipendLkr?: number | null;
      deadlineAt: string;
    }
  ): Promise<OpportunityItem> {
    const response = await fetch(API_ENDPOINTS.OPPORTUNITIES.CREATE, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    return getJsonOrThrow<OpportunityItem>(response, 'Failed to create opportunity');
  }

  static async updateApplicationStatus(token: string, applicationId: string, status: string): Promise<ApplicationItem> {
    const response = await fetch(API_ENDPOINTS.APPLICATIONS.UPDATE_STATUS(applicationId), {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status }),
    });

    return getJsonOrThrow<ApplicationItem>(response, 'Failed to update application status');
  }

  static async getMyNotifications(token: string): Promise<NotificationItem[]> {
    const response = await fetch(API_ENDPOINTS.NOTIFICATIONS.ME, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    return getJsonOrThrow<NotificationItem[]>(response, 'Failed to load notifications');
  }

  static async markNotificationRead(token: string, notificationId: string): Promise<void> {
    const response = await fetch(API_ENDPOINTS.NOTIFICATIONS.MARK_READ(notificationId), {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const message = await response.text();
      throw new Error(message || 'Failed to mark notification as read');
    }
  }

  static async scheduleInterviews(
    token: string,
    opportunityId: string,
    payload: {
      scheduledAt: string;
      durationMinutes: number;
      mode: string;
      meetingLink?: string | null;
      location?: string | null;
      notes?: string | null;
    }
  ): Promise<ScheduleInterviewsResult> {
    const response = await fetch(API_ENDPOINTS.OPPORTUNITIES.SCHEDULE_INTERVIEWS(opportunityId), {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    return getJsonOrThrow<ScheduleInterviewsResult>(response, 'Failed to schedule interviews');
  }

  static async applyToOpportunity(token: string, opportunityId: string, coverLetter?: string): Promise<ApplicationItem> {
    const response = await fetch(API_ENDPOINTS.APPLICATIONS.APPLY, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        opportunityId,
        coverLetter: coverLetter || null,
      }),
    });

    return getJsonOrThrow<ApplicationItem>(response, 'Failed to submit application');
  }
}

function normalizeConversationItem(row: ConversationItem & { HasUnread?: boolean }): ConversationItem {
  return {
    ...row,
    hasUnread: Boolean(row.hasUnread ?? row.HasUnread),
  };
}
