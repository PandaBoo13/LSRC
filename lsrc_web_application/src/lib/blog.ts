import { blogPosts, type BlogPost } from '../data/blog';

export function getBlogPost(slug?: string): BlogPost | undefined {
  return blogPosts.find((post) => post.slug === slug);
}

export function getRelatedPosts(slug: string, limit = 3): BlogPost[] {
  const current = getBlogPost(slug);
  if (!current) return blogPosts.slice(0, limit);

  return blogPosts
    .filter((p) => p.slug !== slug)
    .sort((a, b) => {
      const aMatch = a.category === current.category ? 1 : 0;
      const bMatch = b.category === current.category ? 1 : 0;
      return bMatch - aMatch;
    })
    .slice(0, limit);
}
