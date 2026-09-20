import { FaArrowRight } from 'react-icons/fa';

export default function AboutCTA() {
  return (
    <section className="bg-white py-24">
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
            Ready To Start Learning?
          </h2>

          <p className="mx-auto mt-5 max-w-3xl text-lg text-white/90">
            Join thousands of students already learning on TOTC.
            Explore our courses and start your journey today.
          </p>

          <div className="mt-10 flex flex-wrap justify-center gap-5">
            <button
              className="
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
              Explore Courses
            </button>

            <button
              className="
                flex
                items-center
                gap-3
                rounded-full
                border
                border-white/40
                px-8
                py-4
                font-semibold
                text-white
                backdrop-blur
                transition
                hover:bg-white/10
              "
            >
              Contact Us
              <FaArrowRight />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}