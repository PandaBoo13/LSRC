const articles = [1, 2, 3, 4];

export default function MarketingArticles() {
  return (
    <section className="py-20">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-10 flex items-center justify-between">
          <h2 className="text-3xl font-bold">
            Marketing Articles
          </h2>

          <button className="text-cyan-500">
            See all
          </button>
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {articles.map((_, index) => (
            <div
              key={index}
              className="overflow-hidden rounded-3xl bg-white shadow-md"
            >
              <img
                src={`https://picsum.photos/500/350?random=${index}`}
                className="h-52 w-full object-cover"
              />

              <div className="p-5">
                <h3 className="text-xl font-bold">
                  AWS Certified Solutions
                  Architect
                </h3>

                <p className="mt-3 text-sm text-slate-500">
                  Lorem ipsum dolor sit amet,
                  consectetur adipisicing elit.
                </p>

                <div className="mt-5 flex items-center justify-between">
                  <span>Lina</span>

                  <span className="font-bold text-cyan-500">
                    $80
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}