import { FaArrowRight } from 'react-icons/fa';

export default function CareerCTA() {
  return (
    <section className="py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div
          className="
            overflow-hidden
            rounded-[40px]
            bg-gradient-to-r
            from-cyan-500
            via-blue-500
            to-indigo-600
            px-10
            py-20
            text-center
            text-white
          "
        >
          <h2 className="text-5xl font-bold">
            Ready To Join Our Team?
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-lg text-white/90">
            Explore exciting opportunities and
            start building your future with us
            today.
          </p>

          <button
            className="
              mt-10
              inline-flex
              items-center
              gap-3
              rounded-full
              bg-white
              px-8
              py-4
              font-semibold
              text-cyan-600
              transition
              hover:scale-105
            "
          >
            Browse Open Positions
            <FaArrowRight />
          </button>
        </div>
      </div>
    </section>
  );
}