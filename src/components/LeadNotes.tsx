import { useState } from "react";
import { Lead, LeadNote } from "@/types/lead";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MessageSquare, Plus, Clock } from "lucide-react";

interface LeadNotesProps {
  lead: Lead;
  onAddNote: (leadId: string, content: string) => void;
}

const LeadNotes = ({ lead, onAddNote }: LeadNotesProps) => {
  const [newNote, setNewNote] = useState("");

  const handleSubmit = () => {
    if (!newNote.trim()) return;
    onAddNote(lead.id, newNote.trim());
    setNewNote("");
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm font-medium text-foreground">
        <MessageSquare className="h-4 w-4" />
        Notes ({lead.notes.length})
      </div>

      {/* Add note */}
      <div className="flex gap-2">
        <Textarea
          placeholder="Add a note..."
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          className="min-h-[72px] resize-none text-sm"
        />
      </div>
      <Button size="sm" onClick={handleSubmit} disabled={!newNote.trim()}>
        <Plus className="h-3.5 w-3.5 mr-1" />
        Add Note
      </Button>

      {/* Notes list */}
      <div className="space-y-3 mt-2">
        {lead.notes.length === 0 && (
          <p className="text-sm text-muted-foreground italic">No notes yet.</p>
        )}
        {[...lead.notes].reverse().map((note: LeadNote) => (
          <div
            key={note.id}
            className="bg-muted/50 rounded-lg p-3 text-sm animate-fade-in"
          >
            <p className="text-foreground leading-relaxed">{note.content}</p>
            <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              {note.createdAt.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LeadNotes;
