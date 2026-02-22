import { LeadSource } from "@/types/lead";
import { Badge } from "@/components/ui/badge";
import { Globe, Users, Share2, Mail, Phone, HelpCircle } from "lucide-react";

const sourceConfig: Record<LeadSource, { label: string; icon: React.ElementType }> = {
  website: { label: "Website", icon: Globe },
  referral: { label: "Referral", icon: Users },
  social: { label: "Social", icon: Share2 },
  email: { label: "Email", icon: Mail },
  phone: { label: "Phone", icon: Phone },
  other: { label: "Other", icon: HelpCircle },
};

interface SourceBadgeProps {
  source: LeadSource;
}

const SourceBadge = ({ source }: SourceBadgeProps) => {
  const config = sourceConfig[source];
  const Icon = config.icon;
  return (
    <Badge variant="secondary" className="font-normal text-xs gap-1 px-2 py-0.5">
      <Icon className="h-3 w-3" />
      {config.label}
    </Badge>
  );
};

export default SourceBadge;
