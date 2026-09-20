import {
  FaBullseye,
  FaEye,
} from 'react-icons/fa';

export default function MissionVision() {
  return (
    <section className="bg-white py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid gap-8 lg:grid-cols-2">
          {/* MISSION */}
          <div
            className="
              rounded-[40px]
              bg-gradient-to-br
              from-cyan-500
              to-blue-600
              p-10
              text-white
            "
          >
            <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-white/20 text-3xl">
              <FaBullseye />
            </div>

            <h2 className="text-4xl font-bold">
              Our Mission
            </h2>

            <p className="mt-6 text-lg leading-8 text-white/90">
              Delivering Future-Ready Education with New Knowledge, Skills, and Abilities.
            </p>
          </div>

          {/* VISION */}
          <div
            className="
              rounded-[40px]
              bg-slate-900
              p-10
              text-white
            "
          >
            <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-white/10 text-3xl">
              <FaEye />
            </div>

            <h2 className="text-4xl font-bold">
              Our Vision
            </h2>

            <p className="mt-6 text-lg leading-8 text-white/80">
              Leader in Future-Ready Education.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}