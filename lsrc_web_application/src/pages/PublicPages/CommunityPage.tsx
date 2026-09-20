import { Link } from 'react-router-dom';
import { FaComments, FaEye, FaPlus, FaThumbtack } from 'react-icons/fa';

import { PublicLayout } from '../../components/elearning/layout/PublicLayout';
import { btnPrimaryClass } from '../../components/elearning/styles';
import { Panel } from '../../components/elearning/ui/Panel';
import { StatusPill } from '../../components/elearning';
import { communityTopics } from '../../data/community';

export function CommunityPage() {
  return (
    <PublicLayout
      hero={{
        label: 'Community',
        title: 'Learn together with peers and mentors',
        subtitle:
          'Ask questions, share projects, and join study groups across every LSRC learning track.',
      }}
    >
      <section className="mx-auto max-w-6xl px-6 py-12">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Discussion board</h2>
            <p className="mt-1 text-sm text-slate-500">
              {communityTopics.length} active topics · Updated daily
            </p>
          </div>
          <button type="button" className={`${btnPrimaryClass} gap-2`}>
            <FaPlus size={12} />
            New topic
          </button>
        </div>

        <div className="mt-8 space-y-4">
          {communityTopics.map((topic) => (
            <Panel
              key={topic.id}
              className="transition hover:border-cyan-200 hover:shadow-md"
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    {topic.pinned && (
                      <StatusPill>
                        <FaThumbtack className="mr-1 inline" size={10} />
                        Pinned
                      </StatusPill>
                    )}
                    <StatusPill>{topic.category}</StatusPill>
                  </div>
                  <h3 className="mt-3 text-lg font-bold text-slate-900">{topic.title}</h3>
                  <div className="mt-3 flex items-center gap-3">
                    <img
                      src={topic.authorAvatar}
                      alt={topic.author}
                      className="h-8 w-8 rounded-full object-cover"
                    />
                    <span className="text-sm text-slate-500">
                      {topic.author} · {topic.lastActivity}
                    </span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {topic.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex shrink-0 gap-6 text-sm text-slate-500">
                  <span className="flex items-center gap-2">
                    <FaComments className="text-cyan-500" />
                    {topic.replies}
                  </span>
                  <span className="flex items-center gap-2">
                    <FaEye />
                    {topic.views}
                  </span>
                </div>
              </div>
            </Panel>
          ))}
        </div>

        <p className="mt-10 text-center text-sm text-slate-500">
          Need account help? Visit the{' '}
          <Link to="/help" className="font-semibold text-cyan-600">
            Help Center
          </Link>
          .
        </p>
      </section>
    </PublicLayout>
  );
}
