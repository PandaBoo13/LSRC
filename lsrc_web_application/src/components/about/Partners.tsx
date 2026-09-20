const partners = [
  {
    name: 'Rosedale Global High School',
    logo: '/images/BA-Partner-Unis-Logos-1.png',
    bgColor: 'bg-white',
  },
  {
    name: 'Swiss Hotel Management School',
    logo: '/images/BA-Partner-Unis-Logos-2.png',
    bgColor: 'bg-white',
  },
  {
    name: 'De Montfort University Leicester',
    logo: '/images/BA-Partner-Unis-Logos.png',
    bgColor: 'bg-white',
  },
  {
    name: 'Lincoln Bishop University',
    logo: '/images/Untitled-design-2.png',
    bgColor: 'bg-[#3c2a58]', // Màu nền tím
  },
  {
    name: 'OTHM Qualifications',
    logo: '/images/BA-Partner-Unis-Logos-1-1.png',
    bgColor: 'bg-[#007b92]', // Màu nền xanh teal
  },
];

export default function Partners() {
  return (
    <section className="bg-slate-50 py-24">
      <div className="mx-auto max-w-7xl px-6">
        {/* HEADER */}
        <div className="mx-auto mb-16 max-w-3xl text-center">
          <h2 className="text-4xl font-extrabold text-slate-800 lg:text-5xl">
            Our Renowned University Partners
          </h2>

          <p className="mt-4 text-base leading-relaxed text-slate-500">
            Study with Birmingham Academy in Singapore and earn the same qualifications awarded to graduates at our university partner's home campuses.
          </p>
        </div>

        {/* PARTNERS GRID */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto items-stretch">
          {partners.map((partner) => (
            <div
              key={partner.name}
              className={`flex h-44 items-center justify-center overflow-hidden rounded-3xl p-6 shadow-sm border border-slate-100 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${partner.bgColor}`}
            >
              <img
                src={partner.logo}
                alt={partner.name}
                className="max-h-full max-w-full object-contain"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}