export interface PublicTestimonial {
  id: string;
  quote: string;
  authorName: string;
  authorRole: string;
}

export interface TestimonialListItem extends PublicTestimonial {
  status: string;
  sortOrder: number;
  submitterEmail?: string | null;
  submitterRole?: string | null;
  submittedByUserId?: string | null;
  createdAt: string;
  publishedAt?: string | null;
  reviewedAt?: string | null;
}

export interface SubmitTestimonialPayload {
  quote: string;
  authorName: string;
  authorRole: string;
  email?: string;
  submitterRole?: string;
}

export interface AdminCreateTestimonialPayload {
  quote: string;
  authorName: string;
  authorRole: string;
  status?: string;
  sortOrder?: number;
}

export interface AdminUpdateTestimonialPayload {
  quote: string;
  authorName: string;
  authorRole: string;
  sortOrder: number;
}
