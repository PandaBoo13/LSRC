import { DashboardShell } from "../../../components/elearning/layout/DashboardShell";
import { btnPrimaryClass, inputClass } from "../../../components/elearning/styles";
import { Panel } from "../../../components/elearning/ui/Panel";
import { studentNav } from "../../../data/elearning";
        
export function SettingsPage() {
  return (
    <DashboardShell
      role="Student"
      title="Settings"
      subtitle="Control security, notifications, and learning preferences."
      navItems={studentNav}
    >
      <div className="grid gap-8 xl:grid-cols-2">
        <Panel>
          <h2 className="text-2xl font-bold text-slate-900">Security</h2>
          <div className="mt-6 space-y-5">
            {['Current password', 'New password', 'Confirm password'].map((label) => (
              <input key={label} type="password" placeholder={label} className={inputClass} />
            ))}
          </div>
          <button type="button" className={btnPrimaryClass}>
            Update password
          </button>
        </Panel>

        <Panel>
          <h2 className="text-2xl font-bold text-slate-900">Notifications</h2>
          <div className="mt-6 space-y-4">
            {['Lesson reminders', 'Instructor messages', 'Billing receipts', 'Weekly reports'].map(
              (item) => (
                <label
                  key={item}
                  className="flex items-center justify-between rounded-2xl bg-slate-50 p-4"
                >
                  <span className="font-semibold text-slate-700">{item}</span>
                  <input type="checkbox" defaultChecked className="h-5 w-5 accent-cyan-500" />
                </label>
              ),
            )}
          </div>
        </Panel>
      </div>
    </DashboardShell>
  );
}
