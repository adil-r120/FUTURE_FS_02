import { Lead } from "@/types/lead";

export const mockLeads: Lead[] = [
  {
    id: "1",
    name: "Sarah Johnson",
    email: "sarah.johnson@techcorp.com",
    phone: "+1 (555) 234-5678",
    company: "TechCorp Industries",
    source: "website",
    status: "new",
    notes: [
      { id: "n1", content: "Filled out contact form requesting enterprise pricing.", createdAt: new Date("2025-02-01") },
    ],
    tasks: [],
    activities: [
      { id: "a1", type: "lead_created", description: "Lead created via website", timestamp: new Date("2025-02-01") }
    ],
    createdAt: new Date("2025-02-01"),
    updatedAt: new Date("2025-02-01"),
  },
  {
    id: "2",
    name: "Michael Chen",
    email: "m.chen@globalsoft.io",
    phone: "+1 (555) 345-6789",
    company: "GlobalSoft",
    source: "referral",
    status: "contacted",
    notes: [
      { id: "n2", content: "Referred by David Lee. Interested in our analytics suite.", createdAt: new Date("2025-01-20") },
      { id: "n3", content: "Had initial call — scheduling demo for next week.", createdAt: new Date("2025-01-25") },
    ],
    tasks: [
      { id: "t2", title: "Schedule demo", dueDate: new Date("2025-02-05"), completed: false, type: "meeting" }
    ],
    activities: [
      { id: "a2", type: "lead_created", description: "Lead referred by David Lee", timestamp: new Date("2025-01-20") },
      { id: "a3", type: "status_change", description: "Status changed to Contacted", timestamp: new Date("2025-01-25") }
    ],
    createdAt: new Date("2025-01-20"),
    updatedAt: new Date("2025-01-25"),
  },
  {
    id: "3",
    name: "Emily Rodriguez",
    email: "emily.r@startuplab.co",
    company: "StartupLab",
    source: "social",
    status: "converted",
    notes: [
      { id: "n4", content: "Found us on LinkedIn. Signed up for Pro plan.", createdAt: new Date("2025-01-10") },
    ],
    tasks: [],
    activities: [
      { id: "a4", type: "lead_created", description: "Lead found via social media", timestamp: new Date("2025-01-10") },
      { id: "a5", type: "status_change", description: "Status changed to Converted", timestamp: new Date("2025-01-28") }
    ],
    createdAt: new Date("2025-01-10"),
    updatedAt: new Date("2025-01-28"),
  },
  {
    id: "4",
    name: "James Whitfield",
    email: "jwhitfield@orionmedia.com",
    phone: "+1 (555) 456-7890",
    company: "Orion Media",
    source: "email",
    status: "new",
    notes: [],
    tasks: [
      { id: "t4", title: "Initial email outreach", dueDate: new Date("2025-02-10"), completed: false, type: "email" }
    ],
    activities: [
      { id: "a6", type: "lead_created", description: "Lead added via email campaign", timestamp: new Date("2025-02-03") }
    ],
    createdAt: new Date("2025-02-03"),
    updatedAt: new Date("2025-02-03"),
  },
  {
    id: "5",
    name: "Priya Patel",
    email: "priya@designhub.in",
    company: "DesignHub",
    source: "website",
    status: "contacted",
    notes: [
      { id: "n5", content: "Interested in design collaboration tools. Sent pricing sheet.", createdAt: new Date("2025-01-30") },
    ],
    tasks: [],
    activities: [
      { id: "a7", type: "lead_created", description: "Lead created via website", timestamp: new Date("2025-01-28") },
      { id: "a8", type: "status_change", description: "Status changed to Contacted", timestamp: new Date("2025-01-30") }
    ],
    createdAt: new Date("2025-01-28"),
    updatedAt: new Date("2025-01-30"),
  },
  {
    id: "6",
    name: "Alex Turner",
    email: "alex@cloudnine.dev",
    company: "CloudNine",
    source: "phone",
    status: "lost",
    notes: [
      { id: "n6", content: "Budget constraints — decided to go with a competitor.", createdAt: new Date("2025-01-15") },
    ],
    tasks: [],
    activities: [
      { id: "a9", type: "lead_created", description: "Lead added via phone call", timestamp: new Date("2025-01-05") },
      { id: "a10", type: "status_change", description: "Status changed to Lost", timestamp: new Date("2025-01-15") }
    ],
    createdAt: new Date("2025-01-05"),
    updatedAt: new Date("2025-01-15"),
  },
];
