import { format } from "date-fns";
import { LeadActivity } from "@/types/lead";
import {
    History,
    MessageSquare,
    CheckCircle2,
    UserPlus,
    RefreshCw
} from "lucide-react";
import { cn } from "@/lib/utils";

interface LeadTimelineProps {
    activities: LeadActivity[];
}

const LeadTimeline = ({ activities }: LeadTimelineProps) => {
    const getIcon = (type: LeadActivity["type"]) => {
        switch (type) {
            case "lead_created": return <UserPlus className="h-4 w-4" />;
            case "note_added": return <MessageSquare className="h-4 w-4" />;
            case "status_change": return <RefreshCw className="h-4 w-4" />;
            case "task_completed": return <CheckCircle2 className="h-4 w-4" />;
            default: return <History className="h-4 w-4" />;
        }
    };

    const getIconBg = (type: LeadActivity["type"]) => {
        switch (type) {
            case "lead_created": return "bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400";
            case "note_added": return "bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-400";
            case "status_change": return "bg-purple-100 text-purple-600 dark:bg-purple-900/40 dark:text-purple-400";
            case "task_completed": return "bg-green-100 text-green-600 dark:bg-green-900/40 dark:text-green-400";
            default: return "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400";
        }
    };

    const sortedActivities = [...activities].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    if (sortedActivities.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
                    <History className="h-6 w-6 text-muted-foreground/50" />
                </div>
                <p className="text-sm text-muted-foreground">No activities recorded yet.</p>
            </div>
        );
    }

    return (
        <div className="relative space-y-6 before:absolute before:inset-0 before:ml-5 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-border before:via-border before:to-transparent">
            {sortedActivities.map((activity, index) => (
                <div key={activity.id} className="relative flex items-start gap-4 animate-slide-in" style={{ animationDelay: `${index * 50}ms` }}>
                    <div className={cn(
                        "relative z-10 flex items-center justify-center w-10 h-10 rounded-full border-4 border-background shrink-0",
                        getIconBg(activity.type)
                    )}>
                        {getIcon(activity.type)}
                    </div>
                    <div className="flex-1 pt-1.5 pb-2">
                        <div className="flex items-center justify-between gap-2 mb-1">
                            <p className="text-sm font-semibold tracking-tight leading-none">{activity.description}</p>
                            <time className="text-[10px] font-medium text-muted-foreground whitespace-nowrap">
                                {format(activity.timestamp, "MMM d, h:mm a")}
                            </time>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default LeadTimeline;
