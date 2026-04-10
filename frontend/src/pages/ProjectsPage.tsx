import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useProjects, useCreateProject } from "@/hooks/useProjects";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Plus, FolderOpen, Calendar } from "lucide-react";
import { format } from "date-fns";

export default function ProjectsPage() {
  const { data: projects, isLoading, error } = useProjects();
  const createProject = useCreateProject();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const handleCreate = () => {
    if (!name.trim()) return;
    createProject.mutate(
      { name: name.trim(), description: description.trim() },
      {
        onSuccess: () => {
          setOpen(false);
          setName("");
          setDescription("");
        },
      }
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Projects</h1>
            <p className="text-muted-foreground mt-1">Manage your projects and tasks</p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                New Project
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Project</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-2">
                <div className="space-y-2">
                  <Label>Name</Label>
                  <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Project name" />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="What's this project about?"
                  />
                </div>
                <Button onClick={handleCreate} className="w-full" disabled={createProject.isPending}>
                  Create
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-40 rounded-xl" />
            ))}
          </div>
        )}

        {error && (
          <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-8 text-center">
            <p className="text-destructive">Failed to load projects. Please try again.</p>
          </div>
        )}

        {projects && projects.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <FolderOpen className="h-16 w-16 text-muted-foreground/30 mb-4" />
            <h2 className="text-xl font-semibold text-foreground">No projects yet</h2>
            <p className="text-muted-foreground mt-2 max-w-sm">
              Create your first project to start organizing your tasks.
            </p>
          </div>
        )}

        {projects && projects.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <Card
                key={project.id}
                className="cursor-pointer transition-all hover:shadow-md hover:border-primary/30 animate-fade-in"
                onClick={() => navigate(`/projects/${project.id}`)}
              >
                <CardHeader>
                  <CardTitle className="text-lg">{project.name}</CardTitle>
                  <CardDescription className="line-clamp-2">{project.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    {format(new Date(project.createdAt), "MMM d, yyyy")}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
