const steps = [
  {
    step: '01',
    title: 'Apply',
    desc: 'Submit your application.',
  },
  {
    step: '02',
    title: 'Screening',
    desc: 'Initial HR review.',
  },
  {
    step: '03',
    title: 'Interview',
    desc: 'Meet the hiring team.',
  },
  {
    step: '04',
    title: 'Assessment',
    desc: 'Technical or practical task.',
  },
  {
    step: '05',
    title: 'Offer',
    desc: 'Receive your offer.',
  },
];

export default function RecruitmentTimeline() {
  return (
    <section className="bg-white py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-16 text-center">
          <h2 className="text-4xl font-bold">
            Recruitment Process
          </h2>

          <p className="mt-3 text-slate-500">
            Simple and transparent hiring process.
          </p>
        </div>

        <div className="relative">
          <div
            className="
              absolute
              left-0
              right-0
              top-14
              hidden
              h-1
              bg-cyan-100
              lg:block
            "
          />

          <div className="grid gap-10 lg:grid-cols-5">
            {steps.map((item) => (
              <div
                key={item.step}
                className="relative text-center"
              >
                <div
                  className="
                    mx-auto
                    flex
                    h-28
                    w-28
                    items-center
                    justify-center
                    rounded-full
                    bg-cyan-500
                    text-3xl
                    font-bold
                    text-white
                    shadow-xl
                  "
                >
                  {item.step}
                </div>

                <h3 className="mt-6 text-2xl font-bold">
                  {item.title}
                </h3>

                <p className="mt-2 text-slate-500">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}