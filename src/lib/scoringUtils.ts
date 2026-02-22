import { Lead } from "@/types/lead";
import { differenceInDays } from "date-fns";

/**
 * Calculates a lead score (0-100) based on activity, notes, and status.
 */
export const calculateLeadScore = (lead: Lead): number => {
    let score = 20; // Base score

    // Status-based scoring
    if (lead.status === "contacted") score += 20;
    if (lead.status === "converted") score += 50;
    if (lead.status === "lost") score -= 30;

    // Notes-based scoring
    score += lead.notes.length * 5;

    // Task-based scoring
    const completedTasks = lead.tasks.filter(t => t.completed).length;
    score += completedTasks * 10;

    // Activity-based scoring (recency)
    const recentActivities = lead.activities.filter(a => differenceInDays(new Date(), a.timestamp) <= 7);
    score += recentActivities.length * 5;

    // Cleanup: clamp between 0 and 100
    return Math.min(Math.max(score, 0), 100);
};

export type LeadHeat = "cold" | "warm" | "hot";

/**
 * Categorizes a score into a heatmap level.
 */
export const getLeadHeat = (score: number): LeadHeat => {
    if (score >= 70) return "hot";
    if (score >= 40) return "warm";
    return "cold";
};
