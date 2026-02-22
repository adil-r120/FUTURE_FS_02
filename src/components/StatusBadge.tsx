import { LeadStatus } from "@/types/lead";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const statusConfig: Record<LeadStatus, { label: string; className: string }> = {
  new: { label: "New", className: "bg-status-new/15 text-status-new border-status-new/30" },
  contacted: { label: "Contacted", className: "bg-status-contacted/15 text-status-contacted border-status-contacted/30" },
  converted: { label: "Converted", className: "bg-status-converted/15 text-status-converted border-status-converted/30" },
  lost: { label: "Lost", className: "bg-status-lost/15 text-status-lost border-status-lost/30" },
};

interface StatusBadgeProps {
  status: LeadStatus;
  className?: string;
}

const StatusBadge = ({ status, className }: StatusBadgeProps) => {
  const config = statusConfig[status];
  return (
    <Badge
      variant="outline"
      className={cn(
        "font-medium text-xs px-2.5 py-0.5 rounded-full border",
        config.className,
        className
      )}
    >
      {config.label}
    </Badge>
  );
};

export default StatusBadge;
