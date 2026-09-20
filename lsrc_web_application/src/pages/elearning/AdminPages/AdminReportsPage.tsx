import { FaChartLine, FaClipboardList, FaFilter } from "react-icons/fa";
import { DashboardShell } from "../../../components/elearning/layout/DashboardShell";
import { MetricCard } from "../../../components/elearning/ui/MetricCard";
import { Panel } from "../../../components/elearning/ui/Panel";
import { adminNav } from "../../../data/elearning";

export function AdminReportsPage() {
  return (
    <DashboardShell
      role="Admin"
      title="Reports"
      subtitle="Static analytics snapshot for platform health."
      navItems={adminNav}
    >
      <div className="grid gap-6 md:grid-cols-3">
        <MetricCard label="Activation" value="64%" note="+5%" icon={<FaChartLine />} accent="bg-cyan-50 text-cyan-600" />
        <MetricCard label="Completion" value="71%" note="+9%" icon={<FaClipboardList />} accent="bg-emerald-50 text-emerald-600" />
        <MetricCard label="Churn risk" value="8%" note="-2%" icon={<FaFilter />} accent="bg-amber-50 text-amber-600" />
      </div>
      <Panel className="mt-8">
        <h2 className="text-2xl font-bold text-slate-900">Learner growth</h2>
        <div className="mt-8 grid gap-4 md:grid-cols-6">
          {[35, 48, 52, 68, 74, 89].map((value, index) => (
            <div key={value} className="rounded-2xl bg-slate-50 p-4">
              <div className="flex h-32 items-end rounded-2xl bg-white p-2">
                <div className="w-full rounded-t-xl bg-cyan-500" style={{ height: `${value}%` }} />
              </div>
              <p className="mt-3 text-center text-sm font-semibold text-slate-500">M{index + 1}</p>
            </div>
          ))}
        </div>
      </Panel>
    </DashboardShell>
  );
}