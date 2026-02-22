import { useState } from "react";
import { Lead } from "@/types/lead";
import {
    ShieldAlert,
    Trash2,
    CheckCircle2,
    AlertTriangle,
    Mail,
    Flame
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { calculateLeadScore, getLeadHeat } from "@/lib/scoringUtils";
import { cn } from "@/lib/utils";

interface CleanupViewProps {
    leads: Lead[];
    onDelete: (id: string) => void;
    onClose: () => void;
}

const CleanupView = ({ leads, onDelete, onClose }: CleanupViewProps) => {
    // Find duplicates by email
    const emailMap: { [key: string]: Lead[] } = {};
    leads.forEach(lead => {
        const email = (lead.email || "").toLowerCase().trim();
        if (!email) return;
        if (!emailMap[email]) emailMap[email] = [];
        emailMap[email].push(lead);
    });

    const duplicateGroups = Object.entries(emailMap)
        .filter(([_, group]) => group.length > 1)
        .map(([email, group]) => ({ email, group }));

    const handleDelete = (id: string) => {
        onDelete(id);
        toast.success("Duplicate lead removed");
    };

    return (
        <div className="space-y-6 animate-fade-in py-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center dark:bg-amber-900/20">
                        <ShieldAlert className="h-5 w-5" />
                    </div>
                    <div>
                        <h2 className="text-xl font-display font-bold">Data Cleanup Tool</h2>
                        <p className="text-sm text-muted-foreground">Identify and resolve duplicate lead entries</p>
                    </div>
                </div>
                <Button variant="ghost" onClick={onClose} className="h-9 px-4">Back to Leads</Button>
            </div>

            <div className="grid gap-4">
                {duplicateGroups.length === 0 ? (
                    <div className="bg-card rounded-xl border border-dashed border-border p-12 text-center">
                        <div className="w-12 h-12 rounded-full bg-green-100 text-green-600 flex items-center justify-center mx-auto mb-4 dark:bg-green-900/20">
                            <CheckCircle2 className="h-6 w-6" />
                        </div>
                        <h3 className="font-bold">Database is Clean</h3>
                        <p className="text-sm text-muted-foreground mt-1">No duplicate email addresses found.</p>
                    </div>
                ) : (
                    duplicateGroups.map(({ email, group }, idx) => (
                        <div key={email} className="bg-card rounded-xl border border-border overflow-hidden shadow-sm animate-slide-in" style={{ animationDelay: `${idx * 50}ms` }}>
                            <div className="p-4 bg-muted/30 border-b flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Mail className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-sm font-bold">{email}</span>
                                </div>
                                <span className="text-[10px] font-bold bg-amber-500 text-white px-2 py-0.5 rounded-full uppercase">
                                    {group.length} Duplicates Found
                                </span>
                            </div>
                            <div className="divide-y divide-border">
                                {group.map((lead: Lead) => {
                                    const score = calculateLeadScore(lead);
                                    const heat = getLeadHeat(score);
                                    return (
                                        <div key={lead.id} className="p-4 flex items-center justify-between hover:bg-muted/10 transition-colors">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-[10px] font-bold border">
                                                    {lead.name.split(" ").map(n => n[0]).join("")}
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <p className="text-sm font-bold">{lead.name}</p>
                                                        <span className={cn(
                                                            "text-[10px] font-bold px-1.5 py-0.5 rounded border",
                                                            heat === "hot" ? "bg-red-500/10 text-red-500 border-red-500/20" :
                                                                heat === "warm" ? "bg-amber-500/10 text-amber-500 border-amber-500/20" :
                                                                    "bg-blue-500/10 text-blue-500 border-blue-500/20"
                                                        )}>
                                                            {score}
                                                        </span>
                                                        {heat === "hot" && <Flame className="h-3 w-3 text-red-500 fill-red-500 animate-pulse" />}
                                                    </div>
                                                    <p className="text-[10px] text-muted-foreground">Source: {lead.source} • Created: {lead.createdAt.toLocaleDateString()}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                                                    onClick={() => handleDelete(lead.id)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                            <div className="p-3 bg-amber-50 dark:bg-amber-950/20 px-4">
                                <p className="text-[10px] text-amber-700 dark:text-amber-400 flex items-center gap-2">
                                    <AlertTriangle className="h-3 w-3" />
                                    We recommend keeping the record with the most notes/activity as the primary.
                                </p>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default CleanupView;
