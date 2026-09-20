import { useState } from 'react';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';

import { faqItems, helpCategories } from '../../data/help';
import { Panel } from '../elearning/ui/Panel';

export function HelpFaqSection() {
  const [openId, setOpenId] = useState<string | null>('faq-1');
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const filtered =
    activeCategory === 'all'
      ? faqItems
      : faqItems.filter((item) => item.category === activeCategory);

  return (
    <section className="mx-auto max-w-7xl px-6 py-16">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {helpCategories.map((cat) => (
          <Panel
            key={cat.id}
            className="cursor-pointer transition hover:-translate-y-1 hover:shadow-lg"
          >
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-500">
              {cat.articleCount} articles
            </p>
            <h3 className="mt-2 text-lg font-bold text-slate-900">{cat.title}</h3>
            <p className="mt-2 text-sm text-slate-500">{cat.description}</p>
          </Panel>
        ))}
      </div>

      <div className="mt-12 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setActiveCategory('all')}
          className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
            activeCategory === 'all'
              ? 'bg-cyan-500 text-white'
              : 'bg-slate-100 text-slate-600 hover:bg-cyan-50'
          }`}
        >
          All
        </button>
        {helpCategories.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => setActiveCategory(cat.id)}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
              activeCategory === cat.id
                ? 'bg-cyan-500 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-cyan-50'
            }`}
          >
            {cat.title}
          </button>
        ))}
      </div>

      <div className="mt-8 space-y-3">
        {filtered.map((item) => {
          const isOpen = openId === item.id;
          return (
            <Panel key={item.id} className="overflow-hidden p-0">
              <button
                type="button"
                onClick={() => setOpenId(isOpen ? null : item.id)}
                className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
              >
                <span className="font-semibold text-slate-900">{item.question}</span>
                {isOpen ? (
                  <FaChevronUp className="shrink-0 text-cyan-500" />
                ) : (
                  <FaChevronDown className="shrink-0 text-slate-400" />
                )}
              </button>
              {isOpen && (
                <div className="border-t border-slate-100 px-6 pb-5 pt-2 text-sm leading-relaxed text-slate-600">
                  {item.answer}
                </div>
              )}
            </Panel>
          );
        })}
      </div>
    </section>
  );
}
