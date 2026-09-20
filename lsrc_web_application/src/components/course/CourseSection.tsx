import CourseCard from './CourseCard';
import { catalogCourses } from '../../data/elearning';

type Props = {
  title: string;
  subtitle?: string;
};

export default function CourseSection({
  title,
  subtitle,
}: Props) {
  return (
    <section className="py-20">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-10 flex items-end justify-between">
          <div>
            <h2 className="text-3xl font-bold text-slate-800">
              {title}
            </h2>

            {subtitle && (
              <p className="mt-2 text-slate-500">
                {subtitle}
              </p>
            )}
          </div>

          <button
            className="
              rounded-full
              border
              border-cyan-500
              px-5
              py-2
              font-medium
              text-cyan-500
              transition
              hover:bg-cyan-500
              hover:text-white
            "
          >
            See All
          </button>
        </div>

        <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-4">
          {catalogCourses.map((course) => (
            <CourseCard
              key={course.title}
              image={course.image}
              title={course.title}
              category={course.category}
              duration={course.duration}
              price={course.price}
              oldPrice={course.oldPrice}
              slug={course.slug}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
