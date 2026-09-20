export default function WorkCulture() {
  return (
    <section className="bg-slate-50 py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid items-center gap-16 lg:grid-cols-2">
          {/* IMAGE */}
          <div className="relative">
            <img
              src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=1600"
              alt=""
              className="rounded-[40px] shadow-xl"
            />

            <div
              className="
                absolute
                -bottom-8
                -right-8
                rounded-3xl
                bg-white
                p-6
                shadow-xl
              "
            >
              <div className="text-4xl font-bold text-cyan-500">
                98%
              </div>

              <div className="text-slate-500">
                Employee Happiness
              </div>
            </div>
          </div>

          {/* CONTENT */}
          <div>
            <span
              className="
                rounded-full
                bg-cyan-100
                px-4
                py-2
                text-sm
                font-medium
                text-cyan-600
              "
            >
              OUR CULTURE
            </span>

            <h2 className="mt-6 text-5xl font-bold leading-tight text-slate-800">
              Work With Amazing People
            </h2>

            <p className="mt-6 text-lg leading-8 text-slate-500">
              We believe great products come
              from great teams. Our culture
              encourages creativity,
              collaboration and continuous
              learning.
            </p>

            <div className="mt-10 grid gap-4">
              <div className="rounded-2xl bg-white p-5 shadow-sm">
                🌍 Global remote-first culture
              </div>

              <div className="rounded-2xl bg-white p-5 shadow-sm">
                🚀 Fast career growth
              </div>

              <div className="rounded-2xl bg-white p-5 shadow-sm">
                🎓 Continuous learning budget
              </div>

              <div className="rounded-2xl bg-white p-5 shadow-sm">
                🤝 Supportive environment
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}