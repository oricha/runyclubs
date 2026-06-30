import type { Metadata } from "next";

import { BlogCard } from "@/components/blog/BlogCard";
import { Container } from "@/components/common/Container";
import { getAllBlogPosts } from "@/lib/blog";
import { es } from "@/lib/i18n/es";

export const metadata: Metadata = {
  title: es.blog.title,
  description: es.blog.subtitle,
  alternates: { canonical: "/blog" },
  openGraph: {
    title: es.blog.title,
    description: es.blog.subtitle,
    url: "/blog",
  },
};

export default function BlogPage() {
  const posts = getAllBlogPosts();

  return (
    <Container className="py-10">
      <header className="mb-10 max-w-2xl">
        <h1 className="font-serif text-4xl tracking-tight md:text-5xl">{es.blog.title}</h1>
        <p className="mt-3 text-lg text-muted-foreground">{es.blog.subtitle}</p>
      </header>

      {posts.length === 0 ? (
        <p className="text-muted-foreground">{es.blog.noPosts}</p>
      ) : (
        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <li key={post.slug}>
              <BlogCard post={post} />
            </li>
          ))}
        </ul>
      )}
    </Container>
  );
}
