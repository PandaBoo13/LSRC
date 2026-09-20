import { blogPosts } from '../data/blog';
import { catalogCourses } from '../data/elearning';
import { communityTopics } from '../data/community';

export type SearchResult = {
  id: string;
  type: 'course' | 'blog' | 'community';
  title: string;
  excerpt: string;
  link: string;
  meta?: string;
};

export function searchAll(query: string): SearchResult[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  const courseResults: SearchResult[] = catalogCourses
    .filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        c.category.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q),
    )
    .map((c) => ({
      id: c.id,
      type: 'course' as const,
      title: c.title,
      excerpt: c.description,
      link: `/courses/${c.slug}`,
      meta: `${c.category} · ${c.level}`,
    }));

  const blogResults: SearchResult[] = blogPosts
    .filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.excerpt.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q)),
    )
    .map((p) => ({
      id: p.slug,
      type: 'blog' as const,
      title: p.title,
      excerpt: p.excerpt,
      link: `/blog/${p.slug}`,
      meta: p.category,
    }));

  const communityResults: SearchResult[] = communityTopics
    .filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        t.tags.some((tag) => tag.toLowerCase().includes(q)),
    )
    .map((t) => ({
      id: t.id,
      type: 'community' as const,
      title: t.title,
      excerpt: `${t.replies} replies · ${t.views} views`,
      link: '/community',
      meta: t.category,
    }));

  return [...courseResults, ...blogResults, ...communityResults];
}
