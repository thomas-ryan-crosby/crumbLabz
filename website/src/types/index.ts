export interface ContactSubmission {
  name: string;
  company: string;
  email: string;
  phone?: string;
  headache: string;
  createdAt: Date;
}

export type ContactStatus = "new" | "contacted" | "in_progress" | "closed";
