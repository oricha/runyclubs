import type { MetadataRoute } from "next";

import { CITY_DETAILS } from "@/lib/cities";
import { getAllBlogPosts } from "@/lib/blog";
import { prisma } from "@/lib/prisma";
import { RUN_TYPES } from "@/lib/run-types";

const BASE = "https://runclubs.es";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE, lastModified: now, changeFrequency: "daily", priority: 1.0 },
    { url: `${BASE}/clubs`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${BASE}/carreras`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${BASE}/competiciones`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${BASE}/blog`, lastModified: now, changeFrequency: "weekly", priority: 0.6 },
    { url: `${BASE}/onboarding/club`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
  ];

  const cityRoutes: MetadataRoute.Sitemap = CITY_DETAILS.map((city) => ({
    url: `${BASE}/ciudades/${city.slug}`,
    lastModified: now,
    changeFrequency: "daily",
    priority: 0.8,
  }));

  const clubs = await prisma.club.findMany({
    where: { verified: true },
    select: { slug: true, createdAt: true },
  });
  const clubRoutes: MetadataRoute.Sitemap = clubs.map((c) => ({
    url: `${BASE}/clubs/${c.slug}`,
    lastModified: c.createdAt,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  const runs = await prisma.run.findMany({
    where: {
      startAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
    },
    select: { slug: true, startAt: true },
    orderBy: { startAt: "desc" },
    take: 500,
  });
  const runRoutes: MetadataRoute.Sitemap = runs.map((r) => ({
    url: `${BASE}/carreras/${r.slug}`,
    lastModified: r.startAt,
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  const typeRoutes: MetadataRoute.Sitemap = RUN_TYPES.map((t) => ({
    url: `${BASE}/tipos/${t.id}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  let blogRoutes: MetadataRoute.Sitemap = [];
  try {
    const posts = getAllBlogPosts();
    blogRoutes = posts.map((p) => ({
      url: `${BASE}/blog/${p.slug}`,
      lastModified: new Date(p.date),
      changeFrequency: "monthly",
      priority: 0.5,
    }));
  } catch {
    // blog no disponible
  }

  return [
    ...staticRoutes,
    ...cityRoutes,
    ...clubRoutes,
    ...runRoutes,
    ...typeRoutes,
    ...blogRoutes,
  ];
}
