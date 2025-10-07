import Image from "next/image";
import Link from "next/link";

export default function ProjectCard({ project }) {
  const cover = project.cover || "/placeholder.jpg";
  const alt = project.coverAlt || project.title;
  return (
    <Link
      href={`/projects/${project.slug}`}
      className="block border rounded-2xl overflow-hidden hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-black"
    >
      <div className="relative aspect-[16/9]">
        <Image src={cover} alt={alt} fill sizes="(max-width:768px) 100vw, 50vw" className="object-cover" />
      </div>
      <div className="p-4">
        <h3 className="text-lg font-semibold">{project.title}</h3>
        <p className="text-sm text-gray-600">
          {project.year} · {(project.tags || []).join(" · ")}
        </p>
        {project.summary && <p className="mt-2 text-sm">{project.summary}</p>}
      </div>
    </Link>
  );
}
