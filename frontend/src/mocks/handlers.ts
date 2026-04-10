import { http, HttpResponse, delay } from "msw";
import { users, passwords, tokens, projects, tasks, generateId } from "./data";

const API = "http://localhost:4000";

function getAuthUser(request: Request) {
  const auth = request.headers.get("Authorization");
  if (!auth?.startsWith("Bearer ")) return null;
  const token = auth.slice(7);
  const userId = tokens[token];
  return users.find((u) => u.id === userId) ?? null;
}

function requireAuth(request: Request) {
  const user = getAuthUser(request);
  if (!user) return HttpResponse.json({ message: "Unauthorized" }, { status: 401 });
  return user;
}

export const handlers = [
  // Auth
  http.post(`${API}/auth/register`, async ({ request }) => {
    await delay(300);
    const body = (await request.json()) as { name: string; email: string; password: string };
    if (!body.name || !body.email || !body.password) {
      return HttpResponse.json({ message: "All fields are required" }, { status: 400 });
    }
    if (users.find((u) => u.email === body.email)) {
      return HttpResponse.json({ message: "Email already registered" }, { status: 409 });
    }
    const user = { id: generateId("u"), name: body.name, email: body.email };
    users.push(user);
    passwords[body.email] = body.password;
    const token = `tok_${user.id}_${Date.now()}`;
    tokens[token] = user.id;
    return HttpResponse.json({ token, user }, { status: 201 });
  }),

  http.post(`${API}/auth/login`, async ({ request }) => {
    await delay(300);
    const body = (await request.json()) as { email: string; password: string };
    const user = users.find((u) => u.email === body.email);
    if (!user || passwords[body.email] !== body.password) {
      return HttpResponse.json({ message: "Invalid email or password" }, { status: 401 });
    }
    const token = `tok_${user.id}_${Date.now()}`;
    tokens[token] = user.id;
    return HttpResponse.json({ token, user });
  }),

  // Projects
  http.get(`${API}/projects`, async ({ request }) => {
    await delay(200);
    const auth = requireAuth(request);
    if (auth instanceof Response) return auth;
    const url = new URL(request.url);
    const pageParam = Number(url.searchParams.get("page") ?? 1);
    const limitParam = Number(url.searchParams.get("limit") ?? 10);
    const page = Number.isFinite(pageParam) && pageParam > 0 ? Math.floor(pageParam) : 1;
    const limit = Number.isFinite(limitParam) && limitParam > 0 ? Math.floor(limitParam) : 10;
    const ownedProjects = projects.filter((p) => p.ownerId === auth.id);
    const total = ownedProjects.length;
    const totalPages = Math.max(1, Math.ceil(total / limit));
    const start = (page - 1) * limit;
    const items = ownedProjects.slice(start, start + limit);

    return HttpResponse.json({
      data: items,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    });
  }),

  http.post(`${API}/projects`, async ({ request }) => {
    await delay(300);
    const auth = requireAuth(request);
    if (auth instanceof Response) return auth;
    const body = (await request.json()) as { name: string; description: string };
    const project = {
      id: generateId("p"),
      name: body.name,
      description: body.description || "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ownerId: auth.id,
    };
    projects.push(project);
    return HttpResponse.json(project, { status: 201 });
  }),

  http.get(`${API}/projects/:id`, async ({ request, params }) => {
    await delay(200);
    const auth = requireAuth(request);
    if (auth instanceof Response) return auth;
    const project = projects.find((p) => p.id === params.id);
    if (!project) return HttpResponse.json({ message: "Project not found" }, { status: 404 });
    return HttpResponse.json(project);
  }),

  http.patch(`${API}/projects/:id`, async ({ request, params }) => {
    await delay(300);
    const auth = requireAuth(request);
    if (auth instanceof Response) return auth;
    const project = projects.find((p) => p.id === params.id);
    if (!project) return HttpResponse.json({ message: "Project not found" }, { status: 404 });
    const body = (await request.json()) as Partial<{ name: string; description: string }>;
    if (body.name) project.name = body.name;
    if (body.description !== undefined) project.description = body.description;
    project.updatedAt = new Date().toISOString();
    return HttpResponse.json(project);
  }),

  http.delete(`${API}/projects/:id`, async ({ request, params }) => {
    await delay(300);
    const auth = requireAuth(request);
    if (auth instanceof Response) return auth;
    const idx = projects.findIndex((p) => p.id === params.id);
    if (idx === -1) return HttpResponse.json({ message: "Project not found" }, { status: 404 });
    projects.splice(idx, 1);
    // Remove associated tasks
    const taskIds = tasks.filter((t) => t.projectId === params.id).map((t) => t.id);
    taskIds.forEach((id) => {
      const ti = tasks.findIndex((t) => t.id === id);
      if (ti !== -1) tasks.splice(ti, 1);
    });
    return HttpResponse.json({ message: "Deleted" });
  }),

  // Tasks
  http.get(`${API}/tasks`, async ({ request }) => {
    const auth = requireAuth(request);
    if (auth instanceof Response) return auth;

    const url = new URL(request.url);
    const projectId = url.searchParams.get("projectId");
    const status = url.searchParams.get("status");

    let filtered = [...tasks];

    if (projectId) {
      filtered = filtered.filter((t) => t.projectId === projectId);
    }

    if (status) {
      filtered = filtered.filter((t) => t.status === status);
    }

    return HttpResponse.json(filtered);
  }),

  http.get(`${API}/projects/:id/tasks`, async ({ request, params }) => {
    await delay(200);
    const auth = requireAuth(request);
    if (auth instanceof Response) return auth;
    return HttpResponse.json(tasks.filter((t) => t.projectId === params.id));
  }),

  http.post(`${API}/projects/:id/tasks`, async ({ request, params }) => {
    await delay(300);
    const auth = requireAuth(request);
    if (auth instanceof Response) return auth;
    const body = (await request.json()) as {
      title: string;
      description?: string;
      priority?: string;
      dueDate?: string;
      assignee?: string;
      status?: string;
    };
    const task = {
      id: generateId("t"),
      title: body.title,
      description: body.description || "",
      status: (body.status as any) || "todo",
      priority: (body.priority as any) || "medium",
      dueDate: body.dueDate || null,
      assignee: body.assignee || null,
      projectId: params.id as string,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    tasks.push(task);
    return HttpResponse.json(task, { status: 201 });
  }),

  http.patch(`${API}/tasks/:id`, async ({ request, params }) => {
    const auth = requireAuth(request);
    if (auth instanceof Response) return auth;
    const task = tasks.find((t) => t.id === params.id);
    if (!task) return HttpResponse.json({ message: "Task not found" }, { status: 404 });
    const body = (await request.json()) as Partial<{
      title: string;
      description: string;
      status: string;
      priority: string;
      dueDate: string;
      assignee: string;
    }>;
    Object.assign(task, body, { updatedAt: new Date().toISOString() });
    return HttpResponse.json(task);
  }),

  http.delete(`${API}/tasks/:id`, async ({ request, params }) => {
    const auth = requireAuth(request);
    if (auth instanceof Response) return auth;
    const idx = tasks.findIndex((t) => t.id === params.id);
    if (idx === -1) return HttpResponse.json({ message: "Task not found" }, { status: 404 });
    tasks.splice(idx, 1);
    return HttpResponse.json({ message: "Deleted" });
  }),
];
