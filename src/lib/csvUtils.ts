import { Lead, LeadSource, LeadStatus } from "@/types/lead";

/**
 * Converts an array of leads to a CSV string.
 */
export const convertLeadsToCSV = (leads: Lead[]): string => {
    const headers = ["ID", "Name", "Email", "Phone", "Company", "Source", "Status", "Notes Count", "Created At"];
    const rows = leads.map(lead => [
        lead.id,
        `"${lead.name.replace(/"/g, '""')}"`,
        lead.email,
        lead.phone || "",
        `"${(lead.company || "").replace(/"/g, '""')}"`,
        lead.source,
        lead.status,
        lead.notes.length,
        lead.createdAt.toISOString()
    ]);

    return [headers.join(","), ...rows.map(row => row.join(","))].join("\n");
};

/**
 * Triggers a download of a CSV string as a file.
 */
export const downloadCSV = (csvContent: string, fileName: string = "leads_export.csv") => {
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", fileName);
        link.style.visibility = "hidden";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
};

/**
 * Basic CSV parser to handle lead imports.
 */
export const parseLeadsCSV = (csvText: string): Partial<Lead>[] => {
    const lines = csvText.split(/\r?\n/);
    if (lines.length < 2) return [];

    const headers = lines[0].split(",").map(h => h.trim().toLowerCase());
    const results: Partial<Lead>[] = [];

    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        // Simple split by comma, respecting quotes
        const values = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || [];
        const lead: any = {};

        headers.forEach((header, index) => {
            let value = (values[index] || "").replace(/^"|"$/g, "");

            if (header === "name") lead.name = value;
            if (header === "email") lead.email = value;
            if (header === "phone") lead.phone = value;
            if (header === "company") lead.company = value;
            if (header === "source") lead.source = value as LeadSource;
            if (header === "status") lead.status = value as LeadStatus;
        });

        if (lead.name && lead.email) {
            results.push(lead);
        }
    }

    return results;
};
