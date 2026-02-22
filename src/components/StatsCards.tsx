import { Lead } from "@/types/lead";
import { Users, UserCheck, UserPlus, UserX } from "lucide-react";

interface StatsCardsProps {
  leads: Lead[];
}

const StatsCards = ({ leads }: StatsCardsProps) => {
  const stats = [
    {
      label: "Total Leads",
      value: leads.length,
      icon: Users,
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      label: "New",
      value: leads.filter((l) => l.status === "new").length,
      icon: UserPlus,
      color: "text-status-new",
      bg: "bg-status-new/10",
    },
    {
      label: "Contacted",
      value: leads.filter((l) => l.status === "contacted").length,
      icon: UserCheck,
      color: "text-status-contacted",
      bg: "bg-status-contacted/10",
    },
    {
      label: "Converted",
      value: leads.filter((l) => l.status === "converted").length,
      icon: UserCheck,
      color: "text-status-converted",
      bg: "bg-status-converted/10",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div
            key={stat.label}
            className="bg-card rounded-xl border border-border p-5 shadow-sm animate-slide-in"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground font-medium">{stat.label}</p>
                <p className="text-3xl font-display font-bold mt-1 text-card-foreground">
                  {stat.value}
                </p>
              </div>
              <div className={`${stat.bg} rounded-xl p-3`}>
                <Icon className={`h-5 w-5 ${stat.color}`} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default StatsCards;
