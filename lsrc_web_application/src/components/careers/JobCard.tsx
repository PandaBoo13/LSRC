import {
  FaMapMarkerAlt,
  FaClock,
  FaMoneyBillWave,
} from 'react-icons/fa';

export type JobType = {
  id: number;
  title: string;
  department: string;
  location: string;
  type: string;
  salary: string;
};

type Props = {
  job: JobType;
};

export default function JobCard({
  job,
}: Props) {
  return (
    <div
      className="
        rounded-3xl
        bg-white
        p-6
        shadow-sm
        transition-all
        duration-300
        hover:-translate-y-2
        hover:shadow-xl
      "
    >
      <span
        className="
          rounded-full
          bg-cyan-100
          px-4
          py-2
          text-xs
          font-semibold
          text-cyan-600
        "
      >
        {job.department}
      </span>

      <h3 className="mt-4 text-2xl font-bold text-slate-800">
        {job.title}
      </h3>

      <div className="mt-5 space-y-3">
        <div className="flex items-center gap-3 text-slate-500">
          <FaMapMarkerAlt />
          {job.location}
        </div>

        <div className="flex items-center gap-3 text-slate-500">
          <FaClock />
          {job.type}
        </div>

        <div className="flex items-center gap-3 text-slate-500">
          <FaMoneyBillWave />
          {job.salary}
        </div>
      </div>

      <button
        className="
          mt-6
          w-full
          rounded-full
          bg-cyan-500
          py-3
          font-semibold
          text-white
          transition
          hover:bg-cyan-600
        "
      >
        Apply Now
      </button>
    </div>
  );
}