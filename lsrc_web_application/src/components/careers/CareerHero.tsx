import { FaArrowRight } from 'react-icons/fa';

export default function CareerHero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-cyan-500 via-blue-500 to-indigo-600">
      <div className="mx-auto max-w-7xl px-6 py-28">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          {/* LEFT */}
          <div className="text-white">
            <span className="rounded-full bg-white/20 px-4 py-2 text-sm font-medium backdrop-blur">
              🚀 We're Hiring
            </span>

            <h1 className="mt-6 text-5xl font-bold leading-tight lg:text-7xl">
              Build The Future
              <br />
              Of Education
            </h1>

            <p className="mt-6 max-w-xl text-lg text-white/90">
              Join our mission to transform online learning and help millions
              of students worldwide unlock their potential.
            </p>

            <div className="mt-10 flex flex-wrap gap-4">
              <button className="rounded-full bg-white px-8 py-4 font-semibold text-cyan-600 transition hover:scale-105">
                Browse Jobs
              </button>

              <button className="flex items-center gap-2 rounded-full border border-white/40 px-8 py-4 font-semibold text-white backdrop-blur transition hover:bg-white/10">
                Learn More
                <FaArrowRight />
              </button>
            </div>
          </div>

          {/* RIGHT */}
          <div className="relative">
            <img
              src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=1600"
              alt=""
              className="rounded-[40px] shadow-2xl"
            />

            <div className="absolute -left-6 top-10 rounded-3xl bg-white p-5 shadow-xl">
              <div className="text-3xl font-bold text-slate-800">150+</div>
              <div className="text-sm text-slate-500">Employees</div>
            </div>

            <div className="absolute -right-6 bottom-10 rounded-3xl bg-white p-5 shadow-xl">
              <div className="text-3xl font-bold text-slate-800">45+</div>
              <div className="text-sm text-slate-500">Open Jobs</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}