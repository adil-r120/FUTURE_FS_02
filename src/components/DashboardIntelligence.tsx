import { Lead, LeadTask } from "@/types/lead";
import {
    AlertCircle,
    CheckCircle2,
    Clock,
    ArrowRight,
    Phone,
    Mail,
    Users,
    Zap,
    TrendingUp,
    History,
    Rocket,
    Plus,
    FileUp
} from "lucide-react";
import { format, isPast, isToday, differenceInDays } from "date-fns";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface DashboardIntelligenceProps {
    leads: Lead[];
    onLeadClick: (lead: Lead) => void;
    onToggleTask: (leadId: string, taskId: string) => void;
}

const DashboardIntelligence = ({ leads, onLeadClick, onToggleTask }: DashboardIntelligenceProps) => {
    // Empty State / Onboarding
    if (leads.length === 0) {
        return (
            <div className="bg-card rounded-2xl border border-border/60 shadow-xl overflow-hidden animate-fade-in">
                <div className="p-8 md:p-12 flex flex-col items-center text-center max-w-2xl mx-auto">
                    <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center text-primary mb-6 animate-pulse">
                        <Rocket className="h-10 w-10" />
                    </div>
                    <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground">Welcome to your new workspace!</h2>
                    <p className="text-muted-foreground mt-4 text-lg">
                        LeadFlow is designed to help you organize your business and grow your relationships.
                        Let's start by adding your first lead or importing a list.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-10 w-full">
                        <div className="bg-muted/50 p-6 rounded-xl border border-border/50 text-left hover:border-primary/50 transition-colors cursor-pointer group">
                            <div className="w-10 h-10 bg-background rounded-lg flex items-center justify-center mb-4 border shadow-sm group-hover:text-primary transition-colors">
                                <Plus className="h-5 w-5" />
                            </div>
                            <h3 className="font-bold text-foreground">Add a Lead</h3>
                            <p className="text-xs text-muted-foreground mt-1">Manually enter a new contact to start tracking their journey.</p>
                        </div>
                        <div className="bg-muted/50 p-6 rounded-xl border border-border/50 text-left hover:border-primary/50 transition-colors cursor-pointer group">
                            <div className="w-10 h-10 bg-background rounded-lg flex items-center justify-center mb-4 border shadow-sm group-hover:text-primary transition-colors">
                                <FileUp className="h-5 w-5" />
                            </div>
                            <h3 className="font-bold text-foreground">Import CSV</h3>
                            <p className="text-xs text-muted-foreground mt-1">Bulk upload your existing database from a CSV file.</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Get all tasks from all leads
    const allTasks = leads.flatMap(lead =>
        lead.tasks.map(task => ({ ...task, leadName: lead.name, leadId: lead.id }))
    );

    // Urgent Tasks: Overdue or Due Today
    const urgentTasks = allTasks
        .filter(t => !t.completed && (isPast(t.dueDate) || isToday(t.dueDate)))
        .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime())
        .slice(0, 5);

    // Stale Leads: No activity for more than 5 days
    const staleLeads = leads
        .filter(l => l.status !== "converted" && l.status !== "lost")
        .filter(l => differenceInDays(new Date(), l.updatedAt) >= 5)
        .sort((a, b) => a.updatedAt.getTime() - b.updatedAt.getTime())
        .slice(0, 5);

    // Calculate a basic "Pipeline Pulse"
    const conversionRate = leads.length > 0
        ? Math.round((leads.filter(l => l.status === "converted").length / leads.length) * 100)
        : 0;

    const getTaskIcon = (type: LeadTask["type"]) => {
        switch (type) {
            case "call": return <Phone className="h-3.5 w-3.5" />;
            case "email": return <Mail className="h-3.5 w-3.5" />;
            case "meeting": return <Users className="h-3.5 w-3.5" />;
            default: return <CheckCircle2 className="h-3.5 w-3.5" />;
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-7 gap-6">
            {/* Task Center - 4 columns */}
            <div className="lg:col-span-4 space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-display font-semibold flex items-center gap-2">
                        <Zap className="h-5 w-5 text-primary fill-primary" />
                        CRM Intelligence
                    </h2>
                </div>

                <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden min-h-[400px]">
                    <div className="p-4 border-b bg-muted/30">
                        <h3 className="text-sm font-bold flex items-center gap-2 uppercase tracking-wider text-muted-foreground">
                            Focus Tasks ({urgentTasks.length})
                        </h3>
                    </div>
                    <div className="divide-y divide-border">
                        {urgentTasks.map((task, index) => (
                            <div
                                key={task.id}
                                className="p-4 hover:bg-muted/30 transition-colors group animate-slide-in"
                                style={{ animationDelay: `${index * 50}ms` }}
                            >
                                <div className="flex items-center gap-4">
                                    <div className={cn(
                                        "flex items-center justify-center w-10 h-10 rounded-full shrink-0 border",
                                        isPast(task.dueDate) && !isToday(task.dueDate)
                                            ? "bg-destructive/10 text-destructive border-destructive/20"
                                            : "bg-primary/10 text-primary border-primary/20"
                                    )}>
                                        {getTaskIcon(task.type)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <p className="text-sm font-bold text-foreground truncate">{task.title}</p>
                                            {isPast(task.dueDate) && !isToday(task.dueDate) && (
                                                <span className="text-[10px] bg-destructive text-destructive-foreground px-1.5 py-0.5 rounded-full font-bold uppercase">Overdue</span>
                                            )}
                                        </div>
                                        <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1.5">
                                            <span className="hover:text-primary cursor-pointer font-medium" onClick={() => onLeadClick(leads.find(l => l.id === task.leadId)!)}>
                                                {task.leadName}
                                            </span>
                                            <span className="text-border">•</span>
                                            <span>{isToday(task.dueDate) ? "Due Today" : format(task.dueDate, "MMM d")}</span>
                                        </p>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => onToggleTask(task.leadId, task.id)}
                                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <CheckCircle2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                        {urgentTasks.length === 0 && (
                            <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
                                <div className="w-12 h-12 rounded-full bg-green-100 text-green-600 flex items-center justify-center mb-4 dark:bg-green-900/20">
                                    <CheckCircle2 className="h-6 w-6" />
                                </div>
                                <h4 className="text-sm font-bold">You're all caught up!</h4>
                                <p className="text-xs text-muted-foreground mt-1 max-w-[200px]">No urgent tasks requiring your attention today.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Health & Stale - 3 columns */}
            <div className="lg:col-span-3 space-y-4">
                <h2 className="text-lg font-display font-semibold flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    Pipeline Health
                </h2>

                <div className="space-y-4">
                    {/* Health Score Card */}
                    <div className="bg-primary rounded-xl p-5 text-primary-foreground shadow-lg shadow-primary/20 relative overflow-hidden group">
                        <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/10 rounded-full blur-xl group-hover:scale-150 transition-transform duration-500" />
                        <p className="text-xs font-bold uppercase tracking-widest opacity-80">Success Rate</p>
                        <div className="flex items-end gap-2 mt-1">
                            <span className="text-4xl font-display font-bold">{conversionRate}%</span>
                            <span className="text-sm font-medium mb-1 opacity-80">Conversion</span>
                        </div>
                        <div className="mt-4 h-1.5 w-full bg-white/20 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-white transition-all duration-1000"
                                style={{ width: `${conversionRate}%` }}
                            />
                        </div>
                    </div>

                    {/* Stale Leads Card */}
                    <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden flex-1">
                        <div className="p-4 border-b bg-muted/30 flex items-center justify-between">
                            <h3 className="text-sm font-bold flex items-center gap-2 uppercase tracking-wider text-muted-foreground">
                                Needs Attention
                            </h3>
                            <History className="h-3.5 w-3.5 text-muted-foreground/50" />
                        </div>
                        <div className="divide-y divide-border">
                            {staleLeads.map((lead, index) => (
                                <div
                                    key={lead.id}
                                    className="p-3.5 hover:bg-muted/30 transition-colors cursor-pointer animate-slide-in"
                                    onClick={() => onLeadClick(lead)}
                                    style={{ animationDelay: `${index * 50}ms` }}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-[10px] font-bold border shrink-0">
                                            {lead.name.split(" ").map(n => n[0]).join("")}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-bold truncate">{lead.name}</p>
                                            <p className="text-[10px] text-destructive font-medium mt-0.5">
                                                {differenceInDays(new Date(), lead.updatedAt)} days inactive
                                            </p>
                                        </div>
                                        <ArrowRight className="h-3.5 w-3.5 text-muted-foreground/30" />
                                    </div>
                                </div>
                            ))}
                            {staleLeads.length === 0 && (
                                <div className="p-8 text-center">
                                    <p className="text-xs text-muted-foreground">Everything is up to date!</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardIntelligence;
