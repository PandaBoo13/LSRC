// ============================================
// InstructorStats.tsx
// ============================================
import { FaStar, FaUserCheck, FaUserClock } from "react-icons/fa";
import { MetricCard } from "../../../components/elearning";
import type { LecturerProfileResponse } from "../../../types/lecturer.types";

type Props = {
  profiles: LecturerProfileResponse[];
};

export function InstructorStats({ profiles }: Props) {
  const active = profiles.filter((i) => i.isActive).length;
  const totalCertificates = profiles.reduce((sum, p) => sum + (p.certificates?.length || 0), 0);
  const avgExp = Math.round(profiles.reduce((s, p) => s + (p.experienceYears || 0), 0) / (profiles.length || 1));

  return (
    <section className="grid gap-4 sm:grid-cols-3">
      <MetricCard label="Tổng giảng viên" value={String(profiles.length)} note={`${active} đang hoạt động`}
        icon={<FaUserCheck />} accent="bg-cyan-50 text-cyan-600" />
      <MetricCard label="Chứng chỉ" value={String(totalCertificates)} note="Tổng số chứng chỉ"
        icon={<FaStar />} accent="bg-amber-50 text-amber-600" />
      <MetricCard label="Kinh nghiệm TB" value={`${avgExp} năm`} note="Trung bình"
        icon={<FaUserClock />} accent="bg-violet-50 text-violet-600" />
    </section>
  );
}