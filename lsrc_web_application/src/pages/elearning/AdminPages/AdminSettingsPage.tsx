import { DashboardShell } from '../../../components/elearning/layout/DashboardShell';
import { inputClass } from '../../../components/elearning/styles';
import { Panel } from '../../../components/elearning/ui/Panel';
import { adminNav } from '../../../data/elearning';

export function AdminSettingsPage() {
  return (
    <DashboardShell
      role="Admin"
      title="Platform settings"
      subtitle="Static configuration UI for branding, payments, and moderation."
      navItems={adminNav}
    >
      <div className="grid gap-8 xl:grid-cols-2">
        <Panel>
          <h2 className="text-2xl font-bold text-slate-900">Branding</h2>
          <div className="mt-6 space-y-5">
            {['Platform name', 'Support email', 'Default currency'].map(
              (label) => (
                <input key={label} placeholder={label} className={inputClass} />
              ),
            )}
          </div>
        </Panel>
        <Panel>
          <h2 className="text-2xl font-bold text-slate-900">System toggles</h2>
          <div className="mt-6 space-y-4">
            {[
              'Manual course approval',
              'Enable coupons',
              'Certificate auto-issue',
              'Instructor payouts',
            ].map((item) => (
              <label
                key={item}
                className="flex items-center justify-between rounded-2xl bg-slate-50 p-4"
              >
                <span className="font-semibold text-slate-700">{item}</span>
                <input
                  type="checkbox"
                  defaultChecked
                  className="h-5 w-5 accent-cyan-500"
                />
              </label>
            ))}
          </div>
        </Panel>
      </div>
    </DashboardShell>
  );
}
