import Link from "next/link";

import { formatBlogDate } from "@/lib/blog";
import { es } from "@/lib/i18n/es";
import type { BlogPostMeta } from "@/types/blog";

export function BlogCard({ post }: { post: BlogPostMeta }) {
  const visibleTags = post.tags.slice(0, 3);

  return (
    <Link
      href={`/blog/${post.slug}`}
      className="flex h-full flex-col rounded-xl border border-border p-6 transition-shadow hover:shadow-sm"
    >
      <h2 className="font-serif text-xl font-normal leading-snug line-clamp-2">{post.title}</h2>
      <p className="mt-2 flex-1 text-sm text-muted-foreground line-clamp-3">{post.description}</p>
      <div className="mt-4 space-y-2">
        <p className="text-xs text-muted-foreground">
          {formatBlogDate(post.date)} · {es.blog.by} {post.author}
        </p>
        {visibleTags.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {visibleTags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide"
              >
                {tag}
              </span>
            ))}
          </div>
        ) : null}
        <span className="inline-block text-sm font-medium">{es.blog.readMore} →</span>
      </div>
    </Link>
  );
}
