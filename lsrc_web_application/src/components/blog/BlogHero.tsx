export default function BlogHero() {
  return (
    <section className="bg-[#EEF6FD] py-20">
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-6 lg:grid-cols-2">
        <div>
          <p className="font-medium">
            By Themadbrains in{' '}
            <span className="text-cyan-500">
              Inspiration
            </span>
          </p>

          <h1 className="mt-5 max-w-xl text-5xl font-bold leading-tight text-[#252B61]">
            Why Swift UI Should Be on the Radar of Every Mobile Developer
          </h1>

          <p className="mt-6 max-w-lg text-lg leading-8 text-slate-500">
            Lorem ipsum dolor sit amet consectetur
            adipisicing elit sed do eiusmod tempor.
          </p>

          <button className="mt-8 rounded-xl bg-cyan-500 px-8 py-4 font-semibold text-white">
            Start learning now
          </button>
        </div>

        <img
          src="https://images.unsplash.com/photo-1588196749597-9ff075ee6b5b"
          className="h-[420px] w-full rounded-3xl object-cover"
        />
      </div>
    </section>
  );
}