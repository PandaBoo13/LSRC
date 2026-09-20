import { useState } from 'react';
import {
  FaChevronLeft,
  FaChevronRight,
} from 'react-icons/fa';

const stories = [
  {
    name: 'Sarah Johnson',
    role: 'Frontend Engineer',
    avatar:
      'https://i.pravatar.cc/300?img=5',
    quote:
      'Working here accelerated my career faster than I ever imagined. Every project challenges me to grow.',
  },
  {
    name: 'Michael Lee',
    role: 'Product Manager',
    avatar:
      'https://i.pravatar.cc/300?img=12',
    quote:
      'The culture of ownership and innovation makes this an incredible place to work.',
  },
  {
    name: 'Emma Wilson',
    role: 'UI UX Designer',
    avatar:
      'https://i.pravatar.cc/300?img=25',
    quote:
      'I love the flexibility, learning opportunities and amazing teammates from around the world.',
  },
];

export default function EmployeeStories() {
  const [index, setIndex] = useState(0);

  const current = stories[index];

  const next = () =>
    setIndex((prev) =>
      prev === stories.length - 1
        ? 0
        : prev + 1,
    );

  const prev = () =>
    setIndex((prev) =>
      prev === 0
        ? stories.length - 1
        : prev - 1,
    );

  return (
    <section className="bg-white py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-14 text-center">
          <h2 className="text-4xl font-bold">
            Employee Stories
          </h2>

          <p className="mt-3 text-slate-500">
            Hear directly from our team.
          </p>
        </div>

        <div className="relative overflow-hidden rounded-[40px] bg-slate-50 p-10 shadow-sm">
          <div className="flex flex-col items-center text-center">
            <img
              src={current.avatar}
              alt=""
              className="h-28 w-28 rounded-full border-4 border-white shadow-lg"
            />

            <p className="mt-8 max-w-3xl text-xl leading-10 text-slate-600">
              "{current.quote}"
            </p>

            <h3 className="mt-6 text-2xl font-bold">
              {current.name}
            </h3>

            <p className="text-cyan-500">
              {current.role}
            </p>
          </div>

          <button
            onClick={prev}
            className="
              absolute
              left-6
              top-1/2
              flex
              h-12
              w-12
              -translate-y-1/2
              items-center
              justify-center
              rounded-full
              bg-white
              shadow-lg
            "
          >
            <FaChevronLeft />
          </button>

          <button
            onClick={next}
            className="
              absolute
              right-6
              top-1/2
              flex
              h-12
              w-12
              -translate-y-1/2
              items-center
              justify-center
              rounded-full
              bg-white
              shadow-lg
            "
          >
            <FaChevronRight />
          </button>
        </div>
      </div>
    </section>
  );
}