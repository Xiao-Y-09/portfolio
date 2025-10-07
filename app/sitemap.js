import { getAllProjects } from "../lib/projects";

export default async function sitemap() {
  const base = "https://https://portfolio-ki4o.vercel.app/";
  const items = (await getAllProjects()).map(p => ({
    url: `${base}/projects/${p.slug}`,
    lastModified: new Date(),
  }));
  return [
    { url: base, lastModified: new Date() },
    { url: `${base}/projects`, lastModified: new Date() },
    ...items,
  ];
}
