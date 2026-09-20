import { PublicLayout } from '../../components/elearning/layout/PublicLayout';
import { btnPrimaryClass, inputClass } from '../../components/elearning/styles';
import { Panel } from '../../components/elearning/ui/Panel';
import { supportChannels } from './supportChannels';
export function ContactPage() {
  return (
    <PublicLayout
      hero={{
        label: 'Contact',
        title: 'Talk with the LSRC learning team',
        subtitle:
          'Send a message about courses, instructor onboarding, billing, or team learning needs.',
      }}
    >
      <main className="mx-auto grid max-w-7xl gap-8 px-6 py-20 lg:grid-cols-[0.8fr_1.2fr]">
        <Panel>
          <h2 className="text-2xl font-bold text-slate-900">
            Support channels
          </h2>
          <div className="mt-6 space-y-5">
            {supportChannels.map(({ label, value, icon: Icon }) => (
              <div
                key={label}
                className="flex items-center gap-4 rounded-2xl bg-slate-50 p-4"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-600">
                  <Icon />
                </span>
                <div>
                  <p className="text-sm text-slate-500">{label}</p>
                  <p className="font-semibold text-slate-900">{value}</p>
                </div>
              </div>
            ))}
          </div>
        </Panel>

        <Panel>
          <h2 className="text-2xl font-bold text-slate-900">Send a message</h2>
          <form className="mt-6 grid gap-5 md:grid-cols-2">
            <input placeholder="Full name" className={inputClass} />
            <input placeholder="Email address" className={inputClass} />
            <input
              placeholder="Subject"
              className={`${inputClass} md:col-span-2`}
            />
            <textarea
              placeholder="How can we help?"
              rows={7}
              className={`${inputClass} md:col-span-2`}
            />
            <button type="button" className={`${btnPrimaryClass} md:w-max`}>
              Send message
            </button>
          </form>
        </Panel>
      </main>
    </PublicLayout>
  );
}
