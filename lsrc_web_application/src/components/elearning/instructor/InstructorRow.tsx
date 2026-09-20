// src/components/elearning/instructor/InstructorRow.tsx
import { FaEdit, FaPlus } from "react-icons/fa";
import type { LecturerProfileResponse } from "../../../types/lecturer.types";

type Props = {
  profile: LecturerProfileResponse;
  onEdit: (profile: LecturerProfileResponse) => void;
};

export function InstructorRow({ profile, onEdit }: Props) {
  const hasProfile = profile.id !== null;

  return (
    <tr className="border-b border-slate-50 hover:bg-slate-50">
      <td className="py-4">
        <div className="flex items-center gap-3">
          <img src={profile.avatarUrl || "https://i.pravatar.cc/40"} alt="" className="h-10 w-10 rounded-full object-cover" />
          <div>
            <p className="font-semibold text-slate-900">{profile.firstName} {profile.lastName}</p>
            <p className="text-xs text-slate-500">{profile.email}</p>
          </div>
        </div>
      </td>
      <td className="py-4 text-slate-600">{profile.specialties || "Chưa cập nhật"}</td>
      <td className="py-4">{profile.experienceYears || 0} năm</td>
      <td className="py-4">{profile.certificates?.length || 0}</td>
      <td className="py-4">
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${profile.isActive ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"}`}>
          {profile.isActive ? "Đang hoạt động" : "Không hoạt động"}
        </span>
      </td>
      <td className="py-4">
        <button onClick={() => onEdit(profile)}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
            hasProfile ? "bg-slate-100 text-slate-600 hover:bg-slate-200" : "bg-cyan-50 text-cyan-600 hover:bg-cyan-100"
          }`}>
          {hasProfile ? <><FaEdit size={11} /> Sửa</> : <><FaPlus size={11} /> Tạo hồ sơ</>}
        </button>
      </td>
    </tr>
  );
}