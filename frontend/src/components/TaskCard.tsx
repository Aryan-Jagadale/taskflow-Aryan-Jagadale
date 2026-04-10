import { Badge } from "@/components/ui/badge";
import { Task } from "@/types";
import { Calendar, User } from "lucide-react";
import { format } from "date-fns";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "@/lib/utils";

const priorityConfig = {
  low: { label: "Low", className: "bg-success/15 text-success border-success/20" },
  medium: { label: "Medium", className: "bg-warning/15 text-warning border-warning/20" },
  high: { label: "High", className: "bg-destructive/15 text-destructive border-destructive/20" },
};

interface TaskCardProps {
  task: Task;
  onClick: () => void;
}

export function TaskCard({ task, onClick }: TaskCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
    data: { task },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const priority = priorityConfig[task.priority];

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className={cn(
        "rounded-lg border bg-card p-3 shadow-sm cursor-grab active:cursor-grabbing transition-all hover:shadow-md",
        isDragging && "opacity-50 rotate-1 shadow-lg"
      )}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <h4 className="font-medium text-sm text-card-foreground leading-snug">{task.title}</h4>
        <Badge variant="outline" className={cn("shrink-0 text-[10px] px-1.5 py-0", priority.className)}>
          {priority.label}
        </Badge>
      </div>
      {task.description && (
        <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{task.description}</p>
      )}
      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        {task.dueDate && (
          <span className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {format(new Date(task.dueDate), "MMM d")}
          </span>
        )}
        {task.assignee && (
          <span className="flex items-center gap-1">
            <User className="h-3 w-3" />
            {task.assignee}
          </span>
        )}
      </div>
    </div>
  );
}
