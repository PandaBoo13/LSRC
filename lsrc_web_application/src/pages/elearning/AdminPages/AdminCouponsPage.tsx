import { FaTag } from "react-icons/fa";
import { DashboardShell } from "../../../components/elearning/layout/DashboardShell";
import { Panel } from "../../../components/elearning/ui/Panel";
import { StatusPill } from "../../../components/elearning/ui/StatusPill";
import { adminNav } from "../../../data/elearning";

export function AdminCouponsPage() {
  return (
    <DashboardShell
      role="Admin"
      title="Coupons"
      subtitle="Create and audit static discount campaigns."
      navItems={adminNav}
    >
      <div className="grid gap-6 lg:grid-cols-3">
        {[
          ['WELCOME20', '20% off first course', 'Active'],
          ['TEAMLEARN', '15% off team plans', 'Scheduled'],
          ['SPRING50', '$50 bundle discount', 'Expired'],
        ].map(([code, description, status]) => (
          <Panel key={code}>
            <div className="flex items-center justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-600">
                <FaTag />
              </div>
              <StatusPill tone={status === 'Expired' ? 'slate' : 'green'}>{status}</StatusPill>
            </div>
            <h2 className="mt-6 text-2xl font-bold text-slate-900">{code}</h2>
            <p className="mt-2 text-sm text-slate-500">{description}</p>
          </Panel>
        ))}
      </div>
    </DashboardShell>
  );
}