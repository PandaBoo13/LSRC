import { FaPaperPlane, FaSearch } from 'react-icons/fa';

import { DashboardShell } from '../../../components/elearning/layout/DashboardShell';
import { inputClass } from '../../../components/elearning/styles';
import { Panel } from '../../../components/elearning/ui/Panel';
import { StatusPill } from '../../../components/elearning';
import { instructorNav, learners } from '../../../data/elearning';

const conversations = learners.map((learner, index) => ({
  id: `conv-${index}`,
  name: learner.name,
  email: learner.email,
  course: learner.course,
  lastMessage:
    index === 0
      ? 'Thank you for the feedback on my props exercise!'
      : index === 1
        ? 'Can I get an extension on the quiz?'
        : 'I am stuck on the dashboard project module.',
  time: index === 0 ? '10 min ago' : index === 1 ? '2 hours ago' : 'Yesterday',
  unread: index < 2,
}));

export function InstructorMessagesPage() {
  const active = conversations[0];

  return (
    <DashboardShell
      role="Instructor"
      title="Messages"
      subtitle="Reply to student questions and provide mentorship support."
      navItems={instructorNav}
    >
      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <Panel className="p-0 overflow-hidden">
          <div className="border-b border-slate-100 p-4">
            <div className="relative">
              <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                placeholder="Search conversations..."
                className={`${inputClass} py-3 pl-11 text-sm`}
              />
            </div>
          </div>
          <div className="max-h-[520px] overflow-y-auto">
            {conversations.map((conv) => (
              <button
                key={conv.id}
                type="button"
                className={`flex w-full gap-3 border-b border-slate-50 p-4 text-left transition hover:bg-slate-50 ${
                  conv.id === active.id ? 'bg-cyan-50/50' : ''
                }`}
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-cyan-100 font-bold text-cyan-700">
                  {conv.name.charAt(0)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-slate-900">{conv.name}</span>
                    <span className="text-xs text-slate-400">{conv.time}</span>
                  </div>
                  <p className="truncate text-sm text-slate-500">{conv.lastMessage}</p>
                </div>
                {conv.unread && (
                  <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-cyan-500" />
                )}
              </button>
            ))}
          </div>
        </Panel>

        <Panel className="flex min-h-[520px] flex-col">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">{active.name}</h2>
              <p className="text-sm text-slate-500">
                {active.course} · {active.email}
              </p>
            </div>
            <StatusPill>Active</StatusPill>
          </div>

          <div className="flex-1 space-y-4 py-6">
            <div className="max-w-[80%] rounded-2xl rounded-tl-sm bg-slate-100 p-4 text-sm text-slate-700">
              Hi instructor, I finished the props lesson but I'm unsure about generic list
              components. Could you share an example?
            </div>
            <div className="ml-auto max-w-[80%] rounded-2xl rounded-tr-sm bg-cyan-500 p-4 text-sm text-white">
              Great progress! Start with an explicit props interface, then extract shared fields
              into a base type if multiple cards reuse the same shape.
            </div>
            <div className="max-w-[80%] rounded-2xl rounded-tl-sm bg-slate-100 p-4 text-sm text-slate-700">
              {active.lastMessage}
            </div>
          </div>

          <div className="flex gap-3 border-t border-slate-100 pt-4">
            <input
              placeholder="Type your reply..."
              className={`${inputClass} flex-1 py-3 text-sm`}
            />
            <button
              type="button"
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-cyan-500 text-white"
            >
              <FaPaperPlane />
            </button>
          </div>
        </Panel>
      </div>
    </DashboardShell>
  );
}
