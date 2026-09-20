import { FaCertificate } from "react-icons/fa";
import { DashboardShell } from "../../../components/elearning/layout/DashboardShell";
import { Panel } from "../../../components/elearning/ui/Panel";
import { StatusPill } from "../../../components/elearning/ui/StatusPill";
import { certificates, studentNav } from "../../../data/elearning";

export function CertificatesPage() {
  return (
    <DashboardShell
      role="Student"
      title="Certificates"
      subtitle="Download and share completed learning milestones."
      navItems={studentNav}
    >
      <div className="grid gap-6 lg:grid-cols-2">
        {certificates.map((certificate) => (
          <Panel key={certificate.id}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-500">
                  {certificate.id}
                </p>
                <h2 className="mt-3 text-2xl font-bold text-slate-900">{certificate.title}</h2>
                <p className="mt-2 text-sm text-slate-500">Issued on {certificate.issued}</p>
              </div>
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-500">
                <FaCertificate />
              </div>
            </div>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <StatusPill tone="green">Grade {certificate.grade}</StatusPill>
              <button
                type="button"
                className="rounded-full bg-cyan-500 px-5 py-3 text-sm font-semibold text-white"
              >
                Download PDF
              </button>
            </div>
          </Panel>
        ))}
      </div>
    </DashboardShell>
  );
}