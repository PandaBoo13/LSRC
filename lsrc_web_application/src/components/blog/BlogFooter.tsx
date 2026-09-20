export default function BlogFooter() {
  return (
    <footer className="bg-[#252641] py-20 text-white">
      <div className="mx-auto max-w-4xl px-6 text-center">
        <h2 className="text-3xl font-bold">
          TOTC
        </h2>

        <p className="mt-2 text-white/70">
          Virtual Class for Zoom
        </p>

        <h3 className="mt-12 text-2xl">
          Subscribe to get our Newsletter
        </h3>

        <div className="mx-auto mt-6 flex max-w-xl">
          <input
            placeholder="Your Email"
            className="flex-1 rounded-l-full border border-white/20 bg-transparent px-6 py-4 outline-none"
          />

          <button className="rounded-r-full bg-cyan-500 px-8">
            Subscribe
          </button>
        </div>

        <div className="mt-12 flex justify-center gap-8 text-sm text-white/60">
          <span>Careers</span>
          <span>Privacy Policy</span>
          <span>Terms & Conditions</span>
        </div>

        <p className="mt-6 text-white/50">
          © 2026 TOTC
        </p>
      </div>
    </footer>
  );
}