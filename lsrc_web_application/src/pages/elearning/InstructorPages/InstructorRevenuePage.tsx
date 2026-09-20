import { FaChartLine, FaCreditCard, FaWallet } from "react-icons/fa";
import { DashboardShell } from "../../../components/elearning/layout/DashboardShell";
import { MetricCard } from "../../../components/elearning/ui/MetricCard";
import { Panel } from "../../../components/elearning/ui/Panel";
import { instructorNav } from "../../../data/elearning";

export function InstructorRevenuePage() {
  return (
    <DashboardShell
      role="Instructor"
      title="Revenue"
      subtitle="Static revenue cards and monthly chart placeholders."
      navItems={instructorNav}
    >
      <div className="grid gap-6 md:grid-cols-3">
        <MetricCard label="This month" value="$18.6k" note="+18%" icon={<FaWallet />} accent="bg-cyan-50 text-cyan-600" />
        <MetricCard label="Refund rate" value="1.8%" note="-0.4%" icon={<FaCreditCard />} accent="bg-emerald-50 text-emerald-600" />
        <MetricCard label="Avg order" value="$58" note="+$6" icon={<FaChartLine />} accent="bg-amber-50 text-amber-600" />
      </div>
      <Panel className="mt-8">
        <h2 className="text-2xl font-bold text-slate-900">Monthly earnings</h2>
        <div className="mt-8 flex h-80 items-end gap-4">
          {[42, 58, 51, 76, 63, 84, 91, 72, 88, 96, 82, 100].map((height, index) => (
            <div key={height + index} className="flex flex-1 flex-col items-center gap-3">
              <div
                className="w-full rounded-t-2xl bg-cyan-500"
                style={{ height: `${height}%` }}
              />
              <span className="text-xs font-semibold text-slate-400">{index + 1}</span>
            </div>
          ))}
        </div>
      </Panel>
    </DashboardShell>
  );
}
