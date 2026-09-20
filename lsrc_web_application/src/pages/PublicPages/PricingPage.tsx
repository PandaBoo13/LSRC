import { Link } from 'react-router-dom';
import { FaCheckCircle } from 'react-icons/fa';

import { PublicLayout } from '../../components/elearning/layout/PublicLayout';
import { pricingPlans } from '../../data/elearning';

const faqs = [
  {
    q: 'Can I cancel my subscription anytime?',
    a: 'Yes. You can upgrade, downgrade or cancel your subscription whenever you want.',
  },
  {
    q: 'Do courses include certificates?',
    a: 'All premium plans include verified certificates upon course completion.',
  },
  {
    q: 'Is there a free trial available?',
    a: 'Yes. New users can explore selected courses before upgrading.',
  },
  {
    q: 'Can teams purchase together?',
    a: 'Absolutely. Team plans include shared learning management and reporting tools.',
  },
];

export function PricingPage() {
  return (
    <PublicLayout
      className="min-h-screen bg-slate-50"
      hero={{
        label: 'Pricing',
        title: 'Choose a plan that fits your learning pace',
        subtitle:
          'Start small, unlock the full catalog, or bring your team into one shared learning workspace.',
      }}
    >
      <main className="mx-auto max-w-7xl px-4 py-10 md:px-6 lg:py-14">
        {/* Header */}
        <section className="mx-auto max-w-3xl text-center">
          <span className="inline-flex rounded-full bg-cyan-50 px-4 py-2 text-sm font-semibold text-cyan-600">
            Flexible Pricing
          </span>

          <h2 className="mt-5 text-4xl font-black tracking-tight text-slate-900 md:text-5xl">
            Simple plans for every learner
          </h2>

          <p className="mt-4 text-lg text-slate-500">
            Choose the plan that matches your goals and start learning today.
          </p>
        </section>

        {/* Pricing Cards */}
        <section className="mt-14 grid gap-6 lg:grid-cols-3">
          {pricingPlans.map((plan) => (
            <div
              key={plan.name}
              className={`
                relative
                rounded-3xl
                border
                p-8
                transition-all
                duration-300
                hover:-translate-y-1

                ${
                  plan.highlight
                    ? `
                      border-cyan-500
                      bg-cyan-500
                      text-white
                    `
                    : `
                      border-slate-200
                      bg-white
                    `
                }
              `}
            >
              {plan.highlight && (
                <span
                  className="
                    mb-5
                    inline-flex
                    rounded-full
                    bg-white/20
                    px-3
                    py-1
                    text-xs
                    font-semibold
                  "
                >
                  Most Popular
                </span>
              )}

              <p
                className={`text-sm font-semibold uppercase tracking-widest ${
                  plan.highlight
                    ? 'text-cyan-100'
                    : 'text-cyan-600'
                }`}
              >
                {plan.name}
              </p>

              <div className="mt-6 flex items-end gap-2">
                <span className="text-5xl font-black">
                  {plan.price}
                </span>

                <span
                  className={
                    plan.highlight
                      ? 'text-cyan-100'
                      : 'text-slate-500'
                  }
                >
                  /month
                </span>
              </div>

              <p
                className={`mt-4 leading-relaxed ${
                  plan.highlight
                    ? 'text-cyan-50'
                    : 'text-slate-500'
                }`}
              >
                {plan.description}
              </p>

              <div className="mt-8 space-y-4">
                {plan.features.map((feature) => (
                  <div
                    key={feature}
                    className="flex items-center gap-3 text-sm"
                  >
                    <FaCheckCircle
                      className={
                        plan.highlight
                          ? 'text-cyan-100'
                          : 'text-cyan-500'
                      }
                    />

                    <span>{feature}</span>
                  </div>
                ))}
              </div>

              <Link
                to="/checkout"
                className={`
                  mt-8
                  flex
                  h-12
                  items-center
                  justify-center
                  rounded-xl
                  font-semibold
                  transition

                  ${
                    plan.highlight
                      ? `
                        bg-white
                        text-cyan-600
                      `
                      : `
                        bg-slate-900
                        text-white
                        hover:bg-slate-800
                      `
                  }
                `}
              >
                Get Started
              </Link>
            </div>
          ))}
        </section>

        {/* Trust */}
        <section className="mt-20 border-t border-slate-200 pt-12">
          <div className="text-center">
            <h3 className="text-5xl font-black text-slate-900">
              10,000+
            </h3>

            <p className="mt-2 text-slate-500">
              learners already trust our platform
            </p>
          </div>
        </section>

        {/* FAQ */}
        <section className="mx-auto mt-20 max-w-4xl">
          <div className="text-center">
            <h3 className="text-3xl font-bold text-slate-900">
              Frequently Asked Questions
            </h3>

            <p className="mt-3 text-slate-500">
              Everything you need to know before getting started.
            </p>
          </div>

          <div className="mt-10 overflow-hidden rounded-3xl border border-slate-200 bg-white">
            {faqs.map((item, index) => (
              <div
                key={item.q}
                className={`p-6 ${
                  index !== faqs.length - 1
                    ? 'border-b border-slate-200'
                    : ''
                }`}
              >
                <h4 className="font-semibold text-slate-900">
                  {item.q}
                </h4>

                <p className="mt-2 text-slate-500">
                  {item.a}
                </p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </PublicLayout>
  );
}