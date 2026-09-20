import { PublicLayout } from '../../components/elearning/layout/PublicLayout';
import { Panel } from '../../components/elearning/ui/Panel';

const sections = [
  {
    title: '1. Acceptance of Terms',
    body: 'By accessing LSRC (Learning & Study Resource Center), you agree to these Terms of Service and our Privacy Policy. If you do not agree, please do not use the platform.',
  },
  {
    title: '2. Accounts and Eligibility',
    body: 'You must provide accurate registration information and keep your credentials secure. You are responsible for activity under your account. Users under 16 require parental consent where applicable.',
  },
  {
    title: '3. Course Access and Content',
    body: 'Course materials are licensed for personal, non-commercial learning. Redistribution, recording, or resale of content without written permission is prohibited. Access duration depends on your purchase or subscription plan.',
  },
  {
    title: '4. Payments and Refunds',
    body: 'Prices are shown at checkout. Refund requests within 14 days may be approved if course completion is below 20%. Team and enterprise billing follows separate agreements.',
  },
  {
    title: '5. Instructor Content',
    body: 'Instructors retain ownership of original materials but grant LSRC a license to host and distribute content on the platform. LSRC may remove content that violates community guidelines.',
  },
  {
    title: '6. Limitation of Liability',
    body: 'LSRC provides the platform "as is." We do not guarantee specific learning outcomes. Liability is limited to the amount paid for the relevant course or subscription in the prior twelve months.',
  },
];

export function TermsPage() {
  return (
    <PublicLayout
      hero={{
        label: 'Legal',
        title: 'Terms of Service',
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
