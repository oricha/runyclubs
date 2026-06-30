import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";

import { Container } from "@/components/common/Container";
import { Button } from "@/components/ui/button";
import { formatBlogDate, getAllBlogPosts, getBlogPost } from "@/lib/blog";
import { es } from "@/lib/i18n/es";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const posts = getAllBlogPosts();
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) return {};

  return {
    title: post.title,
    description: post.description,
    alternates: { canonical: `/blog/${slug}` },
    openGraph: {
      title: post.title,
      description: post.description,
      type: "article",
      publishedTime: post.date,
      authors: [post.author],
      url: `/blog/${slug}`,
    },
  };
}

function buildArticleJsonLd(post: NonNullable<ReturnType<typeof getBlogPost>>) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.description,
    author: { "@type": "Organization", name: post.author },
    datePublished: post.date,
    publisher: {
      "@type": "Organization",
      name: "RunClubs.es",
      url: "https://runclubs.es",
    },
  };
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) notFound();

  const articleJsonLd = buildArticleJsonLd(post);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <Container className="py-10">
        <article className="mx-auto max-w-2xl">
          <nav className="mb-8 text-sm text-muted-foreground">
            <Link href="/blog" className="hover:text-foreground">
              Blog
            </Link>
            <span className="mx-2">→</span>
            <span className="text-foreground line-clamp-1">{post.title}</span>
          </nav>

          <header className="space-y-4 border-b border-border pb-8">
            {post.tags.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium uppercase tracking-wide"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            ) : null}
            <h1 className="font-serif text-4xl tracking-tight">{post.title}</h1>
            <p className="text-lg leading-relaxed text-muted-foreground">{post.description}</p>
            <p className="text-sm text-muted-foreground">
              {es.blog.by} {post.author} · {es.blog.publishedOn}{" "}
              {formatBlogDate(post.date)}
            </p>
          </header>

          <div className="prose prose-neutral max-w-none py-8 dark:prose-invert">
            <MDXRemote source={post.content} />
          </div>

          <footer className="border-t border-border pt-8">
            <Button asChild>
              <Link href="/clubs">{es.blog.exploreCta}</Link>
            </Button>
            <p className="mt-4">
              <Link href="/blog" className="text-sm text-muted-foreground hover:text-foreground">
                ← {es.blog.backToBlog}
              </Link>
            </p>
          </footer>
        </article>
      </Container>
    </>
  );
}
