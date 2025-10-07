import { getAllProjects } from "@/lib/projects";
import ProjectCard from "@/components/ProjectCard";

export const metadata = { title: "Projects — Your Name" };

export default async function ProjectsPage() {
  const projects = await getAllProjects();
  return (
    <section className="prose max-w-none">
      <h1>All Projects</h1>
      <div className="grid gap-6 md:grid-cols-2">
        {projects.map((p) => (
          <ProjectCard key={p.slug} project={p} />
        ))}
      </div>
    </section>
  );
}
