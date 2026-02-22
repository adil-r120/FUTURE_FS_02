import { useState, useCallback, useEffect, useMemo } from "react";
import { Lead, LeadStatus } from "@/types/lead";
import { mockLeads } from "@/data/mockLeads";
import SidebarNav from "@/components/SidebarNav";
import MobileHeader from "@/components/MobileHeader";
import StatsCards from "@/components/StatsCards";
import LeadTable from "@/components/LeadTable";
import LeadDialog from "@/components/LeadDialog";
import KanbanBoard from "@/components/KanbanBoard";
import { Button } from "@/components/ui/button";
import { Plus, LayoutGrid, List, BarChart3, FileUp, FileDown, Eraser, Sparkles, Rocket } from "lucide-react";
import AnalyticsView from "@/components/AnalyticsView";
import SettingsView from "@/components/SettingsView";
import DashboardIntelligence from "@/components/DashboardIntelligence";
import CleanupView from "@/components/CleanupView";
import { convertLeadsToCSV, downloadCSV, parseLeadsCSV } from "@/lib/csvUtils";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import StatusBadge from "@/components/StatusBadge";
import SourceBadge from "@/components/SourceBadge";
import LeadNotes from "@/components/LeadNotes";
import { Mail, Phone, Building2, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

type ViewMode = "table" | "kanban";

const Index = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("dashboard");
  const { toast } = useToast();

  // Persistent leads logic
  const storageKey = useMemo(() => `clms_leads_${user?.id || 'guest'}`, [user?.id]);

  const [leads, setLeads] = useState<Lead[]>(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Revive dates
        return parsed.map((l: any) => ({
          ...l,
          createdAt: new Date(l.createdAt),
          updatedAt: new Date(l.updatedAt),
          notes: l.notes.map((n: any) => ({ ...n, createdAt: new Date(n.createdAt) })),
          tasks: l.tasks.map((t: any) => ({ ...t, dueDate: new Date(t.dueDate) })),
          activities: l.activities.map((a: any) => ({ ...a, timestamp: new Date(a.timestamp) }))
        }));
      } catch (e) {
        console.error("Failed to parse saved leads", e);
      }
    }
    // New users (not Demo) start with 0 leads for a clean experience
    return user?.email === "demo@leadcrm.io" ? mockLeads : [];
  });

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(leads));
  }, [leads, storageKey]);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("table");
  const [detailLead, setDetailLead] = useState<Lead | null>(null);
  const [showCleanup, setShowCleanup] = useState(false);

  const getGreeting = () => {
    const hour = new Date().getHours();
    const name = user?.name.split(" ")[0] || "there";

    if (hour < 12) return `Good morning, ${name}`;
    if (hour < 18) return `Good afternoon, ${name}`;
    return `Good evening, ${name}`;
  };

  const getSubGreeting = () => {
    if (leads.length === 0) return "Ready to start growing your pipeline?";
    const convertedCount = leads.filter(l => l.status === "converted").length;
    if (convertedCount > 0) return `You've closed ${convertedCount} deals so far. Keep it up!`;
    return "Let's see what's happening with your leads today.";
  };

  const handleAddLead = useCallback(
    (data: Omit<Lead, "id" | "notes" | "tasks" | "activities" | "createdAt" | "updatedAt">) => {
      if (editingLead) {
        setLeads((prev) =>
          prev.map((l) =>
            l.id === editingLead.id
              ? { ...l, ...data, updatedAt: new Date() }
              : l
          )
        );
        toast({ title: "Lead updated", description: `${data.name} has been updated.` });
      } else {
        const newLead: Lead = {
          ...data,
          id: Date.now().toString(),
          notes: [],
          tasks: [],
          activities: [
            { id: Date.now().toString() + "-init", type: "lead_created", description: "Lead added to system", timestamp: new Date() }
          ],
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        setLeads((prev) => [newLead, ...prev]);
        toast({ title: "Lead added", description: `${data.name} has been added.` });
      }
      setEditingLead(null);
    },
    [editingLead, toast]
  );

  const handleDelete = useCallback(
    (id: string) => {
      setLeads((prev) => prev.filter((l) => l.id !== id));
      toast({ title: "Lead deleted", description: "The lead has been removed." });
    },
    [toast]
  );

  const handleStatusChange = useCallback(
    (id: string, status: LeadStatus) => {
      setLeads((prev) =>
        prev.map((l) => (l.id === id ? {
          ...l,
          status,
          updatedAt: new Date(),
          activities: [
            ...l.activities,
            { id: Date.now().toString(), type: "status_change", description: `Status changed to ${status}`, timestamp: new Date() }
          ]
        } : l))
      );
      if (status === "converted") {
        toast({
          title: "Lead Converted! 🎉",
          description: "Congratulations on closing this lead. They've been moved to your success list.",
          className: "bg-green-600 text-white border-green-700"
        });
      } else {
        toast({ title: "Status updated", description: `Lead marked as ${status}.` });
      }
    },
    [toast]
  );

  const handleBulkStatusChange = useCallback(
    (ids: string[], status: LeadStatus) => {
      setLeads((prev) =>
        prev.map((l) => (ids.includes(l.id) ? {
          ...l,
          status,
          updatedAt: new Date(),
          activities: [
            ...l.activities,
            { id: Date.now().toString() + Math.random(), type: "status_change", description: `Bulk Status changed to ${status}`, timestamp: new Date() }
          ]
        } : l))
      );
      toast({ title: "Bulk update complete", description: `${ids.length} leads marked as ${status}.` });
    },
    [toast]
  );

  const handleBulkDelete = useCallback(
    (ids: string[]) => {
      setLeads((prev) => prev.filter((l) => !ids.includes(l.id)));
      toast({ title: "Leads deleted", description: `${ids.length} leads have been removed.` });
    },
    [toast]
  );


  const handleAddTask = useCallback((leadId: string, title: string, type: any, dueDate: Date) => {
    setLeads((prev) =>
      prev.map((l) =>
        l.id === leadId
          ? {
            ...l,
            tasks: [
              ...l.tasks,
              { id: Date.now().toString(), title, type, dueDate, completed: false },
            ],
            updatedAt: new Date(),
          }
          : l
      )
    );
    toast({ title: "Task added", description: "New follow-up task created." });
  }, [toast]);

  const handleToggleTask = useCallback((leadId: string, taskId: string) => {
    setLeads((prev) =>
      prev.map((l) => {
        if (l.id !== leadId) return l;
        const task = l.tasks.find(t => t.id === taskId);
        if (!task) return l;

        const isNowCompleted = !task.completed;
        const newActivities = [...l.activities];

        if (isNowCompleted) {
          newActivities.push({
            id: Date.now().toString(),
            type: "task_completed",
            description: `Completed task: ${task.title}`,
            timestamp: new Date()
          });
        }

        return {
          ...l,
          tasks: l.tasks.map(t => t.id === taskId ? { ...t, completed: isNowCompleted } : t),
          activities: newActivities,
          updatedAt: new Date(),
        };
      })
    );
  }, []);

  const handleExportCSV = useCallback(() => {
    const csv = convertLeadsToCSV(leads);
    downloadCSV(csv, "my_leads_export.csv");
    toast({ title: "Export successful", description: "Your leads have been exported to CSV." });
  }, [leads, toast]);

  const handleImportCSV = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const importedLeads = parseLeadsCSV(text);
      if (importedLeads.length > 0) {
        setLeads(prev => [
          ...prev,
          ...importedLeads.map(l => ({
            ...l,
            id: `imported-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            notes: [],
            tasks: [],
            activities: [{ id: '1', type: 'lead_created', description: 'Imported via CSV', timestamp: new Date() }],
            createdAt: new Date(),
            updatedAt: new Date()
          } as Lead))
        ]);
        toast({ title: "Import successful", description: `Imported ${importedLeads.length} leads.` });
      } else {
        toast({ variant: "destructive", title: "Import failed", description: "Could not parse any valid leads from CSV." });
      }
    };
    reader.readAsText(file);
    event.target.value = "";
  };

  const handleAddNote = useCallback((leadId: string, content: string) => {
    setLeads((prev) =>
      prev.map((l) =>
        l.id === leadId
          ? {
            ...l,
            notes: [
              ...l.notes,
              { id: Date.now().toString(), content, createdAt: new Date() },
            ],
            activities: [
              ...l.activities,
              { id: Date.now().toString(), type: "note_added", description: "New note added", timestamp: new Date() }
            ],
            updatedAt: new Date(),
          }
          : l
      )
    );
  }, []);

  const openEditDialog = (lead: Lead) => {
    setEditingLead(lead);
    setDialogOpen(true);
  };

  const openAddDialog = () => {
    setEditingLead(null);
    setDialogOpen(true);
  };

  // Keep detailLead in sync with leads state
  const currentDetailLead = detailLead
    ? leads.find((l) => l.id === detailLead.id) || null
    : null;

  const ViewToggle = () => (
    <div className="flex items-center bg-muted rounded-lg p-0.5">
      <button
        onClick={() => setViewMode("table")}
        className={cn(
          "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all",
          viewMode === "table"
            ? "bg-card text-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        <List className="h-3.5 w-3.5" />
        Table
      </button>
      <button
        onClick={() => setViewMode("kanban")}
        className={cn(
          "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all",
          viewMode === "kanban"
            ? "bg-card text-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        <LayoutGrid className="h-3.5 w-3.5" />
        Board
      </button>
    </div>
  );

  const LeadsView = () => (
    <>
      {viewMode === "table" ? (
        <LeadTable
          leads={leads}
          onEdit={openEditDialog}
          onDelete={handleDelete}
          onStatusChange={handleStatusChange}
          onAddNote={handleAddNote}
          onAddTask={handleAddTask}
          onToggleTask={handleToggleTask}
          onBulkDelete={handleBulkDelete}
          onBulkStatusChange={handleBulkStatusChange}
        />
      ) : (
        <KanbanBoard
          leads={leads}
          onStatusChange={handleStatusChange}
          onEdit={openEditDialog}
          onCardClick={(lead) => setDetailLead(lead)}
        />
      )}
    </>
  );

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return (
          <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shrink-0 border border-primary/20">
                  <Sparkles className="h-6 w-6" />
                </div>
                <div>
                  <h1 className="text-2xl font-display font-bold text-foreground tracking-tight">
                    {getGreeting()}
                  </h1>
                  <p className="text-sm text-muted-foreground mt-0.5 font-medium">
                    {getSubGreeting()}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Button onClick={openAddDialog} className="gap-2 shadow-lg shadow-primary/20 hover:scale-105 transition-transform">
                  <Plus className="h-4 w-4" />
                  Add New Lead
                </Button>
              </div>
            </div>

            <StatsCards leads={leads} />

            <DashboardIntelligence
              leads={leads}
              onLeadClick={(lead) => {
                setDetailLead(lead);
                setActiveTab("leads");
              }}
              onToggleTask={handleToggleTask}
            />
          </div>
        );
      case "leads":
        return (
          <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <h1 className="text-2xl font-display font-bold text-foreground">Pipeline</h1>
                <p className="text-sm text-muted-foreground mt-1">
                  Manage {leads.length} potential growth opportunities
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 border-r pr-3 mr-1">
                  <Button variant="outline" size="sm" onClick={() => setShowCleanup(!showCleanup)} className={cn("gap-2 h-9", showCleanup && "bg-muted")}>
                    <Eraser className="h-4 w-4" />
                    <span className="hidden sm:inline">Clean Data</span>
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleExportCSV} className="gap-2 h-9">
                    <FileDown className="h-4 w-4" />
                    <span className="hidden sm:inline">Backup</span>
                  </Button>
                  <div className="relative">
                    <input
                      type="file"
                      id="csv-import"
                      accept=".csv"
                      className="hidden"
                      onChange={handleImportCSV}
                    />
                    <Button variant="outline" size="sm" onClick={() => document.getElementById('csv-import')?.click()} className="gap-2 h-9">
                      <FileUp className="h-4 w-4" />
                      <span className="hidden sm:inline">Restore</span>
                    </Button>
                  </div>
                </div>
                <ViewToggle />
                <Button onClick={openAddDialog} className="gap-2 h-9">
                  <Plus className="h-4 w-4" />
                  Add Lead
                </Button>
              </div>
            </div>

            {showCleanup ? (
              <CleanupView
                leads={leads}
                onDelete={handleDelete}
                onClose={() => setShowCleanup(false)}
              />
            ) : (
              <LeadsView />
            )}
          </div>
        );
      case "analytics":
        return (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h1 className="text-2xl font-display font-bold text-foreground">Growth Analytics</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Visualizing your success and conversion trends
              </p>
            </div>
            <AnalyticsView leads={leads} />
          </div>
        );
      case "settings":
        return <SettingsView />;
      default:
        return null;
    }
  };

  return (
    <div className="flex min-h-screen bg-background text-foreground selection:bg-primary/10">
      <SidebarNav activeTab={activeTab} onTabChange={setActiveTab} />
      <div className="flex-1 flex flex-col min-w-0">
        <MobileHeader activeTab={activeTab} onTabChange={setActiveTab} />
        <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full">
          {renderContent()}
        </main>
      </div>

      <LeadDialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) setEditingLead(null);
        }}
        lead={editingLead}
        onSave={handleAddLead}
      />

      {/* Kanban detail sheet */}
      <Sheet open={!!currentDetailLead} onOpenChange={(open) => !open && setDetailLead(null)}>
        <SheetContent className="sm:max-w-[440px] overflow-y-auto">
          {currentDetailLead && (
            <>
              <SheetHeader>
                <SheetTitle className="font-display text-xl">{currentDetailLead.name}</SheetTitle>
              </SheetHeader>
              <div className="mt-6 space-y-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-foreground">{currentDetailLead.email}</span>
                  </div>
                  {currentDetailLead.phone && (
                    <div className="flex items-center gap-3 text-sm">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span className="text-foreground">{currentDetailLead.phone}</span>
                    </div>
                  )}
                  {currentDetailLead.company && (
                    <div className="flex items-center gap-3 text-sm">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                      <span className="text-foreground">{currentDetailLead.company}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-3 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-foreground">
                      Added {currentDetailLead.createdAt.toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <StatusBadge status={currentDetailLead.status} />
                  <SourceBadge source={currentDetailLead.source} />
                </div>

                <div className="flex gap-2">
                  {(["new", "contacted", "converted", "lost"] as LeadStatus[]).map((s) => (
                    <Button
                      key={s}
                      variant={currentDetailLead.status === s ? "default" : "outline"}
                      size="sm"
                      className="text-xs capitalize"
                      onClick={() => handleStatusChange(currentDetailLead.id, s)}
                    >
                      {s}
                    </Button>
                  ))}
                </div>

                <div className="border-t border-border" />

                <LeadNotes
                  lead={currentDetailLead}
                  onAddNote={handleAddNote}
                />

                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setDetailLead(null);
                      openEditDialog(currentDetailLead);
                    }}
                  >
                    Edit Lead
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-destructive hover:text-destructive"
                    onClick={() => {
                      handleDelete(currentDetailLead.id);
                      setDetailLead(null);
                    }}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default Index;
