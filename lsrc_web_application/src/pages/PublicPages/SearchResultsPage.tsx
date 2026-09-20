import { useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { FaBookOpen, FaComments, FaNewspaper, FaSearch } from 'react-icons/fa';

import { PublicLayout } from '../../components/elearning/layout/PublicLayout';
import { inputClass } from '../../components/elearning/styles';
import { Panel } from '../../components/elearning/ui/Panel';
import { StatusPill } from '../../components/elearning';
import { searchAll } from '../../lib/search';

const typeIcons = {
  course: FaBookOpen,
  blog: FaNewspaper,
  community: FaComments,
};

const typeLabels = {
  course: 'Course',
  blog: 'Article',
  community: 'Community',
};

export function SearchResultsPage() {
  const [params, setParams] = useSearchParams();
  const query = params.get('q') ?? '';
  const results = useMemo(() => searchAll(query), [query]);

  return (
    <PublicLayout
      hero={{
        label: 'Search',
        title: query ? `Results for "${query}"` : 'Search LSRC',
        subtitle: 'Find courses, articles, and community discussions.',
      }}
    >
      <section className="mx-auto max-w-4xl px-6 py-12">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            const q = String(fd.get('q') ?? '');
            setParams(q ? { q } : {});
          }}
          className="relative"
        >
          <FaSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            name="q"
            defaultValue={query}
            placeholder="Search courses, articles, topics..."
            className={`${inputClass} pl-12`}
          />
        </form>

        <div className="mt-8 space-y-4">
          {!query && (
            <p className="text-center text-slate-500">
              Enter a keyword to search across the platform.
            </p>
          )}

          {query && results.length === 0 && (
            <Panel className="text-center">
              <p className="font-semibold text-slate-900">No results found</p>
              <p className="mt-2 text-sm text-slate-500">
                Try different keywords or browse the{' '}
                <Link to="/courses" className="text-cyan-600">
                  course catalog
                </Link>
                .
              </p>
            </Panel>
          )}

          {results.map((item) => {
            const Icon = typeIcons[item.type];
            return (
              <Link key={`${item.type}-${item.id}`} to={item.link}>
                <Panel className="transition hover:-translate-y-0.5 hover:shadow-md">
                  <div className="flex items-start gap-4">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-600">
                      <Icon />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <StatusPill>{typeLabels[item.type]}</StatusPill>
                        {item.meta && (
                          <span className="text-xs text-slate-500">{item.meta}</span>
                        )}
                      </div>
                      <h3 className="mt-2 font-bold text-slate-900">{item.title}</h3>
                      <p className="mt-1 line-clamp-2 text-sm text-slate-500">{item.excerpt}</p>
                    </div>
                  </div>
                </Panel>
              </Link>
            );
          })}
        </div>
      </section>
    </PublicLayout>
  );
}
