import { User, Project, Task } from "@/types";

export const users: User[] = [
  { id: "u1", name: "Demo User", email: "test@example.com" },
];

export const passwords: Record<string, string> = {
  "test@example.com": "password123",
};

export const tokens: Record<string, string> = {};

export const projects: Project[] = [
  {
    id: "p1",
    name: "Website Redesign",
    description: "Redesign the company website with modern UI/UX principles",
    createdAt: "2025-01-15T10:00:00Z",
    updatedAt: "2025-01-15T10:00:00Z",
    ownerId: "u1",
  },
  {
    id: "p2",
    name: "Mobile App",
    description: "Build a cross-platform mobile application for customers",
    createdAt: "2025-02-01T10:00:00Z",
    updatedAt: "2025-02-01T10:00:00Z",
    ownerId: "u1",
  },
  {
    id: "p3",
    name: "API Integration",
    description: "Integrate third-party APIs for payment and analytics",
    createdAt: "2025-03-10T10:00:00Z",
    updatedAt: "2025-03-10T10:00:00Z",
    ownerId: "u1",
  },
];

export const tasks: Task[] = [
  {
    id: "t1",
    title: "Design homepage mockup",
    description: "Create wireframes and high-fidelity mockups for the new homepage layout",
    status: "done",
    priority: "high",
    dueDate: "2025-02-01T00:00:00Z",
    assignee: "Alice",
    projectId: "p1",
    createdAt: "2025-01-16T10:00:00Z",
    updatedAt: "2025-01-20T10:00:00Z",
  },
  {
    id: "t2",
    title: "Implement responsive nav",
    description: "Build a mobile-first responsive navigation component",
    status: "in_progress",
    priority: "medium",
    dueDate: "2025-02-15T00:00:00Z",
    assignee: "Bob",
    projectId: "p1",
    createdAt: "2025-01-18T10:00:00Z",
    updatedAt: "2025-01-18T10:00:00Z",
  },
  {
    id: "t3",
    title: "Set up CI/CD pipeline",
    description: "Configure GitHub Actions for automated testing and deployment",
    status: "todo",
    priority: "high",
    dueDate: "2025-02-20T00:00:00Z",
    assignee: "Charlie",
    projectId: "p1",
    createdAt: "2025-01-19T10:00:00Z",
    updatedAt: "2025-01-19T10:00:00Z",
  },
  {
    id: "t4",
    title: "Write unit tests",
    description: "Add unit tests for critical components with at least 80% coverage",
    status: "todo",
    priority: "low",
    dueDate: "2025-03-01T00:00:00Z",
    assignee: null,
    projectId: "p1",
    createdAt: "2025-01-20T10:00:00Z",
    updatedAt: "2025-01-20T10:00:00Z",
  },
  {
    id: "t5",
    title: "Setup React Native project",
    description: "Initialize the project with Expo and configure navigation",
    status: "in_progress",
    priority: "high",
    dueDate: "2025-02-10T00:00:00Z",
    assignee: "Alice",
    projectId: "p2",
    createdAt: "2025-02-02T10:00:00Z",
    updatedAt: "2025-02-02T10:00:00Z",
  },
  {
    id: "t6",
    title: "Design app screens",
    description: "Create designs for all major screens in Figma",
    status: "todo",
    priority: "medium",
    dueDate: "2025-02-20T00:00:00Z",
    assignee: "Bob",
    projectId: "p2",
    createdAt: "2025-02-03T10:00:00Z",
    updatedAt: "2025-02-03T10:00:00Z",
  },
];

let idCounter = 100;
export function generateId(prefix: string) {
  return `${prefix}${++idCounter}`;
}
