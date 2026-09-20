import { FaArrowRight } from 'react-icons/fa';

interface BlogItem {
  id: number;
  title: string;
  image: string;
  category: string;
  date: string;
}

const featuredPost: BlogItem = {
  id: 1,
  title:
    'Class adds $30 million to its balance sheet for a Zoom-friendly edtech solution',
  image: 'https://images.unsplash.com/photo-1496171367470-9ed9a91ea931?w=1200',
  category: 'NEWS',
  date: 'March 10, 2025',
};

const posts: BlogItem[] = [
  {
    id: 2,
    title: 'Class Technologies Inc. Closes $30 Million Series A Financing',
    image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600',
    category: 'PRESS',
    date: 'March 09, 2025',
  },
  {
    id: 3,
    title: "Zoom's earliest investors are betting millions on a better Zoom",
    image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600',
    category: 'TECH',
    date: 'March 05, 2025',
  },
  {
    id: 4,
    title: 'Former Blackboard CEO Raises $16M to Bring LMS Features to Zoom',
    image: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=600',
    category: 'EDUCATION',
    date: 'March 01, 2025',
  },
];

export default function Blog() {
  return (
    <section className="bg-white py-24">
      <div className="mx-auto max-w-7xl px-6">
        {/* Title */}
        <div className="mb-16 text-center">
          <h2 className="text-4xl font-bold text-slate-800">
            Latest News and Resources
          </h2>

          <p className="mt-4 text-slate-500">
            See the developments that have occurred to TOTC in the world
          </p>
        </div>

        <div className="grid gap-10 lg:grid-cols-[1.2fr_1fr]">
          {/* Featured Blog */}
          <article className="group overflow-hidden rounded-3xl bg-white">
            <div className="overflow-hidden rounded-3xl">
              <img
                src={featuredPost.image}
                alt={featuredPost.title}
                className="h-[350px] w-full object-cover transition duration-700 group-hover:scale-110"
              />
            </div>

            <div className="mt-6">
              <span className="rounded-full bg-cyan-100 px-4 py-2 text-xs font-semibold text-cyan-700">
                {featuredPost.category}
              </span>

              <h3 className="mt-5 text-2xl font-bold text-slate-800 transition group-hover:text-cyan-500">
                {featuredPost.title}
              </h3>

              <p className="mt-4 text-slate-500">
                Class Technologies Inc., the company that created Class,
                announced funding to continue transforming online learning.
              </p>

              <button className="mt-6 flex items-center gap-2 font-medium text-cyan-500 hover:text-cyan-600">
                Read More
                <FaArrowRight />
              </button>
            </div>
          </article>

          {/* Side Blogs */}
          <div className="space-y-8">
            {posts.map((post) => (
              <article
                key={post.id}
                className="group flex gap-5 rounded-2xl transition hover:bg-slate-50 p-2"
              >
                <div className="overflow-hidden rounded-2xl">
                  <img
                    src={post.image}
                    alt={post.title}
                    className="h-32 w-40 object-cover transition duration-500 group-hover:scale-110"
                  />
                </div>

                <div className="flex flex-1 flex-col justify-between">
                  <div>
                    <span className="text-xs font-semibold uppercase text-cyan-500">
                      {post.category}
                    </span>

                    <h4 className="mt-2 line-clamp-3 text-lg font-semibold text-slate-800 transition group-hover:text-cyan-500">
                      {post.title}
                    </h4>
                  </div>

                  <p className="text-sm text-slate-400">{post.date}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
