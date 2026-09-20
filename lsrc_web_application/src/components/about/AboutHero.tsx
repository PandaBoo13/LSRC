import { FaPlayCircle } from 'react-icons/fa';

export default function AboutHero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-cyan-500 via-blue-500 to-indigo-600 pt-32">
      <div className="mx-auto max-w-7xl px-6 py-24">
        <div className="grid items-center gap-16 lg:grid-cols-2">
          {/* LEFT */}
          <div className="text-white">
            <span className="rounded-full bg-white/20 px-4 py-2 text-sm font-medium backdrop-blur">
              About TOTC
            </span>

            <h1 className="mt-6 text-5xl font-bold leading-tight lg:text-7xl">
              Empowering
              <br />
              Education
              <br />
              Through
              Technology
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-8 text-white/90">
              We believe learning should be accessible, engaging and inspiring
              for everyone. Our mission is to connect learners with world-class
              educational experiences.
            </p>

            <div className="mt-10 flex flex-wrap gap-4">
              <button className="rounded-full bg-white px-8 py-4 font-semibold text-cyan-600 transition hover:scale-105">
                Explore Courses
              </button>

              <button className="flex items-center gap-3 rounded-full border border-white/30 px-8 py-4 font-semibold backdrop-blur transition hover:bg-white/10">
                <FaPlayCircle />
                Watch Story
              </button>
            </div>
          </div>

          {/* RIGHT */}
          <div className="relative">
            <img
              src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=1400"
              alt=""
              className="rounded-[40px] shadow-2xl"
            />

            <div className="absolute -left-6 top-10 rounded-3xl bg-white p-5 shadow-xl">
              <div className="text-4xl font-bold text-cyan-500">1M+</div>
              <div className="text-sm text-slate-500">Students</div>
            </div>

            <div className="absolute -right-6 bottom-10 rounded-3xl bg-white p-5 shadow-xl">
              <div className="text-4xl font-bold text-cyan-500">500+</div>
              <div className="text-sm text-slate-500">Courses</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}