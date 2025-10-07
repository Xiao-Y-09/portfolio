import { getAllProjects } from "../lib/projects";
import ProjectCard from "../components/ProjectCard";

export default async function HomePage() {
  const projects = await getAllProjects();
  return (
    <section className="prose max-w-none">
      <h1>Selected Projects</h1>
      <div className="grid gap-6 md:grid-cols-2">
        {projects.map((p) => (
          <ProjectCard key={p.slug} project={p} />
        ))}
      </div>
    </section>
  );
}
