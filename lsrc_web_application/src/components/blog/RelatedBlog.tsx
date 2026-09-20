import { FaEye } from 'react-icons/fa';

const blogs = [1, 2];

export default function RelatedBlog() {
  return (
    <section className="bg-[#EEF6FD] py-20">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-10 flex items-center justify-between">
          <h2 className="text-3xl font-bold">Related Blog</h2>

          <button className="text-cyan-500">See all</button>
        </div>

        <div className="grid gap-10 lg:grid-cols-2">
          {blogs.map((_, index) => (
            <div key={index} className="rounded-3xl bg-white p-5 shadow-sm">
              <img
                src="https://images.unsplash.com/photo-1588196749597-9ff075ee6b5b"
                className="h-72 w-full rounded-2xl object-cover"
              />

              <h3 className="mt-6 text-2xl font-bold text-[#252B61]">
                Class adds $30 million to its balance sheet for a Zoom-friendly
                edtech solution
              </h3>

              <div className="mt-5 flex items-center gap-3">
                <img
                  src="https://i.pravatar.cc/100?img=32"
                  className="h-10 w-10 rounded-full"
                />

                <span>Lina</span>
              </div>

              <p className="mt-4 text-slate-500">
                Class, launched less than a year ago by Blackboard co-founder
                Michael Chasen...
              </p>

              <div className="mt-8 flex items-center justify-between">
                <button className="underline">Read more</button>

                <div className="flex items-center gap-2 text-slate-400">
                  <FaEye />
                  251,232
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
