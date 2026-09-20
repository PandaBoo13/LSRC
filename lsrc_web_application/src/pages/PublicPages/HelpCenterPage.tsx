import { Link } from 'react-router-dom';
import { FaEnvelope, FaHeadset, FaLifeRing } from 'react-icons/fa';

import { PublicLayout } from '../../components/elearning/layout/PublicLayout';
import { btnPrimaryClass, inputClass } from '../../components/elearning/styles';
import { Panel } from '../../components/elearning/ui/Panel';
import { HelpFaqSection } from '../../components/help/HelpFaqSection';

export function HelpCenterPage() {
  return (
    <PublicLayout
      hero={{
        label: 'Help Center',
        title: 'How can we help you learn?',
        subtitle:
          'Browse FAQs, contact support, and find guides for courses, billing, and instructor tools.',
      }}
    >
      <section className="mx-auto grid max-w-7xl gap-6 px-6 py-12 md:grid-cols-3">
        {[
          {
            icon: FaLifeRing,
            title: 'Self-service guides',
            text: 'Step-by-step articles for enrollment, quizzes, and certificates.',
          },
          {
            icon: FaHeadset,
            title: 'Live support',
            text: 'Chat with our team Mon–Fri, 9:00–18:00 ICT.',
          },
          {
            icon: FaEnvelope,
            title: 'Email us',
            text: 'support@lsrc.edu — typical response within 24 hours.',
          },
        ].map(({ icon: Icon, title, text }) => (
          <Panel key={title}>
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-600">
              <Icon />
            </span>
            <h3 className="mt-4 text-lg font-bold text-slate-900">{title}</h3>
            <p className="mt-2 text-sm text-slate-500">{text}</p>
          </Panel>
        ))}
      </section>

      <HelpFaqSection />

      <section className="mx-auto max-w-3xl px-6 pb-20">
        <Panel>
          <h2 className="text-2xl font-bold text-slate-900">Still need help?</h2>
          <p className="mt-2 text-slate-500">
            Send us a message and include your account email for faster support.
          </p>
          <form className="mt-6 grid gap-4">
            <input placeholder="Your email" className={inputClass} />
            <textarea
              placeholder="Describe your issue"
              rows={4}
              className={inputClass}
            />
            <Link to="/contact" className={`${btnPrimaryClass} w-max`}>
              Contact support
            </Link>
          </form>
        </Panel>
      </section>
    </PublicLayout>
  );
}
