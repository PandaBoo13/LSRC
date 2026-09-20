import { FaEnvelope, FaMapMarkerAlt, FaPhone } from "react-icons/fa";

export const supportChannels = [
  { label: 'Chi nhánh 1', value: '224 Điện Biên Phủ, P. Xuân Hòa, TP.HCM', icon: FaMapMarkerAlt },
  { label: 'Chi nhánh 2', value: '39/17A Gò Cát, Long Trường, TP.HCM', icon: FaMapMarkerAlt },
  { label: 'Điện thoại', value: '+84 28 1234 5678', icon: FaPhone },
  { label: 'Email', value: 'info@lsrc.edu.vn', icon: FaEnvelope },
] as const;
