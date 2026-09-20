import { useState } from 'react';
import {
  FaChevronDown,
  FaChevronUp,
} from 'react-icons/fa';

const faqs = [
  {
    question:
      'Do you support remote work?',
    answer:
      'Yes. Most of our positions are fully remote and allow flexible working hours.',
  },
  {
    question:
      'Can fresh graduates apply?',
    answer:
      'Absolutely. We welcome talented fresh graduates and interns.',
  },
  {
    question:
      'How long is the hiring process?',
    answer:
      'Typically between 1 and 3 weeks depending on the role.',
  },
  {
    question:
      'Do you provide training?',
    answer:
      'Yes. Every employee receives a learning budget and mentorship support.',
  },
];

export default function FAQ() {
  const [open, setOpen] =
    useState<number | null>(0);

  return (
    <section className="bg-slate-50 py-24">
      <div className="mx-auto max-w-4xl px-6">
        <div className="mb-14 text-center">
          <h2 className="text-4xl font-bold">
            Frequently Asked Questions
          </h2>

          <p className="mt-3 text-slate-500">
            Everything you need to know before
            joining us.
          </p>
        </div>

        <div className="space-y-5">
          {faqs.map((faq, index) => (
            <div
              key={faq.question}
              className="
                overflow-hidden
                rounded-3xl
                bg-white
                shadow-sm
              "
            >
              <button
                onClick={() =>
                  setOpen(
                    open === index
                      ? null
                      : index,
                  )
                }
                className="
                  flex
                  w-full
                  items-center
                  justify-between
                  p-6
                  text-left
                "
              >
                <span className="text-lg font-semibold">
                  {faq.question}
                </span>

                {open === index ? (
                  <FaChevronUp />
                ) : (
                  <FaChevronDown />
                )}
              </button>

              <div
                className={`
                  overflow-hidden
                  transition-all
                  duration-300
                  ${
                    open === index
                      ? 'max-h-40'
                      : 'max-h-0'
                  }
                `}
              >
                <p className="px-6 pb-6 text-slate-500">
                  {faq.answer}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}