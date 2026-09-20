import {
  FaFacebookF,
  FaLinkedinIn,
  FaTwitter,
} from 'react-icons/fa';

export interface TeamMember {
  name: string;
  position: string;
  image: string;
}

interface TeamCardProps {
  member: TeamMember;
}

export default function TeamCard({
  member,
}: TeamCardProps) {
  return (
    <div
      className="
        group
        overflow-hidden
        rounded-[32px]
        bg-white
        shadow-sm
        transition-all
        duration-300
        hover:-translate-y-2
        hover:shadow-xl
      "
    >
      {/* IMAGE */}
      <div className="overflow-hidden">
        <img
          src={member.image}
          alt={member.name}
          className="
            h-[320px]
            w-full
            object-cover
            transition-transform
            duration-500
            group-hover:scale-110
          "
        />
      </div>

      {/* CONTENT */}
      <div className="p-6 text-center">
        <h3 className="text-2xl font-bold text-slate-800">
          {member.name}
        </h3>

        <p className="mt-2 text-slate-500">
          {member.position}
        </p>

        <div className="mt-5 flex justify-center gap-3">
          <button
            className="
              flex
              h-10
              w-10
              items-center
              justify-center
              rounded-full
              bg-slate-100
              transition
              hover:bg-cyan-500
              hover:text-white
            "
          >
            <FaFacebookF />
          </button>

          <button
            className="
              flex
              h-10
              w-10
              items-center
              justify-center
              rounded-full
              bg-slate-100
              transition
              hover:bg-cyan-500
              hover:text-white
            "
          >
            <FaLinkedinIn />
          </button>

          <button
            className="
              flex
              h-10
              w-10
              items-center
              justify-center
              rounded-full
              bg-slate-100
              transition
              hover:bg-cyan-500
              hover:text-white
            "
          >
            <FaTwitter />
          </button>
        </div>
      </div>
    </div>
  );
}