import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { Task, TaskStatus, TaskPriority } from "@/types";
import { toast } from "sonner";

interface TaskFilters {
  status?: TaskStatus;
}

export function useTasks(projectId: string, filters?: TaskFilters) {
  const normalizedStatus = filters?.status ?? "all";

  return useQuery({
    queryKey: ["tasks", projectId, normalizedStatus],
    queryFn: () => {
      const params = new URLSearchParams();
      params.set("projectId", projectId);
      if (filters?.status) {
        params.set("status", filters.status);
      }
      return apiFetch<Task[]>(`/tasks?${params.toString()}`);
    },
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
    onError: (e: Error) => toast.error(e.message),
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
