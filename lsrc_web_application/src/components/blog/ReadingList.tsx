import { Link } from 'react-router-dom';

import { blogPosts } from '../../data/blog';

export default function ReadingList() {
  return (
    <section className="py-16">
      <div className="mx-auto max-w-7xl px-6">
        <h2 className="mb-8 text-3xl font-bold">
          Reading blog list
        </h2>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {blogPosts.map((item) => (
            <Link
              key={item.slug}
              to={`/blog/${item.slug}`}
              className="group relative overflow-hidden rounded-2xl"
            >
              <img
                src={item.image}
                alt={item.title}
                className="h-64 w-full object-cover transition duration-500 group-hover:scale-105"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent" />

              <div className="absolute bottom-4 left-4 right-4">
                <p className="text-xs font-bold uppercase text-cyan-300">
                  {item.category}
                </p>
                <p className="mt-1 font-semibold text-white line-clamp-2">
                  {item.title}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
