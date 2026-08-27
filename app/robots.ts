import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

/**
 * Served at /robots.txt.
 *
 * /wishlist is NOT disallowed here on purpose. It already carries a noindex
 * tag, and blocking a URL in robots.txt prevents crawlers from ever reading
 * that tag — which can leave the page indexed as a bare URL forever.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
