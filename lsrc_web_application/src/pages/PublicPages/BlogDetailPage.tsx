import { Link, useParams } from 'react-router-dom';
import { FaArrowLeft, FaClock, FaTag } from 'react-icons/fa';

import { PublicLayout } from '../../components/elearning/layout/PublicLayout';
import { StatusPill } from '../../components/elearning';
import { getBlogPost, getRelatedPosts } from '../../lib/blog';

export function BlogDetailPage() {
  const { slug } = useParams();
  const post = getBlogPost(slug);
  const related = getRelatedPosts(slug ?? '');

  if (!post) {
    return (
      <PublicLayout hero={{ label: 'Blog', title: 'Article not found', subtitle: '' }}>
        <div className="mx-auto max-w-3xl px-6 py-20 text-center">
          <p className="text-slate-600">This article does not exist or was removed.</p>
          <Link to="/blog" className="mt-6 inline-block font-semibold text-cyan-600">
            Back to blog
          </Link>
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout
      hero={{
        label: post.category,
        title: post.title,
        subtitle: post.excerpt,
      }}
    >
      <article className="mx-auto max-w-4xl px-6 py-12">
        <Link
          to="/blog"
          className="inline-flex items-center gap-2 text-sm font-semibold text-cyan-600"
        >
          <FaArrowLeft size={12} />
          Back to blog
        </Link>

        <div className="mt-8 overflow-hidden rounded-3xl">
          <img src={post.image} alt={post.title} className="h-80 w-full object-cover" />
        </div>

        <div className="mt-8 flex flex-wrap items-center gap-4 text-sm text-slate-500">
          <div className="flex items-center gap-3">
            <img
              src={post.authorAvatar}
              alt={post.author}
              className="h-10 w-10 rounded-full object-cover"
            />
            <span className="font-semibold text-slate-900">{post.author}</span>
          </div>
          <span>{post.publishedAt}</span>
          <span className="flex items-center gap-1">
            <FaClock size={12} />
            {post.readTime}
          </span>
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          {post.tags.map((tag) => (
            <StatusPill key={tag}>
              <FaTag className="mr-1 inline" size={10} />
              {tag}
            </StatusPill>
          ))}
        </div>

        <div className="prose prose-slate mt-10 max-w-none space-y-6">
          {post.content.map((paragraph) => (
            <p key={paragraph.slice(0, 40)} className="text-lg leading-relaxed text-slate-700">
              {paragraph}
            </p>
          ))}
        </div>

        {related.length > 0 && (
          <section className="mt-16 border-t border-slate-200 pt-12">
            <h2 className="text-2xl font-bold text-slate-900">Related articles</h2>
            <div className="mt-6 grid gap-6 md:grid-cols-3">
              {related.map((item) => (
                <Link
                  key={item.slug}
                  to={`/blog/${item.slug}`}
                  className="group overflow-hidden rounded-2xl border border-slate-200 bg-white transition hover:-translate-y-1 hover:shadow-lg"
                >
                  <img
                    src={item.image}
                    alt={item.title}
                    className="h-40 w-full object-cover transition group-hover:scale-105"
                  />
                  <div className="p-4">
                    <p className="text-xs font-bold uppercase text-cyan-500">{item.category}</p>
                    <h3 className="mt-2 font-bold text-slate-900 line-clamp-2">{item.title}</h3>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </article>
    </PublicLayout>
  );
}
