import { useState, useRef } from "react";
import { Lead, LeadStatus } from "@/types/lead";
import StatusBadge from "@/components/StatusBadge";
import SourceBadge from "@/components/SourceBadge";
import { cn } from "@/lib/utils";
import { GripVertical, Mail, Building2, MessageSquare, Search, ListTodo, History, Flame } from "lucide-react";
import { calculateLeadScore, getLeadHeat } from "@/lib/scoringUtils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface KanbanBoardProps {
  leads: Lead[];
  onStatusChange: (id: string, status: LeadStatus) => void;
  onEdit: (lead: Lead) => void;
  onCardClick: (lead: Lead) => void;
}

const columns: { status: LeadStatus; label: string; colorVar: string }[] = [
  { status: "new", label: "New", colorVar: "bg-status-new" },
  { status: "contacted", label: "Contacted", colorVar: "bg-status-contacted" },
  { status: "converted", label: "Converted", colorVar: "bg-status-converted" },
  { status: "lost", label: "Lost", colorVar: "bg-status-lost" },
];

const KanbanBoard = ({ leads, onStatusChange, onEdit, onCardClick }: KanbanBoardProps) => {
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<LeadStatus | null>(null);
  const [search, setSearch] = useState("");
  const [sourceFilter, setSourceFilter] = useState<string>("all");
  const dragCounter = useRef<Record<string, number>>({});

  const filteredLeads = leads.filter((lead) => {
    const matchesSearch =
      lead.name.toLowerCase().includes(search.toLowerCase()) ||
      lead.email.toLowerCase().includes(search.toLowerCase()) ||
      (lead.company?.toLowerCase().includes(search.toLowerCase()) ?? false);
    const matchesSource = sourceFilter === "all" || lead.source === sourceFilter;
    return matchesSearch && matchesSource;
  });

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  const handleDragStart = (e: React.DragEvent, leadId: string) => {
    setDraggedId(leadId);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", leadId);
    // Make the drag image slightly transparent
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = "0.5";
    }
  };

  const handleDragEnd = (e: React.DragEvent) => {
    setDraggedId(null);
    setDragOverColumn(null);
    dragCounter.current = {};
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = "1";
    }
  };

  const handleDragEnter = (e: React.DragEvent, status: LeadStatus) => {
    e.preventDefault();
    dragCounter.current[status] = (dragCounter.current[status] || 0) + 1;
    setDragOverColumn(status);
  };

  const handleDragLeave = (e: React.DragEvent, status: LeadStatus) => {
    e.preventDefault();
    dragCounter.current[status] = (dragCounter.current[status] || 0) - 1;
    if (dragCounter.current[status] <= 0) {
      dragCounter.current[status] = 0;
      if (dragOverColumn === status) {
        setDragOverColumn(null);
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent, status: LeadStatus) => {
    e.preventDefault();
    const leadId = e.dataTransfer.getData("text/plain");
    if (leadId) {
      const lead = leads.find((l) => l.id === leadId);
      if (lead && lead.status !== status) {
        onStatusChange(leadId, status);
      }
    }
    setDraggedId(null);
    setDragOverColumn(null);
    dragCounter.current = {};
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col lg:flex-row gap-3 mb-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search in board..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-10 border-border/60 focus:border-primary/50 transition-colors bg-card"
          />
        </div>
        <Select value={sourceFilter} onValueChange={setSourceFilter}>
          <SelectTrigger className="w-[140px] h-10 bg-card">
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 min-h-[500px]">
        {columns.map((col) => {
          const columnLeads = filteredLeads.filter((l) => l.status === col.status);
          const isOver = dragOverColumn === col.status;

          return (
            <div
              key={col.status}
              className={cn(
                "flex flex-col rounded-xl border border-border bg-muted/40 transition-colors duration-200 shadow-sm",
                isOver && "border-primary bg-primary/5 ring-4 ring-primary/5"
              )}
              onDragEnter={(e) => handleDragEnter(e, col.status)}
              onDragLeave={(e) => handleDragLeave(e, col.status)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, col.status)}
            >
              {/* Column header */}
              <div className="flex items-center gap-2 px-4 py-3 border-b border-border/60 bg-muted/20">
                <div className={cn("w-2 h-2 rounded-full", col.colorVar)} />
                <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">{col.label}</h3>
                <span className="ml-auto text-[10px] font-bold text-muted-foreground bg-background border border-border rounded-full px-2 py-0.5 min-w-[20px] text-center">
                  {columnLeads.length}
                </span>
              </div>

              {/* Cards */}
              <div className="flex-1 p-2 space-y-2 overflow-y-auto max-h-[calc(100vh-360px)] custom-scrollbar">
                {columnLeads.length === 0 && (
                  <div className={cn(
                    "flex flex-col items-center justify-center h-24 rounded-lg border-2 border-dashed transition-colors gap-2",
                    isOver ? "border-primary bg-primary/5" : "border-border/40"
                  )}>
                    <p className="text-[10px] font-medium text-muted-foreground/60">
                      {isOver ? "Release to drop" : "Empty"}
                    </p>
                  </div>
                )}
                {columnLeads.map((lead) => (
                  <div
                    key={lead.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, lead.id)}
                    onDragEnd={handleDragEnd}
                    onClick={() => onCardClick(lead)}
                    className={cn(
                      "bg-card rounded-lg border border-border/80 p-3 cursor-grab active:cursor-grabbing",
                      "hover:shadow-lg hover:border-primary/30 transition-all duration-200",
                      "group select-none relative",
                      draggedId === lead.id && "opacity-40 scale-95"
                    )}
                  >
                    {/* Header: Avatar + Name */}
                    <div className="flex items-start gap-2.5 mb-2.5">
                      <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] font-bold border border-primary/20 flex-shrink-0">
                        {getInitials(lead.name)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className="text-xs font-bold text-foreground truncate group-hover:text-primary transition-colors">
                            {lead.name}
                          </p>
                          {getLeadHeat(calculateLeadScore(lead)) === "hot" && (
                            <Flame className="h-3 w-3 text-red-500 fill-red-500 animate-pulse" />
                          )}
                        </div>
                        {lead.company && (
                          <div className="flex items-center gap-1 mt-0.5">
                            <Building2 className="h-2.5 w-2.5 text-muted-foreground/70 flex-shrink-0" />
                            <p className="text-[10px] text-muted-foreground truncate">
                              {lead.company}
                            </p>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        {/* Mobile Quick Move Menu */}
                        <div className="md:hidden" onClick={(e) => e.stopPropagation()}>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground/40 hover:text-primary">
                                <History className="h-3.5 w-3.5" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-40">
                              <div className="px-2 py-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                                Move to...
                              </div>
                              <DropdownMenuSeparator />
                              {columns.map((col) => (
                                <DropdownMenuItem
                                  key={col.status}
                                  disabled={lead.status === col.status}
                                  onClick={() => onStatusChange(lead.id, col.status)}
                                  className="text-xs font-medium"
                                >
                                  <div className={cn("w-2 h-2 rounded-full mr-2", col.colorVar)} />
                                  {col.label}
                                </DropdownMenuItem>
                              ))}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                        <GripVertical className="h-3.5 w-3.5 text-muted-foreground/20 group-hover:text-muted-foreground/50 transition-colors hidden md:block" />
                      </div>
                    </div>

                    {/* Email */}
                    <div className="flex items-center gap-1.5 px-0.5">
                      <Mail className="h-2.5 w-2.5 text-muted-foreground/60 flex-shrink-0" />
                      <p className="text-[10px] text-muted-foreground truncate font-medium">{lead.email}</p>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/40">
                      <SourceBadge source={lead.source} />
                      <div className="flex items-center gap-1.5">
                        {lead.tasks.filter(t => !t.completed).length > 0 && (
                          <div className="flex items-center gap-1 text-[10px] font-bold text-amber-500 bg-amber-500/10 px-1.5 py-0.5 rounded-md">
                            <ListTodo className="h-2.5 w-2.5" />
                            {lead.tasks.filter(t => !t.completed).length}
                          </div>
                        )}
                        {lead.notes.length > 0 && (
                          <div className="flex items-center gap-1 text-[10px] font-medium text-muted-foreground/70 bg-muted/50 px-1.5 py-0.5 rounded-md">
                            <MessageSquare className="h-2.5 w-2.5" />
                            {lead.notes.length}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default KanbanBoard;
