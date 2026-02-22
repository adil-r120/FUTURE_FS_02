export type LeadStatus = "new" | "contacted" | "converted" | "lost";

export type LeadSource = "website" | "referral" | "social" | "email" | "phone" | "other";

export interface LeadNote {
  id: string;
  content: string;
  createdAt: Date;
}

export interface LeadTask {
  id: string;
  title: string;
  dueDate: Date;
  completed: boolean;
  type: "call" | "email" | "meeting" | "todo";
}

export interface LeadActivity {
  id: string;
  type: "status_change" | "note_added" | "task_completed" | "lead_created";
  description: string;
  timestamp: Date;
}

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  source: LeadSource;
  status: LeadStatus;
  notes: LeadNote[];
  tasks: LeadTask[];
  activities: LeadActivity[];
  score?: number;
  createdAt: Date;
  updatedAt: Date;
}
