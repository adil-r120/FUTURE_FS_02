import { useState } from "react";
import { Lead, LeadStatus } from "@/types/lead";
import StatusBadge from "@/components/StatusBadge";
import SourceBadge from "@/components/SourceBadge";
import LeadNotes from "@/components/LeadNotes";
import LeadTasks from "@/components/LeadTasks";
import LeadTimeline from "@/components/LeadTimeline";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Search,
  MoreHorizontal,
  Edit,
  Trash2,
  ArrowUpDown,
  Eye,
  Mail,
  Phone,
  Building2,
  Calendar,
  ListTodo,
  History,
  MessageSquare,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { calculateLeadScore, getLeadHeat } from "@/lib/scoringUtils";
import { Flame, CheckSquare, Trash, CheckCircle, Zap, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";

interface LeadTableProps {
  leads: Lead[];
  onEdit: (lead: Lead) => void;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, status: LeadStatus) => void;
  onAddNote: (leadId: string, content: string) => void;
  onAddTask: (leadId: string, title: string, type: any, dueDate: Date) => void;
  onToggleTask: (leadId: string, taskId: string) => void;
  onBulkDelete?: (ids: string[]) => void;
  onBulkStatusChange?: (ids: string[], status: LeadStatus) => void;
}

const LeadTable = ({
  leads,
  onEdit,
  onDelete,
  onStatusChange,
  onAddNote,
  onAddTask,
  onToggleTask,
  onBulkDelete,
  onBulkStatusChange
}: LeadTableProps) => {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sourceFilter, setSourceFilter] = useState<string>("all");
  const [sortConfig, setSortConfig] = useState<{ key: keyof Lead; direction: "asc" | "desc" } | null>({ key: "createdAt", direction: "desc" });
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const toggleSort = (key: keyof Lead) => {
    let direction: "asc" | "desc" = "asc";
    if (sortConfig && sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const filtered = leads.filter((lead) => {
    const matchesSearch =
      lead.name.toLowerCase().includes(search.toLowerCase()) ||
      lead.email.toLowerCase().includes(search.toLowerCase()) ||
      (lead.company?.toLowerCase().includes(search.toLowerCase()) ?? false);
    const matchesStatus = statusFilter === "all" || lead.status === statusFilter;
    const matchesSource = sourceFilter === "all" || lead.source === sourceFilter;
    return matchesSearch && matchesStatus && matchesSource;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (!sortConfig) return 0;
    const { key, direction } = sortConfig;
    const valA = a[key] as any;
    const valB = b[key] as any;

    if (valA === undefined || valB === undefined) return 0;

    if (valA < valB) return direction === "asc" ? -1 : 1;
    if (valA > valB) return direction === "asc" ? 1 : -1;
    return 0;
  });

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <>
      {/* Filters */}
      <div className="flex flex-col lg:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search leads by name, email, or company..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-10 border-border/60 focus:border-primary/50 transition-colors"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px] h-10">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="new">New</SelectItem>
              <SelectItem value="contacted">Contacted</SelectItem>
              <SelectItem value="converted">Converted</SelectItem>
              <SelectItem value="lost">Lost</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sourceFilter} onValueChange={setSourceFilter}>
            <SelectTrigger className="w-[140px] h-10">
              <SelectValue placeholder="Source" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sources</SelectItem>
              <SelectItem value="website">Website</SelectItem>
              <SelectItem value="referral">Referral</SelectItem>
              <SelectItem value="social">Social</SelectItem>
              <SelectItem value="email">Email</SelectItem>
              <SelectItem value="phone">Phone</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-card rounded-xl border border-border/60 shadow-sm overflow-hidden animate-fade-in">
        <div className="overflow-x-auto custom-scrollbar">
          <Table className="min-w-[1000px] lg:min-w-full">
            <TableHeader className="bg-muted/30">
              <TableRow className="hover:bg-transparent border-b border-border/60">
                <TableHead className="w-[40px] py-4 px-4">
                  <Checkbox
                    checked={selectedIds.length === filtered.length && filtered.length > 0}
                    onCheckedChange={(checked) => {
                      if (checked) setSelectedIds(filtered.map(l => l.id));
                      else setSelectedIds([]);
                    }}
                  />
                </TableHead>
                <TableHead className="font-semibold text-foreground py-4 cursor-pointer select-none" onClick={() => toggleSort("name")}>
                  <div className="flex items-center gap-1.5 hover:text-primary transition-colors">
                    Name <ArrowUpDown className={cn("h-3 w-3", sortConfig?.key === "name" ? "text-primary" : "text-muted-foreground")} />
                  </div>
                </TableHead>
                <TableHead className="font-semibold text-foreground py-4">Contact & Activity</TableHead>
                <TableHead className="font-semibold text-foreground py-4 hidden md:table-cell cursor-pointer select-none" onClick={() => toggleSort("source")}>
                  <div className="flex items-center gap-1.5 hover:text-primary transition-colors">
                    Source <ArrowUpDown className={cn("h-3 w-3", sortConfig?.key === "source" ? "text-primary" : "text-muted-foreground")} />
                  </div>
                </TableHead>
                <TableHead className="font-semibold text-foreground py-4 cursor-pointer select-none" onClick={() => toggleSort("status")}>
                  <div className="flex items-center gap-1.5 hover:text-primary transition-colors">
                    Status <ArrowUpDown className={cn("h-3 w-3", sortConfig?.key === "status" ? "text-primary" : "text-muted-foreground")} />
                  </div>
                </TableHead>
                <TableHead className="font-semibold text-foreground py-4 hidden lg:table-cell cursor-pointer select-none" onClick={() => toggleSort("createdAt")}>
                  <div className="flex items-center gap-1.5 hover:text-primary transition-colors">
                    Date <ArrowUpDown className={cn("h-3 w-3", sortConfig?.key === "createdAt" ? "text-primary" : "text-muted-foreground")} />
                  </div>
                </TableHead>
                <TableHead className="font-semibold text-foreground py-4">Score</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="h-32 text-center text-muted-foreground">
                    No leads found.
                  </TableCell>
                </TableRow>
              )}
              {sorted.map((lead) => (
                <TableRow
                  key={lead.id}
                  className={cn(
                    "cursor-pointer group hover:bg-muted/50 transition-colors",
                    selectedIds.includes(lead.id) && "bg-muted/50"
                  )}
                  onClick={() => setSelectedLead(lead)}
                >
                  <TableCell className="py-4 px-4" onClick={(e) => e.stopPropagation()}>
                    <Checkbox
                      checked={selectedIds.includes(lead.id)}
                      onCheckedChange={(checked) => {
                        if (checked) setSelectedIds(prev => [...prev, lead.id]);
                        else setSelectedIds(prev => prev.filter(id => id !== lead.id));
                      }}
                    />
                  </TableCell>
                  <TableCell className="py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold border border-primary/20 flex-shrink-0">
                        {getInitials(lead.name)}
                      </div>
                      <div className="min-w-0">
                        <div className="font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                          {lead.name}
                        </div>
                        {lead.company && (
                          <div className="text-[11px] text-muted-foreground mt-0.5 truncate max-w-[150px]">
                            {lead.company}
                          </div>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="py-4">
                    <div className="flex flex-col gap-1">
                      <div className="text-sm text-muted-foreground flex items-center gap-2 group-hover:text-foreground transition-colors">
                        <Mail className="h-3 w-3 opacity-50" /> {lead.email}
                      </div>
                      {lead.notes.length > 0 ? (
                        <div className="text-[10px] text-muted-foreground/70 italic line-clamp-1 max-w-[200px]">
                          "{lead.notes[lead.notes.length - 1].content}"
                        </div>
                      ) : (
                        <div className="text-[10px] text-muted-foreground/40 italic">No notes yet</div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="py-4 hidden md:table-cell">
                    <SourceBadge source={lead.source} />
                  </TableCell>
                  <TableCell className="py-4">
                    <StatusBadge status={lead.status} />
                  </TableCell>
                  <TableCell className="py-4 hidden lg:table-cell">
                    <div className="flex flex-col text-xs">
                      <span>{lead.createdAt.toLocaleDateString()}</span>
                      <span className="text-muted-foreground">{lead.createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </TableCell>
                  <TableCell className="py-4">
                    {(() => {
                      const score = calculateLeadScore(lead);
                      const heat = getLeadHeat(score);
                      return (
                        <div className="flex items-center gap-1.5">
                          <span className={cn(
                            "text-xs font-bold px-2 py-0.5 rounded-full border",
                            heat === "hot" ? "bg-destructive/10 text-destructive border-destructive/20" :
                              heat === "warm" ? "bg-primary/10 text-primary border-primary/20" :
                                "bg-blue-500/10 text-blue-500 border-blue-500/20"
                          )}>
                            {score}
                          </span>
                          {heat === "hot" && <Flame className="h-3.5 w-3.5 text-destructive fill-destructive animate-pulse" />}
                        </div>
                      );
                    })()}
                  </TableCell>
                  <TableCell className="py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <div className="hidden sm:flex opacity-0 group-hover:opacity-100 transition-opacity gap-1 mr-2">
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={(e) => { e.stopPropagation(); window.location.href = `mailto:${lead.email}`; }}>
                          <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                        </Button>
                        {lead.phone && (
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={(e) => { e.stopPropagation(); window.location.href = `tel:${lead.phone}`; }}>
                            <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                          </Button>
                        )}
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                          <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-muted transition-colors">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setSelectedLead(lead); }}>
                            <Eye className="h-4 w-4 mr-2" /> View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit(lead); }}>
                            <Edit className="h-4 w-4 mr-2" /> Edit Lead
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={(e) => { e.stopPropagation(); onStatusChange(lead.id, "contacted"); }}
                            disabled={lead.status === "contacted"}
                          >
                            Mark as Contacted
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={(e) => { e.stopPropagation(); onStatusChange(lead.id, "converted"); }}
                            disabled={lead.status === "converted"}
                          >
                            Mark as Converted
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={(e) => { e.stopPropagation(); setDeleteId(lead.id); }}
                          >
                            <Trash2 className="h-4 w-4 mr-2" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Detail Sheet */}
      <Sheet open={!!selectedLead} onOpenChange={(open) => !open && setSelectedLead(null)}>
        <SheetContent className="sm:max-w-[440px] overflow-y-auto">
          {selectedLead && (
            <>
              <SheetHeader>
                <SheetTitle className="font-display text-xl">{selectedLead.name}</SheetTitle>
              </SheetHeader>
              <div className="mt-6 space-y-6">
                {/* Info */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-foreground">{selectedLead.email}</span>
                  </div>
                  {selectedLead.phone && (
                    <div className="flex items-center gap-3 text-sm">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span className="text-foreground">{selectedLead.phone}</span>
                    </div>
                  )}
                  {selectedLead.company && (
                    <div className="flex items-center gap-3 text-sm">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                      <span className="text-foreground">{selectedLead.company}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-3 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-foreground">
                      Added {selectedLead.createdAt.toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                </div>

                {/* Status & Source */}
                <div className="flex flex-col gap-3">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status & Source</p>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={selectedLead.status} />
                    <SourceBadge source={selectedLead.source} />
                    {selectedLead.tasks.filter(t => !t.completed).length > 0 && (
                      <span className="flex items-center gap-1 text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full font-bold">
                        <ListTodo className="h-2.5 w-2.5" />
                        {selectedLead.tasks.filter(t => !t.completed).length} Pending
                      </span>
                    )}
                  </div>
                </div>

                {/* Quick status change */}
                <div className="flex gap-2">
                  {(["new", "contacted", "converted", "lost"] as LeadStatus[]).map((s) => (
                    <Button
                      key={s}
                      variant={selectedLead.status === s ? "default" : "outline"}
                      size="sm"
                      className="text-xs capitalize"
                      onClick={() => {
                        onStatusChange(selectedLead.id, s);
                        setSelectedLead({ ...selectedLead, status: s });
                      }}
                    >
                      {s}
                    </Button>
                  ))}
                </div>

                {/* Content Tabs */}
                <Tabs defaultValue="notes" className="w-full">
                  <TabsList className="grid w-full grid-cols-3 mb-6">
                    <TabsTrigger value="notes" className="gap-2">
                      <MessageSquare className="h-4 w-4" /> Notes
                    </TabsTrigger>
                    <TabsTrigger value="tasks" className="gap-2 text-xs">
                      <ListTodo className="h-4 w-4" /> Tasks
                    </TabsTrigger>
                    <TabsTrigger value="timeline" className="gap-2 text-xs">
                      <History className="h-4 w-4" /> Timeline
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="notes" className="mt-0">
                    <LeadNotes
                      lead={selectedLead}
                      onAddNote={(leadId, content) => {
                        onAddNote(leadId, content);
                        const newNote = { id: Date.now().toString(), content, createdAt: new Date() };
                        setSelectedLead({ ...selectedLead, notes: [...selectedLead.notes, newNote] });
                      }}
                    />
                  </TabsContent>

                  <TabsContent value="tasks" className="mt-0">
                    <LeadTasks
                      tasks={selectedLead.tasks}
                      onAddTask={(title, type, dueDate) => {
                        onAddTask(selectedLead.id, title, type, dueDate);
                        const newTask = { id: Date.now().toString(), title, type, dueDate, completed: false };
                        setSelectedLead({ ...selectedLead, tasks: [...selectedLead.tasks, newTask] });
                      }}
                      onToggleTask={(taskId) => {
                        onToggleTask(selectedLead.id, taskId);
                        const updatedTasks = selectedLead.tasks.map(t =>
                          t.id === taskId ? { ...t, completed: !t.completed } : t
                        );
                        setSelectedLead({ ...selectedLead, tasks: updatedTasks });
                      }}
                    />
                  </TabsContent>

                  <TabsContent value="timeline" className="mt-0">
                    <LeadTimeline activities={selectedLead.activities} />
                  </TabsContent>
                </Tabs>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Bulk actions bar */}
      {selectedIds.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-foreground text-background px-4 md:px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 md:gap-6 animate-in fade-in slide-in-from-bottom-4 duration-300 z-50 border border-border/10 max-w-[95vw]">
          <div className="flex items-center gap-2 md:gap-3 pr-3 md:pr-6 border-r border-background/20">
            <div className="w-5 h-5 md:w-6 md:h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-[10px] font-bold">
              {selectedIds.length}
            </div>
            <span className="text-xs md:text-sm font-bold whitespace-nowrap hidden sm:inline">Leads Selected</span>
          </div>
          <div className="flex items-center gap-1 md:gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 md:h-9 text-[10px] md:text-xs font-bold gap-2 hover:bg-background/10 hover:text-background px-2 md:px-3"
              onClick={() => {
                onBulkStatusChange?.(selectedIds, "contacted");
                setSelectedIds([]);
              }}
            >
              <CheckCircle className="h-3.5 w-3.5" />
              <span className="hidden md:inline">Mark Contacted</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 md:h-9 text-[10px] md:text-xs font-bold gap-2 hover:bg-background/10 hover:text-background px-2 md:px-3"
              onClick={() => {
                onBulkStatusChange?.(selectedIds, "converted");
                setSelectedIds([]);
              }}
            >
              <Zap className="h-3.5 w-3.5" />
              <span className="hidden md:inline">Mark Converted</span>
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 md:h-9 text-[10px] md:text-xs font-bold gap-2 hover:bg-background/10 hover:text-background px-2 md:px-3">
                  <MoreHorizontal className="h-3.5 w-3.5" />
                  <span className="hidden md:inline">More</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => {
                  onBulkDelete?.(selectedIds);
                  setSelectedIds([]);
                }} className="text-destructive focus:text-destructive">
                  <Trash className="h-4 w-4 mr-2" /> Delete Selected
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-background/40 hover:text-background"
            onClick={() => setSelectedIds([])}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this lead?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The lead and all associated notes will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteId) onDelete(deleteId);
                setDeleteId(null);
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default LeadTable;
