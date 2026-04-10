import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { PaginatedResult, PaginationMeta, Project } from "@/types";
import { toast } from "sonner";

type LooseProjectsResponse =
  | Project[]
  | {
      data?: Project[];
      items?: Project[];
      projects?: Project[];
      page?: number;
      limit?: number;
      total?: number;
      totalPages?: number;
      pagination?: Partial<PaginationMeta>;
      meta?: Partial<PaginationMeta>;
    };

function normalizeProjectsResponse(
  payload: LooseProjectsResponse,
  fallbackPage: number,
  fallbackLimit: number
): PaginatedResult<Project> {
  if (Array.isArray(payload)) {
    const total = payload.length;
    return {
      items: payload,
      pagination: {
        page: fallbackPage,
        limit: fallbackLimit,
        total,
        totalPages: Math.max(1, Math.ceil(total / fallbackLimit)),
      },
    };
  }

  const items = payload.data ?? payload.items ?? payload.projects ?? [];
  const pagination = payload.pagination ?? payload.meta ?? {};
  const page = payload.page ?? pagination.page ?? fallbackPage;
  const limit = payload.limit ?? pagination.limit ?? fallbackLimit;
  const total = payload.total ?? pagination.total ?? items.length;
  const totalPages =
    payload.totalPages ??
    pagination.totalPages ??
    Math.max(1, Math.ceil(total / Math.max(limit, 1)));

  return {
    items,
    pagination: {
      page,
      limit,
      total,
      totalPages,
    },
  };
}

export function useProjects(page: number, limit: number) {
  return useQuery({
    queryKey: ["projects", page, limit],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
      });
      const response = await apiFetch<LooseProjectsResponse>(`/projects?${params.toString()}`);
      return normalizeProjectsResponse(response, page, limit);
    },
    placeholderData: (previousData) => previousData,
  });
}

export function useProject(id: string) {
  return useQuery({
    queryKey: ["projects", id],
    queryFn: () => apiFetch<Project>(`/projects/${id}`),
    enabled: !!id,
  });
}

export function useCreateProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string; description: string }) =>
      apiFetch<Project>("/projects", { method: "POST", body: JSON.stringify(data) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["projects"] });
      toast.success("Project created");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useUpdateProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: { id: string; name?: string; description?: string }) =>
      apiFetch<Project>(`/projects/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["projects"] });
      qc.invalidateQueries({ queryKey: ["projects", vars.id] });
      toast.success("Project updated");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useDeleteProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiFetch(`/projects/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["projects"] });
      toast.success("Project deleted");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}
