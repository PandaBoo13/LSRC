import {
  FaLaptopHouse,
  FaMoneyBillWave,
  FaGraduationCap,
  FaHeartbeat,
  FaPlaneDeparture,
  FaRocket,
} from 'react-icons/fa';

const benefits = [
  {
    icon: FaLaptopHouse,
    title: 'Remote First',
  },
  {
    icon: FaMoneyBillWave,
    title: 'Competitive Salary',
  },
  {
    icon: FaGraduationCap,
    title: 'Learning Budget',
  },
  {
    icon: FaHeartbeat,
    title: 'Health Insurance',
  },
  {
    icon: FaPlaneDeparture,
    title: 'Paid Vacation',
  },
  {
    icon: FaRocket,
    title: 'Career Growth',
  },
];

export default function Benefits() {
  return (
    <section className="bg-slate-50 py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-14 text-center">
          <h2 className="text-4xl font-bold">
            Benefits & Perks
          </h2>

          <p className="mt-3 text-slate-500">
            Everything you need to thrive.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
          {benefits.map((item) => {
            const Icon = item.icon;

            return (
              <div
                key={item.title}
                className="
                  rounded-3xl
                  bg-white
                  p-8
                  text-center
                  shadow-sm
                  transition-all
                  duration-300
                  hover:-translate-y-2
                  hover:shadow-xl
                "
              >
                <div
                  className="
                    mx-auto
                    mb-5
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

                <h3 className="text-xl font-semibold">
                  {item.title}
                </h3>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}