const stats = [
  {
    value: '150+',
    label: 'Employees',
  },
  {
    value: '45+',
    label: 'Open Positions',
  },
  {
    value: '25+',
    label: 'Countries',
  },
  {
    value: '98%',
    label: 'Employee Satisfaction',
  },
];

export default function CareerStatistics() {
  return (
    <section className="bg-white py-20">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((item) => (
            <div
              key={item.label}
              className="
                rounded-3xl
                border
                border-slate-100
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
              <div className="text-5xl font-bold text-cyan-500">
                {item.value}
              </div>

              <div className="mt-3 text-slate-500">
                {item.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}