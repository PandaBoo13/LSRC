export default function CourseHero() {
  return (
    <section className="bg-[#EAF3FA] pt-40 pb-20">
      <div className="mx-auto grid max-w-7xl grid-cols-2 items-center gap-20 px-6">
        <div>
          <span className="text-cyan-500">
            Explore Our Courses
          </span>

          <h1 className="mt-4 text-6xl font-bold leading-tight text-slate-800">
            Learn New Skills
            <br />
            Anytime Anywhere
          </h1>

          <p className="mt-6 text-lg text-slate-500">
            Discover thousands of online courses taught
            by expert instructors.
          </p>

          <div className="mt-8 flex gap-4">
            <input
              placeholder="Search courses..."
              className="h-14 flex-1 rounded-full border px-6"
            />

            <button className="rounded-full bg-cyan-500 px-8 text-white">
              Search
            </button>
          </div>
        </div>

        <img
          src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1400"
          className="rounded-3xl shadow-xl"
        />
      </div>
    </section>
  );
}