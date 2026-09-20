// src/components/elearning/instructor/InstructorTable.tsx
import { FaUserCheck } from "react-icons/fa";
import { InstructorRow } from "./InstructorRow";
import type { LecturerProfileResponse } from "../../../types/lecturer.types";

type Props = {
  profiles: LecturerProfileResponse[];
  search: string;
  onSearchChange: (value: string) => void;
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onEdit: (profile: LecturerProfileResponse) => void;
};

export function InstructorTable({ profiles, search, onSearchChange, page, totalPages, onPageChange, onEdit }: Props) {
  return (
    <>
      <div className="mt-6 relative">
        <input type="text" placeholder="Tìm kiếm giảng viên..." value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="h-11 w-full max-w-md rounded-xl border border-slate-200 pl-4 pr-4 text-sm outline-none focus:border-cyan-400" />
      </div>

      <div className="mt-4 overflow-x-auto rounded-3xl bg-white p-6 shadow-sm">
        {profiles.length === 0 ? (
          <div className="text-center py-16">
            <FaUserCheck className="text-5xl text-slate-300 mx-auto" />
            <p className="mt-4 text-slate-500">Không có giảng viên nào</p>
          </div>
        ) : (
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-slate-500">
                <th className="pb-4 font-semibold">Giảng viên</th>
                <th className="pb-4 font-semibold">Chuyên môn</th>
                <th className="pb-4 font-semibold">Kinh nghiệm</th>
                <th className="pb-4 font-semibold">Chứng chỉ</th>
                <th className="pb-4 font-semibold">Trạng thái</th>
                <th className="pb-4 font-semibold"></th>
              </tr>
            </thead>
            <tbody>
              {profiles.map((profile) => (
                <InstructorRow key={profile.userId} profile={profile} onEdit={onEdit} />
              ))}
            </tbody>
          </table>
        )}
      </div>

      {totalPages > 1 && (
        <div className="mt-6 flex justify-center gap-2">
          <button onClick={() => onPageChange(Math.max(0, page - 1))} disabled={page === 0}
            className="px-4 py-2 rounded-lg text-sm bg-slate-100 hover:bg-slate-200 disabled:opacity-50">←</button>
          {Array.from({ length: totalPages }, (_, i) => (
            <button key={i} onClick={() => onPageChange(i)}
              className={`px-3 py-2 rounded-lg text-sm ${page === i ? "bg-cyan-500 text-white" : "bg-slate-100 hover:bg-slate-200"}`}>{i + 1}</button>
          ))}
          <button onClick={() => onPageChange(Math.min(totalPages - 1, page + 1))} disabled={page === totalPages - 1}
            className="px-4 py-2 rounded-lg text-sm bg-slate-100 hover:bg-slate-200 disabled:opacity-50">→</button>
        </div>
      )}
    </>
  );
}