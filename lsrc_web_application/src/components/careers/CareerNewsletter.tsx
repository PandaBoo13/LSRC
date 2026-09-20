export default function CareerNewsletter() {
  return (
    <section className="bg-white py-20">
      <div className="mx-auto max-w-4xl px-6 text-center">
        <h2 className="text-4xl font-bold">
          Stay Updated
        </h2>

        <p className="mt-4 text-slate-500">
          Receive notifications when new
          positions become available.
        </p>

        <div className="mx-auto mt-10 flex max-w-2xl flex-col gap-4 sm:flex-row">
          <input
            type="email"
            placeholder="Enter your email"
            className="
              h-14
              flex-1
              rounded-full
              border
              border-slate-200
              px-6
              outline-none
              focus:border-cyan-500
            "
          />

          <button
            className="
              rounded-full
              bg-cyan-500
              px-8
              font-semibold
              text-white
              transition
              hover:bg-cyan-600
            "
          >
            Subscribe
          </button>
        </div>
      </div>
    </section>
  );
}