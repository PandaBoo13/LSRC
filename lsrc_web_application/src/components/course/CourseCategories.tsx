const categories = [
  'Design',
  'Development',
  'Business',
  'Marketing',
  'Data Science',
  'Photography',
];

export default function CourseCategories() {
  return (
    <section className="py-20">
      <div className="mx-auto max-w-7xl px-6">
        <h2 className="mb-10 text-3xl font-bold">
          Categories
        </h2>

        <div className="flex flex-wrap gap-4">
          {categories.map((item) => (
            <button
              key={item}
              className="
                rounded-full
                bg-cyan-50
                px-8
                py-4
                text-cyan-600
                transition
                hover:bg-cyan-500
                hover:text-white
              "
            >
              {item}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}