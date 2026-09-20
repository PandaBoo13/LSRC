// src/components/elearning/chat/views/PrivateInfoView.tsx
import React, { useState, useEffect } from 'react';
import {
  FaUserPlus, FaCircle, FaEnvelope, FaPhone,
  FaBirthdayCake, FaVenusMars, FaMapMarkerAlt, FaSpinner,
} from 'react-icons/fa';
import { getUserProfileById } from '../../../../service/userService';
import type { Participant } from '../../../../types/chat.types';
import type { UserInfo } from '../../../../types/user.types';

interface Props {
  partner: Participant | null;
  // ✅ ĐỔI: thêm param partnerName
  onStartCreateGroup?: (partnerAccountId: number, partnerName?: string) => void;
  onBack?: () => void;
}

export const PrivateInfoView: React.FC<Props> = ({
  partner,
  onStartCreateGroup,
}) => {
  const [profile, setProfile] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(false);

  // ✅ Gọi API khi có partner
  useEffect(() => {
    if (!partner?.accountId) return;
    let cancelled = false;

    setLoading(true);
    getUserProfileById(partner.accountId)
      .then(data => {
        if (!cancelled) setProfile(data);
      })
      .catch(err => {
        console.error('Lỗi lấy profile:', err);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [partner?.accountId]);

  if (!partner) {
    return (
      <div className="flex-1 flex items-center justify-center p-4">
        <p className="text-xs text-slate-400 italic">Không tìm thấy thông tin</p>
      </div>
    );
  }

  // ✅ Tên hiển thị: ưu tiên firstName+lastName → username
  const displayName = profile
    ? `${profile.firstName || ''} ${profile.lastName || ''}`.trim() || profile.username
    : partner.username;

  const avatarUrl = profile?.avatarUrl || partner.avatarUrl;

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-slate-50 chat-scrollbar overflow-y-auto">
      {/* Profile card */}
      <div className="flex flex-col items-center justify-center py-6 px-4 bg-white border-b border-slate-100">
        <div className="w-20 h-20 rounded-full bg-[#49BBBD]/10 text-[#49BBBD] flex items-center justify-center text-3xl font-bold mb-3 overflow-hidden">
          {avatarUrl ? (
            <img src={avatarUrl} alt={displayName} className="w-full h-full object-cover" />
          ) : (
            displayName.charAt(0).toUpperCase()
          )}
        </div>

        <h3 className="text-base font-bold text-slate-800 mb-1 flex items-center gap-1.5">
          {displayName}
          {loading && <FaSpinner className="animate-spin text-slate-400" size={11} />}
        </h3>

        <p className="text-[11px] text-slate-400 mb-2">@{profile?.username || partner.username}</p>

        <div className="flex items-center gap-1 text-[11px] text-slate-500">
          <FaCircle size={6} className="text-emerald-500" />
          <span>Đang hoạt động</span>
        </div>
      </div>

      {/* Bio — BE trả về */}
      {profile?.bio && (
        <div className="p-3">
          <div className="bg-white rounded-xl border border-slate-100 p-3">
            <p className="text-[10px] font-bold uppercase text-slate-400 mb-1">Giới thiệu</p>
            <p className="text-xs text-slate-700 whitespace-pre-wrap leading-relaxed">{profile.bio}</p>
          </div>
        </div>
      )}

      {/* Action */}
      <div className="p-3 pt-0">
        {onStartCreateGroup && (
          <button
            onClick={() =>
              // ✅ Truyền displayName để generate group name chính xác
              onStartCreateGroup(partner.accountId, displayName)
            }
            className="w-full flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-100 hover:bg-[#49BBBD]/5 hover:border-[#49BBBD]/30 transition"
          >
            <div className="w-9 h-9 rounded-lg bg-[#49BBBD]/10 text-[#49BBBD] flex items-center justify-center shrink-0">
              <FaUserPlus size={14} />
            </div>
            <div className="flex-1 min-w-0 text-left">
              <p className="text-xs font-bold text-slate-700">Tạo nhóm với người này</p>
              <p className="text-[10px] text-slate-400">Thêm thành viên khác vào cuộc trò chuyện</p>
            </div>
          </button>
        )}
      </div>
    </div>
  );
};