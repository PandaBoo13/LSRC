import type { ReactNode } from 'react';

import Footer from '../../Footer';
import Header from '../../Header';
import { PublicHero } from './PublicHero';

type PublicLayoutProps = {
  children: ReactNode;
  className?: string;
  hero?: {
    label: string;
    title: string;
    subtitle: string;
  };
  showFooter?: boolean;
};

export function PublicLayout({
  children,
  className = 'bg-slate-50',
  hero,
  showFooter = true,
}: PublicLayoutProps) {
  return (
    <div
      className={`
        relative
        flex
        min-h-screen
        flex-col
        overflow-x-hidden
        ${className}
      `}
    >
      {/* Background Decoration */}
      <div
        className="
          pointer-events-none
          fixed
          inset-0
          -z-10
          overflow-hidden
        "
      >
        <div
          className="
            absolute
            right-0
            top-0
            h-[500px]
            w-[500px]
            rounded-full
            bg-cyan-100/40
            blur-3xl
          "
        />

        <div
          className="
            absolute
            bottom-0
            left-0
            h-[400px]
            w-[400px]
            rounded-full
            bg-sky-100/30
            blur-3xl
          "
        />
      </div>

      {/* Header */}
      <Header />

      {/* Hero */}
      {hero && (
        <div
          className="
            relative
            z-10
            shrink-0
          "
        >
          <PublicHero
            label={hero.label}
            title={hero.title}
            subtitle={hero.subtitle}
          />
        </div>
      )}

      {/* Content */}
      <main
        className={`
          relative
          z-10
          flex-1

          ${
            hero
              ? ''
              : `
                pt-20
                sm:pt-24
              `
          }
        `}
      >
        <div
          className="
            mx-auto
            w-full
            max-w-[1920px]
          "
        >
          {children}
        </div>
      </main>

      {/* Footer */}
      {showFooter && (
        <footer
          className="
            relative
            z-10
            mt-auto
          "
        >
          <Footer />
        </footer>
      )}
    </div>
  );
}