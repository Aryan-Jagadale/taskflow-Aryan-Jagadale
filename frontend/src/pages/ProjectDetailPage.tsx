import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from "@dnd-kit/core";
import { useProject, useUpdateProject, useDeleteProject } from "@/hooks/useProjects";
import { useTasks, useCreateTask, useUpdateTask, useDeleteTask } from "@/hooks/useTasks";
import { Navbar } from "@/components/Navbar";
import { KanbanColumn } from "@/components/KanbanColumn";
import { TaskModal } from "@/components/TaskModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Edit, Trash2, Plus } from "lucide-react";
import { Task, TaskStatus } from "@/types";

const COLUMNS: TaskStatus[] = ["todo", "in_progress", "done"];

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: project, isLoading: projLoading } = useProject(id!);
  const { data: tasks, isLoading: tasksLoading } = useTasks(id!);
  const createTask = useCreateTask(id!);
  const updateTask = useUpdateTask(id!);
  const deleteTask = useDeleteTask(id!);
  const updateProject = useUpdateProject();
  const deleteProject = useDeleteProject();

  const [editProject, setEditProject] = useState(false);
  const [editName, setEditName] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [taskModal, setTaskModal] = useState<{ open: boolean; task: Task | null }>({
    open: false,
    task: null,
  });
  const [createModal, setCreateModal] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const tasksByStatus = (status: TaskStatus) =>
    (tasks || []).filter((t) => t.status === status);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const taskId = active.id as string;
    const overId = over.id as string;

    // Check if dropped on a column
    if (COLUMNS.includes(overId as TaskStatus)) {
      const task = tasks?.find((t) => t.id === taskId);
      if (task && task.status !== overId) {
        updateTask.mutate({ id: taskId, status: overId as TaskStatus });
      }
    }
    // Check if dropped on another task
    else {
      const overTask = tasks?.find((t) => t.id === overId);
      const dragTask = tasks?.find((t) => t.id === taskId);
      if (overTask && dragTask && dragTask.status !== overTask.status) {
        updateTask.mutate({ id: taskId, status: overTask.status });
      }
    }
  };

  const handleDragOver = (_event: DragOverEvent) => {
    // visual feedback handled by useDroppable
  };

  const openEditProject = () => {
    if (project) {
      setEditName(project.name);
      setEditDesc(project.description);
      setEditProject(true);
    }
  };

  const saveProject = () => {
    updateProject.mutate(
      { id: id!, name: editName, description: editDesc },
      { onSuccess: () => setEditProject(false) }
    );
  };

  const handleDeleteProject = () => {
    deleteProject.mutate(id!, { onSuccess: () => navigate("/projects") });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container py-6">
        {projLoading ? (
          <Skeleton className="h-20 w-full rounded-xl mb-6" />
        ) : project ? (
          <div className="mb-6 animate-fade-in">
            <Button variant="ghost" size="sm" onClick={() => navigate("/projects")} className="mb-4">
              <ArrowLeft className="mr-1 h-4 w-4" /> Back to Projects
            </Button>
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-foreground">{project.name}</h1>
                <p className="text-muted-foreground mt-1">{project.description}</p>
              </div>
              <div className="flex gap-2 shrink-0">
                <Button variant="outline" size="sm" onClick={openEditProject}>
                  <Edit className="mr-1 h-4 w-4" /> Edit
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
                      <Trash2 className="mr-1 h-4 w-4" /> Delete
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete project?</AlertDialogTitle>
                      <AlertDialogDescription>
                        All tasks in this project will also be deleted.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDeleteProject}>Delete</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
                <Button size="sm" onClick={() => setCreateModal(true)}>
                  <Plus className="mr-1 h-4 w-4" /> Add Task
                </Button>
              </div>
            </div>
          </div>
        ) : null}

        {tasksLoading ? (
          <div className="flex gap-4 overflow-x-auto pb-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-64 min-w-[280px] flex-1 rounded-xl" />
            ))}
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragEnd={handleDragEnd}
            onDragOver={handleDragOver}
          >
            <div className="flex gap-4 overflow-x-auto pb-4">
              {COLUMNS.map((status) => (
                <KanbanColumn
                  key={status}
                  status={status}
                  tasks={tasksByStatus(status)}
                  onTaskClick={(task) => setTaskModal({ open: true, task })}
                />
              ))}
            </div>
          </DndContext>
        )}

        {/* Edit project modal */}
        <Dialog open={editProject} onOpenChange={setEditProject}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Project</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input value={editName} onChange={(e) => setEditName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea value={editDesc} onChange={(e) => setEditDesc(e.target.value)} />
              </div>
              <Button onClick={saveProject} className="w-full" disabled={updateProject.isPending}>
                Save
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Create task modal */}
        <TaskModal
          open={createModal}
          onClose={() => setCreateModal(false)}
          onSave={(data) => {
            createTask.mutate(data, { onSuccess: () => setCreateModal(false) });
          }}
          isPending={createTask.isPending}
        />

        {/* Edit task modal */}
        <TaskModal
          key={taskModal.task?.id || "new"}
          open={taskModal.open}
          onClose={() => setTaskModal({ open: false, task: null })}
          task={taskModal.task}
          onSave={(data) => {
            if (taskModal.task) {
              updateTask.mutate(
                { id: taskModal.task.id, ...data },
                { onSuccess: () => setTaskModal({ open: false, task: null }) }
              );
            }
          }}
          onDelete={(taskId) => {
            deleteTask.mutate(taskId, {
              onSuccess: () => setTaskModal({ open: false, task: null }),
            });
          }}
          isPending={updateTask.isPending}
        />
      </main>
    </div>
  );
}
