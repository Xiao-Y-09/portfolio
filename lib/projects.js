import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { remark } from "remark";
import html from "remark-html";

const projectsDir = path.join(process.cwd(), "content", "projects");

export function getAllSlugs() {
  if (!fs.existsSync(projectsDir)) return [];
  return fs.readdirSync(projectsDir)
    .filter(f => f.endsWith(".md"))
    .map(f => f.replace(/\.md$/, ""));
}

export async function getProjectBySlug(slug) {
  const full = path.join(projectsDir, `${slug}.md`);
  const raw = fs.readFileSync(full, "utf8");
  const { data, content } = matter(raw);
  const processed = await remark().use(html).process(content);
  return { slug, ...data, contentHtml: processed.toString() };
}

export async function getAllProjects() {
  const slugs = getAllSlugs();
  const items = await Promise.all(slugs.map(s => getProjectBySlug(s)));
  return items.sort((a, b) => (b.year || 0) - (a.year || 0));
}
