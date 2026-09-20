import { Link } from 'react-router-dom';
import {
  FaBell,
  FaBookOpen,
  FaCheckDouble,
  FaCreditCard,
  FaGraduationCap,
  FaQuestionCircle,
} from 'react-icons/fa';

import { DashboardShell } from '../../../components/elearning/layout/DashboardShell';
import { Panel } from '../../../components/elearning/ui/Panel';
import { StatusPill } from '../../../components/elearning';
import { notifications } from '../../../data/notifications';
import { studentNav } from '../../../data/elearning';

const typeConfig = {
  course: { icon: FaBookOpen, accent: 'bg-cyan-50 text-cyan-600' },
  quiz: { icon: FaQuestionCircle, accent: 'bg-amber-50 text-amber-600' },
  billing: { icon: FaCreditCard, accent: 'bg-emerald-50 text-emerald-600' },
  system: { icon: FaGraduationCap, accent: 'bg-violet-50 text-violet-600' },
  community: { icon: FaBell, accent: 'bg-sky-50 text-sky-600' },
};

export function NotificationsPage() {
  const unread = notifications.filter((n) => !n.read).length;

  return (
    <DashboardShell
      role="Student"
      title="Notifications"
      subtitle={`${unread} unread · Stay updated on courses, quizzes, and platform news.`}
      navItems={studentNav}
    >
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <StatusPill>{notifications.length} total</StatusPill>
        <button
          type="button"
          className="inline-flex items-center gap-2 text-sm font-semibold text-cyan-600"
        >
          <FaCheckDouble size={12} />
          Mark all as read
        </button>
      </div>

      <div className="space-y-3">
        {notifications.map((item) => {
          const config = typeConfig[item.type];
          const Icon = config.icon;
          const content = (
            <Panel
              className={`transition hover:shadow-md ${
                !item.read ? 'border-l-4 border-l-cyan-500 bg-cyan-50/30' : ''
              }`}
            >
              <div className="flex items-start gap-4">
                <span
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${config.accent}`}
                >
                  <Icon />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="font-bold text-slate-900">{item.title}</h3>
                    <span className="text-xs text-slate-500">{item.time}</span>
                  </div>
                  <p className="mt-1 text-sm text-slate-600">{item.message}</p>
                  {!item.read && (
                    <span className="mt-2 inline-block text-xs font-semibold text-cyan-600">
                      New
                    </span>
                  )}
                </div>
              </div>
            </Panel>
          );

          return item.link ? (
            <Link key={item.id} to={item.link}>
              {content}
            </Link>
          ) : (
            <div key={item.id}>{content}</div>
          );
        })}
      </div>
    </DashboardShell>
  );
}
