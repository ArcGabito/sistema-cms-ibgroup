// Public origin of the site, used for absolute URLs in the sitemap, robots.txt
// and Open Graph tags. Set SITE_URL in production (e.g. https://www.ibgroup.pe).
export const SITE_URL = (process.env.SITE_URL ?? "http://localhost:3000").replace(/\/+$/, "");

export const PUBLIC_ROUTES = [
  "/",
  "/servicios",
  "/aliados",
  "/blog",
  "/calculadora",
  "/estadisticas",
  "/preguntas",
  "/test-empleabilidad",
  "/transparencia",
  "/contactenos",
] as const;
