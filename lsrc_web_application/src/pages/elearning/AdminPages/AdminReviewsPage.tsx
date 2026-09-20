import { FaStar } from "react-icons/fa";
import { DashboardShell } from "../../../components/elearning/layout/DashboardShell";
import { Panel } from "../../../components/elearning/ui/Panel";
import { StatusPill } from "../../../components/elearning/ui/StatusPill";
import { adminNav } from "../../../data/elearning";

export function AdminReviewsPage() {
  return (
    <DashboardShell
      role="Admin"
      title="Reviews"
      subtitle="Moderate learner feedback and featured testimonials."
      navItems={adminNav}
    >
      <div className="grid gap-6 lg:grid-cols-2">
        {['Clear lessons and practical tasks.', 'The mentor feedback helped a lot.', 'Great UI examples for React beginners.', 'Need more advanced data projects.'].map(
          (review, index) => (
            <Panel key={review}>
              <div className="flex items-center gap-1 text-amber-400">
                {[1, 2, 3, 4, 5].map((star) => (
                  <FaStar key={star} />
                ))}
              </div>
              <p className="mt-5 text-slate-600">{review}</p>
              <div className="mt-6 flex items-center justify-between">
                <span className="font-semibold text-slate-900">Learner #{index + 1}</span>
                <StatusPill tone={index === 3 ? 'amber' : 'green'}>
                  {index === 3 ? 'Review' : 'Approved'}
                </StatusPill>
              </div>
            </Panel>
          ),
        )}
      </div>
    </DashboardShell>
  );
}