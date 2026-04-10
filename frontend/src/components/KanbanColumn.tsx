import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { Task, TaskStatus } from "@/types";
import { TaskCard } from "./TaskCard";
import { cn } from "@/lib/utils";

const columnConfig: Record<TaskStatus, { title: string; color: string }> = {
  todo: { title: "To Do", color: "bg-muted-foreground" },
  in_progress: { title: "In Progress", color: "bg-primary" },
  done: { title: "Done", color: "bg-success" },
};

interface KanbanColumnProps {
  status: TaskStatus;
  tasks: Task[];
  onTaskClick: (task: Task) => void;
}

export function KanbanColumn({ status, tasks, onTaskClick }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: status });
  const config = columnConfig[status];

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "kanban-column transition-colors min-w-[280px] flex-1",
        isOver && "bg-primary/5 ring-2 ring-primary/20 ring-inset"
      )}
    >
      <div className="flex items-center gap-2 mb-3 px-1">
        <div className={cn("h-2 w-2 rounded-full", config.color)} />
        <h3 className="font-semibold text-sm text-foreground">{config.title}</h3>
        <span className="ml-auto text-xs text-muted-foreground bg-background rounded-full px-2 py-0.5">
          {tasks.length}
        </span>
      </div>
      <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-2 min-h-[60px]">
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} onClick={() => onTaskClick(task)} />
          ))}
        </div>
      </SortableContext>
    </div>
  );
}
