export default function CTASection() {
  return (
    <section className="py-20">
      <div className="mx-auto max-w-7xl px-6">
        <div
          className="
            relative
            overflow-hidden
            rounded-[40px]
            bg-gradient-to-r
            from-[#5B72EE]
            to-[#7B61FF]
            px-12
            py-16
            text-white
          "
        >
          {/* Decoration */}
          <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10" />
          <div className="absolute -bottom-10 left-20 h-32 w-32 rounded-full bg-white/10" />

          <div className="relative z-10 flex flex-col items-center justify-between gap-8 lg:flex-row">
            <div>
              <span className="mb-3 inline-block rounded-full bg-white/20 px-4 py-2 text-sm">
                ONLINE LEARNING
              </span>

              <h2 className="max-w-2xl text-4xl font-bold leading-tight">
                Online coaching lessons for remote learning.
              </h2>

              <p className="mt-4 max-w-xl text-white/80">
                Learn from anywhere with world-class instructors and
                professional courses.
              </p>
            </div>

            <button
              className="
                rounded-full
                bg-white
                px-8
                py-4
                font-semibold
                text-[#5B72EE]
                transition
                hover:scale-105
              "
            >
              Start Learning
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}