import Image from "next/image";
import { getAllSlugs, getProjectBySlug } from "@/lib/projects";

export async function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

export default async function ProjectPage({ params }) {
  const project = await getProjectBySlug(params.slug);
  const gallery = Array.isArray(project.images) ? project.images : [];
  return (
    <article className="prose max-w-none">
      <h1>{project.title}</h1>
      <p className="!mt-0 text-sm text-gray-600">
        {project.year} · {(project.tags || []).join(" · ")}
      </p>

      {project.cover && (
        <div className="relative aspect-[16/9] w-full rounded-xl overflow-hidden">
          <Image
            src={project.cover}
            alt={project.coverAlt || project.title}
            fill
            className="object-cover"
          />
        </div>
      )}

      {project.contentHtml && (
        <div dangerouslySetInnerHTML={{ __html: project.contentHtml }} />
      )}

      {gallery.length > 0 && (
        <div className="grid gap-4 mt-8 md:grid-cols-2">
          {gallery.map((src, i) => (
            <div key={i} className="relative aspect-[4/3] overflow-hidden rounded-xl">
              <Image src={src} alt={`${project.title} image ${i + 1}`} fill className="object-cover" />
            </div>
          ))}
        </div>
      )}
    </article>
  );
}
