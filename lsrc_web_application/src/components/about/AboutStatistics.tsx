const statistics = [
  {
    value: '1M+',
    label: 'Students',
  },
  {
    value: '500+',
    label: 'Courses',
  },
  {
    value: '120+',
    label: 'Teachers',
  },
  {
    value: '95%',
    label: 'Satisfaction',
  },
];

export default function AboutStatistics() {
  return (
    <section className="bg-white py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="rounded-[40px] bg-gradient-to-r from-cyan-500 to-blue-600 p-12">
          <div className="grid gap-10 md:grid-cols-2 xl:grid-cols-4">
            {statistics.map((item) => (
              <div
                key={item.label}
                className="text-center text-white"
              >
                <div className="text-5xl font-bold">
                  {item.value}
                </div>

                <div className="mt-3 text-lg text-white/80">
                  {item.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}