import { useMemo, useState } from 'react';
import JobCard, {
  type JobType,
} from './JobCard';

const jobs: JobType[] = [
  {
    id: 1,
    title: 'Frontend Developer',
    department: 'Engineering',
    location: 'Remote',
    type: 'Full Time',
    salary: '$1500 - $2500',
  },
  {
    id: 2,
    title: 'Backend Developer',
    department: 'Engineering',
    location: 'Ho Chi Minh',
    type: 'Full Time',
    salary: '$1800 - $3000',
  },
  {
    id: 3,
    title: 'UI UX Designer',
    department: 'Design',
    location: 'Remote',
    type: 'Full Time',
    salary: '$1200 - $2000',
  },
  {
    id: 4,
    title: 'Marketing Specialist',
    department: 'Marketing',
    location: 'Ha Noi',
    type: 'Full Time',
    salary: '$1000 - $1800',
  },
  {
    id: 5,
    title: 'Product Manager',
    department: 'Product',
    location: 'Remote',
    type: 'Full Time',
    salary: '$2500 - $4000',
  },
  {
    id: 6,
    title: 'QA Engineer',
    department: 'Engineering',
    location: 'Da Nang',
    type: 'Full Time',
    salary: '$1200 - $2200',
  },
];

export default function JobList() {
  const [keyword, setKeyword] =
    useState('');

  const filteredJobs = useMemo(() => {
    return jobs.filter((job) =>
      job.title
        .toLowerCase()
        .includes(keyword.toLowerCase()),
    );
  }, [keyword]);

  return (
    <section className="bg-white py-20">
      <div className="mx-auto max-w-7xl px-6">
        {/* HEADER */}
        <div className="mb-12">
          <h2 className="text-4xl font-bold text-slate-800">
            Open Positions
          </h2>

          <p className="mt-3 text-slate-500">
            Find the role that matches your
            skills and ambitions.
          </p>
        </div>

        {/* FILTER */}
        <div className="mb-10">
          <input
            value={keyword}
            onChange={(e) =>
              setKeyword(e.target.value)
            }
            placeholder="Search jobs..."
            className="
              h-14
              w-full
              rounded-2xl
              border
              border-slate-200
              px-5
              outline-none
              focus:border-cyan-500
            "
          />
        </div>

        {/* JOB GRID */}
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {filteredJobs.map((job) => (
            <JobCard
              key={job.id}
              job={job}
            />
          ))}
        </div>
      </div>
    </section>
  );
}