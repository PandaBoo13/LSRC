type PublicHeroProps = {
  label: string;
  title: string;
  subtitle: string;
};

export function PublicHero({
  label,
  title,
  subtitle,
}: PublicHeroProps) {
  return (
    <section className="relative overflow-hidden border-b border-cyan-100 bg-gradient-to-br from-cyan-50 via-sky-50 to-white">
      {/* Background Decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div
          className="
            absolute
            -right-24
            -top-24
            h-72
            w-72
            rounded-full
            bg-cyan-200/30
            blur-3xl
          "
        />

        <div
          className="
            absolute
            left-0
            top-1/2
            h-64
            w-64
            -translate-y-1/2
            rounded-full
            bg-sky-200/20
            blur-3xl
          "
        />
      </div>

      <div
        className="
          relative
          mx-auto
          max-w-7xl
          px-4
          pt-24
          pb-10
          sm:px-6
          sm:pt-28
          sm:pb-12
          lg:px-8
          lg:pt-32
          lg:pb-14
        "
      >
        {/* Label */}
        <div
          className="
            inline-flex
            items-center
            rounded-full
            border
            border-cyan-200
            bg-white/80
            px-4
            py-2
            backdrop-blur-sm
          "
        >
          <span
            className="
              text-xs
              font-bold
              uppercase
              tracking-[0.25em]
              text-cyan-600
            "
          >
            {label}
          </span>
        </div>

        {/* Title */}
        <h1
          className="
            mt-5
            max-w-4xl
            text-3xl
            font-black
            leading-tight
            tracking-tight
            text-slate-900
            sm:text-4xl
            md:text-5xl
            lg:text-6xl
          "
        >
          {title}
        </h1>

        {/* Subtitle */}
        <p
          className="
            mt-5
            max-w-3xl
            text-base
            leading-relaxed
            text-slate-600
            sm:text-lg
            lg:text-xl
          "
        >
          {subtitle}
        </p>

        {/* Bottom Accent */}
        <div className="mt-8 flex items-center gap-3">
          <div className="h-2 w-2 rounded-full bg-cyan-500" />
          <div className="h-[2px] w-16 rounded-full bg-cyan-300" />
        </div>
      </div>
    </section>
  );
}