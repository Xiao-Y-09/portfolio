export default function robots() {
  return {
    rules: [{ userAgent: "*", allow: "/" }],
    sitemap: "https://<你的域名>/sitemap.xml",
  };
}
