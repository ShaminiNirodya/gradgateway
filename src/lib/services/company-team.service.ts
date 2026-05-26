import { API_ENDPOINTS } from '@/lib/config';
import { InviteTeamMemberPayload, TeamMember } from '@/lib/types/company';

export class CompanyTeamService {
  static async getMyTeam(token: string): Promise<TeamMember[]> {
    const response = await fetch(API_ENDPOINTS.COMPANY_TEAM.ME, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || 'Failed to load team members');
    }

    return response.json();
  }

  static async inviteMember(token: string, payload: InviteTeamMemberPayload): Promise<TeamMember> {
    const response = await fetch(API_ENDPOINTS.COMPANY_TEAM.INVITE, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || 'Failed to invite member');
    }

    return response.json();
  }

  static async removeMember(token: string, memberId: string): Promise<void> {
    const response = await fetch(API_ENDPOINTS.COMPANY_TEAM.REMOVE(memberId), {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || 'Failed to remove member');
    }
  }
}
