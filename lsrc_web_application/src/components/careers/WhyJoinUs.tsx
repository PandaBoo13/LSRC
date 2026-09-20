import {
  FaGlobe,
  FaLightbulb,
  FaRocket,
} from 'react-icons/fa';

const items = [
  {
    icon: FaLightbulb,
    title: 'Innovation',
    desc: 'Work on cutting-edge education technology that impacts millions of learners.',
  },
  {
    icon: FaRocket,
    title: 'Career Growth',
    desc: 'Continuous learning opportunities, mentorship and promotion pathways.',
  },
  {
    icon: FaGlobe,
    title: 'Global Team',
    desc: 'Collaborate with talented professionals from around the world.',
  },
];

export default function WhyJoinUs() {
  return (
    <section className="bg-slate-50 py-20">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-14 text-center">
          <h2 className="text-4xl font-bold text-slate-800">
            Why Join Us?
          </h2>

          <p className="mt-3 text-slate-500">
            More than a job, build a meaningful career.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {items.map((item) => {
            const Icon = item.icon;

            return (
              <div
                key={item.title}
                className="
                  rounded-3xl
                  bg-white
                  p-8
                  shadow-sm
                  transition-all
                  duration-300
                  hover:-translate-y-2
                  hover:shadow-xl
                "
              >
                <div
                  className="
                    mb-6
                    flex
                    h-16
                    w-16
                    items-center
                    justify-center
                    rounded-2xl
                    bg-cyan-100
                    text-2xl
                    text-cyan-500
                  "
                >
                  <Icon />
                </div>

                <h3 className="mb-3 text-2xl font-bold text-slate-800">
                  {item.title}
                </h3>

                <p className="leading-7 text-slate-500">
                  {item.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}