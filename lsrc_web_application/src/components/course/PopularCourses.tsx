import {
  FaClock,
  FaStar,
  FaUserGraduate,
} from 'react-icons/fa';

const popularCourses = [
  {
    id: 1,
    title: 'AWS Certified Solutions Architect',
    image:
      'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1200',
    category: 'Development',
    students: 2500,
    duration: '12 Weeks',
    rating: 4.9,
    price: '$80',
  },
  {
    id: 2,
    title: 'UI UX Design Masterclass',
    image:
      'https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=1200',
    category: 'Design',
    students: 1800,
    duration: '8 Weeks',
    rating: 4.8,
    price: '$65',
  },
  {
    id: 3,
    title: 'React Complete Guide',
    image:
      'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?q=80&w=1200',
    category: 'Development',
    students: 3200,
    duration: '10 Weeks',
    rating: 5.0,
    price: '$90',
  },
];

export default function PopularCourses() {
  return (
    <section className="bg-[#F8FBFF] py-24">
      <div className="mx-auto max-w-7xl px-6">
        {/* Header */}
        <div className="mb-14 flex items-end justify-between">
          <div>
            <span className="font-medium text-cyan-500">
              Most Popular
            </span>

            <h2 className="mt-2 text-4xl font-bold text-slate-800">
              Popular Courses
            </h2>

            <p className="mt-3 text-slate-500">
              Explore our most enrolled courses chosen by
              thousands of students worldwide.
            </p>
          </div>

          <button
            className="
              hidden
              rounded-full
              border-2
              border-cyan-500
              px-6
              py-3
              font-medium
              text-cyan-500
              transition
              hover:bg-cyan-500
              hover:text-white
              md:block
            "
          >
            View All
          </button>
        </div>

        {/* Cards */}
        <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
          {popularCourses.map((course) => (
            <div
              key={course.id}
              className="
                group
                overflow-hidden
                rounded-[28px]
                bg-white
                shadow-md
                transition-all
                duration-300
                hover:-translate-y-3
                hover:shadow-2xl
              "
            >
              {/* Image */}
              <div className="relative overflow-hidden">
                <img
                  src={course.image}
                  alt={course.title}
                  className="
                    h-64
                    w-full
                    object-cover
                    transition
                    duration-700
                    group-hover:scale-110
                  "
                />

                <div className="absolute left-5 top-5 rounded-full bg-white px-4 py-2 text-sm font-semibold text-cyan-600 shadow">
                  {course.category}
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <h3 className="text-2xl font-bold text-slate-800">
                  {course.title}
                </h3>

                {/* Meta */}
                <div className="mt-5 flex items-center justify-between text-sm text-slate-500">
                  <div className="flex items-center gap-2">
                    <FaUserGraduate />
                    {course.students}
                  </div>

                  <div className="flex items-center gap-2">
                    <FaClock />
                    {course.duration}
                  </div>
                </div>

                {/* Rating */}
                <div className="mt-5 flex items-center gap-2">
                  <FaStar className="text-yellow-400" />

                  <span className="font-semibold">
                    {course.rating}
                  </span>

                  <span className="text-slate-400">
                    (1,250 Reviews)
                  </span>
                </div>

                {/* Footer */}
                <div className="mt-7 flex items-center justify-between">
                  <span className="text-3xl font-bold text-cyan-500">
                    {course.price}
                  </span>

                  <button
                    className="
                      rounded-full
                      bg-cyan-500
                      px-6
                      py-3
                      font-medium
                      text-white
                      transition
                      hover:bg-cyan-600
                    "
                  >
                    Enroll Now
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Mobile Button */}
        <div className="mt-10 text-center md:hidden">
          <button
            className="
              rounded-full
              border-2
              border-cyan-500
              px-6
              py-3
              font-medium
              text-cyan-500
            "
          >
            View All
          </button>
        </div>
      </div>
    </section>
  );
}