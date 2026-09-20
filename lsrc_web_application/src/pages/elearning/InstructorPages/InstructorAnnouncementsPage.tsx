import { FaBullhorn, FaCalendar, FaPaperPlane, FaUsers } from 'react-icons/fa';

import { DashboardShell } from '../../../components/elearning/layout/DashboardShell';
import { btnPrimaryClass, inputClass } from '../../../components/elearning/styles';
import { Panel } from '../../../components/elearning/ui/Panel';
import { MetricCard, StatusPill } from '../../../components/elearning';
import { instructorNav } from '../../../data/elearning';

const pastAnnouncements = [
  {
    id: 'a-1',
    title: 'New lesson: Routing and layouts',
    course: 'React Foundations with TypeScript',
    sent: 'Jun 10, 2026',
    reach: '1,842 students',
    status: 'Sent',
  },
  {
    id: 'a-2',
    title: 'Mid-course quiz reminder',
    course: 'React Foundations with TypeScript',
    sent: 'Jun 05, 2026',
    reach: '1,756 students',
    status: 'Sent',
  },
  {
    id: 'a-3',
    title: 'Welcome to the cohort',
    course: 'React Foundations with TypeScript',
    sent: 'May 28, 2026',
    reach: '1,920 students',
    status: 'Sent',
  },
];

export function InstructorAnnouncementsPage() {
  return (
    <DashboardShell
      role="Instructor"
      title="Announcements"
      subtitle="Send updates to enrolled students across your courses."
      navItems={instructorNav}
    >
      <section className="grid gap-4 sm:grid-cols-3">
        <MetricCard
          label="Sent this month"
          value="12"
          note="3 scheduled"
          icon={<FaPaperPlane />}
          accent="bg-cyan-50 text-cyan-600"
        />
        <MetricCard
          label="Avg. open rate"
          value="68%"
          note="+4% vs last month"
          icon={<FaBullhorn />}
          accent="bg-emerald-50 text-emerald-600"
        />
        <MetricCard
          label="Students reached"
          value="5.4k"
          note="Across 4 courses"
          icon={<FaUsers />}
          accent="bg-violet-50 text-violet-600"
        />
      </section>

      <div className="mt-10 grid gap-8 xl:grid-cols-[1fr_1.2fr]">
        <Panel>
          <h2 className="text-xl font-bold text-slate-900">Compose announcement</h2>
          <form className="mt-6 grid gap-4">
            <select className={inputClass} defaultValue="react-foundations">
              <option value="react-foundations">React Foundations with TypeScript</option>
              <option value="ux-product-design">UX Product Design Masterclass</option>
            </select>
            <input placeholder="Announcement title" className={inputClass} />
            <textarea
              placeholder="Write your message to students..."
              rows={6}
              className={inputClass}
            />
            <div className="flex flex-wrap gap-3">
              <button type="button" className={btnPrimaryClass}>
                Send now
              </button>
              <button type="button" className="rounded-full border border-slate-200 px-5 py-4 text-sm font-semibold text-slate-600">
                Schedule
              </button>
            </div>
          </form>
        </Panel>

        <Panel>
          <h2 className="text-xl font-bold text-slate-900">Recent announcements</h2>
          <div className="mt-6 space-y-4">
            {pastAnnouncements.map((item) => (
              <div
                key={item.id}
                className="rounded-2xl border border-slate-100 bg-slate-50 p-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="font-semibold text-slate-900">{item.title}</h3>
                  <StatusPill>{item.status}</StatusPill>
                </div>
                <p className="mt-2 text-sm text-slate-500">{item.course}</p>
                <div className="mt-3 flex flex-wrap gap-4 text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <FaCalendar />
                    {item.sent}
                  </span>
                  <span className="flex items-center gap-1">
                    <FaUsers />
                    {item.reach}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </DashboardShell>
  );
}
