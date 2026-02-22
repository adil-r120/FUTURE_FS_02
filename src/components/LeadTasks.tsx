import { useState } from "react";
import { LeadTask } from "@/types/lead";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Plus,
    Calendar as CalendarIcon,
    Phone,
    Mail,
    Users,
    CheckCircle2,
    Clock
} from "lucide-react";
import { format, isPast, isToday } from "date-fns";
import { cn } from "@/lib/utils";

interface LeadTasksProps {
    tasks: LeadTask[];
    onAddTask: (title: string, type: LeadTask["type"], dueDate: Date) => void;
    onToggleTask: (taskId: string) => void;
}

const LeadTasks = ({ tasks, onAddTask, onToggleTask }: LeadTasksProps) => {
    const [isAdding, setIsAdding] = useState(false);
    const [newTitle, setNewTitle] = useState("");
    const [newType, setNewType] = useState<LeadTask["type"]>("todo");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTitle.trim()) return;
        onAddTask(newTitle, newType, new Date()); // Default to today for simplicity in UI
        setNewTitle("");
        setIsAdding(false);
    };

    const getTaskIcon = (type: LeadTask["type"]) => {
        switch (type) {
            case "call": return <Phone className="h-3.5 w-3.5" />;
            case "email": return <Mail className="h-3.5 w-3.5" />;
            case "meeting": return <Users className="h-3.5 w-3.5" />;
            default: return <CheckCircle2 className="h-3.5 w-3.5" />;
        }
    };

    const sortedTasks = [...tasks].sort((a, b) => {
        if (a.completed !== b.completed) return a.completed ? 1 : -1;
        return a.dueDate.getTime() - b.dueDate.getTime();
    });

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold flex items-center gap-2">
                    <Clock className="h-4 w-4 text-primary" />
                    Pending Tasks
                </h3>
                {!isAdding && (
                    <Button variant="ghost" size="sm" onClick={() => setIsAdding(true)} className="h-8 px-2 text-xs gap-1">
                        <Plus className="h-3 w-3" /> Add Task
                    </Button>
                )}
            </div>

            {isAdding && (
                <form onSubmit={handleSubmit} className="p-3 border rounded-lg bg-muted/30 space-y-3 animate-slide-in">
                    <Input
                        autoFocus
                        placeholder="What needs to be done?"
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                        className="h-8 text-sm"
                    />
                    <div className="flex items-center justify-between gap-2">
                        <div className="flex gap-1">
                            {(["todo", "call", "email", "meeting"] as const).map((t) => (
                                <button
                                    key={t}
                                    type="button"
                                    onClick={() => setNewType(t)}
                                    className={cn(
                                        "p-1.5 rounded-md border transition-all",
                                        newType === t ? "bg-primary text-primary-foreground border-primary" : "bg-background border-border hover:border-primary/50"
                                    )}
                                >
                                    {getTaskIcon(t)}
                                </button>
                            ))}
                        </div>
                        <div className="flex gap-2">
                            <Button type="button" variant="ghost" size="sm" onClick={() => setIsAdding(false)} className="h-8 px-3 text-xs">Cancel</Button>
                            <Button type="submit" size="sm" className="h-8 px-3 text-xs">Add</Button>
                        </div>
                    </div>
                </form>
            )}

            <div className="space-y-2">
                {sortedTasks.map((task) => {
                    const isOverdue = !task.completed && isPast(task.dueDate) && !isToday(task.dueDate);
                    return (
                        <div key={task.id} className={cn(
                            "flex items-center gap-3 p-3 rounded-lg border transition-all group",
                            task.completed ? "opacity-60 bg-muted/20" : "bg-card hover:border-primary/30 shadow-sm"
                        )}>
                            <Checkbox
                                checked={task.completed}
                                onCheckedChange={() => onToggleTask(task.id)}
                                className="rounded-full h-5 w-5"
                            />
                            <div className="flex-1 min-w-0">
                                <p className={cn(
                                    "text-sm font-medium leading-tight truncate",
                                    task.completed && "line-through text-muted-foreground"
                                )}>
                                    {task.title}
                                </p>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="flex items-center gap-1 text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
                                        {getTaskIcon(task.type)}
                                        {task.type}
                                    </span>
                                    <span className={cn(
                                        "flex items-center gap-1 text-[10px]",
                                        isOverdue ? "text-destructive font-bold" : "text-muted-foreground"
                                    )}>
                                        <CalendarIcon className="h-2.5 w-2.5" />
                                        {format(task.dueDate, "MMM d")}
                                    </span>
                                </div>
                            </div>
                        </div>
                    );
                })}
                {tasks.length === 0 && !isAdding && (
                    <div className="text-center py-8 border-2 border-dashed rounded-lg">
                        <p className="text-xs text-muted-foreground">No tasks scheduled.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default LeadTasks;
