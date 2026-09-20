export default function FeaturedCourse() {
  return (
    <section className="py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid items-center gap-12 rounded-[40px] bg-cyan-500 p-12 text-white md:grid-cols-2">
          <div>
            <span>Featured Course</span>

            <h2 className="mt-4 text-5xl font-bold">
              Complete Fullstack Development
            </h2>

            <p className="mt-5 text-white/80">
              Become a professional developer with
              React, NodeJS, Spring Boot and Cloud.
            </p>

            <button className="mt-8 rounded-full bg-white px-8 py-3 font-semibold text-cyan-600">
              Start Learning
            </button>
          </div>

          <img
            src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3"
            className="rounded-3xl"
          />
        </div>
      </div>
    </section>
  );
}