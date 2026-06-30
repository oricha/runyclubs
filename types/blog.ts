export interface BlogPostMeta {
  slug: string;
  title: string;
  description: string;
  date: string;
  author: string;
  tags: string[];
  coverImage: string | null;
}

export interface BlogPost extends BlogPostMeta {
  content: string;
}
