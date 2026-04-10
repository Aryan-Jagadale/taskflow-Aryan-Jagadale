import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { Task, TaskStatus, TaskPriority } from "@/types";
import { toast } from "sonner";

export function useTasks(projectId: string) {
  return useQuery({
    queryKey: ["tasks", projectId],
    queryFn: () => apiFetch<Task[]>(`/projects/${projectId}/tasks`),
    enabled: !!projectId,
  });
}

export function useCreateTask(projectId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      title: string;
      description?: string;
      priority?: TaskPriority;
      dueDate?: string;
      assignee?: string;
    }) =>
      apiFetch<Task>(`/projects/${projectId}/tasks`, {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tasks", projectId] });
      toast.success("Task created");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useUpdateTask(projectId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      ...data
    }: {
      id: string;
      title?: string;
      description?: string;
      status?: TaskStatus;
      priority?: TaskPriority;
      dueDate?: string | null;
      assignee?: string | null;
    }) =>
      apiFetch<Task>(`/tasks/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      }),
    onMutate: async (vars) => {
      await qc.cancelQueries({ queryKey: ["tasks", projectId] });
      const prev = qc.getQueryData<Task[]>(["tasks", projectId]);
      qc.setQueryData<Task[]>(["tasks", projectId], (old) =>
        old?.map((t) => (t.id === vars.id ? { ...t, ...vars } : t))
      );
      return { prev };
    },
    onError: (e: Error, _, ctx) => {
      if (ctx?.prev) qc.setQueryData(["tasks", projectId], ctx.prev);
      toast.error(e.message);
    },
    onSettled: () => qc.invalidateQueries({ queryKey: ["tasks", projectId] }),
  });
}

export function useDeleteTask(projectId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiFetch(`/tasks/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tasks", projectId] });
      toast.success("Task deleted");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}
