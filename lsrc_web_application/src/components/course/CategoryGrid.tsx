import {
  FaPalette,
  FaCode,
  FaBriefcase,
  FaBullhorn,
  FaCamera,
  FaMicrophone,
  FaChartLine,
  FaLaptopCode,
} from 'react-icons/fa';

const categories = [
  {
    name: 'Design',
    icon: FaPalette,
    color: 'bg-pink-100 text-pink-500',
  },
  {
    name: 'Development',
    icon: FaCode,
    color: 'bg-cyan-100 text-cyan-500',
  },
  {
    name: 'Business',
    icon: FaBriefcase,
    color: 'bg-orange-100 text-orange-500',
  },
  {
    name: 'Marketing',
    icon: FaBullhorn,
    color: 'bg-green-100 text-green-500',
  },
  {
    name: 'Photography',
    icon: FaCamera,
    color: 'bg-purple-100 text-purple-500',
  },
  {
    name: 'Acting',
    icon: FaMicrophone,
    color: 'bg-yellow-100 text-yellow-500',
  },
  {
    name: 'Finance',
    icon: FaChartLine,
    color: 'bg-red-100 text-red-500',
  },
  {
    name: 'Programming',
    icon: FaLaptopCode,
    color: 'bg-blue-100 text-blue-500',
  },
];

export default function CategoryGrid() {
  return (
    <section className="bg-white py-20">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-10">
          <h2 className="text-3xl font-bold text-slate-800">
            Choose Favourite Course
          </h2>

          <p className="mt-2 text-slate-500">
            Find the right category for your learning journey.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((item) => {
            const Icon = item.icon;

            return (
              <div
                key={item.name}
                className="
                  group
                  rounded-3xl
                  border
                  border-slate-100
                  bg-white
                  p-6
                  shadow-sm
                  transition-all
                  duration-300
                  hover:-translate-y-2
                  hover:shadow-xl
                "
              >
                <div
                  className={`
                    mb-5
                    flex
                    h-16
                    w-16
                    items-center
                    justify-center
                    rounded-2xl
                    text-2xl
                    ${item.color}
                  `}
                >
                  <Icon />
                </div>

                <h3 className="mb-2 text-lg font-semibold text-slate-800">
                  {item.name}
                </h3>

                <p className="text-sm text-slate-500">
                  Explore professional courses and improve your skills.
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}