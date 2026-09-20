import { PublicLayout } from '../../components/elearning/layout/PublicLayout';
import { Panel } from '../../components/elearning/ui/Panel';

const sections = [
  {
    title: 'Information We Collect',
    body: 'We collect account details (name, email), learning activity (progress, quiz scores), payment metadata, and technical logs (IP, device, browser) to operate and improve the platform.',
  },
  {
    title: 'How We Use Data',
    body: 'Data is used to deliver courses, personalize recommendations, process payments, send service notifications, and produce anonymized analytics. We do not sell personal data to third parties.',
  },
  {
    title: 'Cookies and Analytics',
    body: 'LSRC uses essential cookies for authentication and optional analytics cookies to understand usage patterns. You can manage preferences in Settings.',
  },
  {
    title: 'Data Retention',
    body: 'Account data is retained while your account is active. Billing records are kept as required by law. You may request deletion subject to legal and contractual obligations.',
  },
  {
    title: 'Your Rights',
    body: 'Depending on your region, you may access, correct, export, or delete personal data. Contact privacy@lsrc.edu for requests. We respond within 30 days.',
  },
  {
    title: 'Contact',
    body: 'For privacy questions, email privacy@lsrc.edu or write to LSRC Data Protection, Ho Chi Minh City, Vietnam.',
  },
];

export function PrivacyPage() {
  return (
    <PublicLayout
      hero={{
        label: 'Legal',
        title: 'Privacy Policy',
        subtitle: 'Last updated: June 1, 2026',
      }}
    >
      <div className="mx-auto max-w-3xl space-y-6 px-6 py-16">
        {sections.map((section) => (
          <Panel key={section.title}>
            <h2 className="text-lg font-bold text-slate-900">{section.title}</h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">{section.body}</p>
          </Panel>
        ))}
      </div>
    </PublicLayout>
  );
}
