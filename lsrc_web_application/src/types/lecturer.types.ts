// src/types/lecturer.types.ts

export interface CertificateInfo {
  id: number;
  name: string;
  issuingOrganization: string | null;
  issueDate: string | null;
  expiryDate: string | null;
  credentialUrl: string | null;
  certificateFile: string | null;
}

export interface LecturerProfileResponse {
  id: number;
  // ✅ ĐỔI: userId → accountId
  accountId: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  avatarUrl: string | null;
  bio: string | null;
  specialties: string | null;
  expertise: string | null;
  experienceYears: number;
  education: string | null;
  website: string | null;
  linkedin: string | null;
  isActive: boolean;
  certificates: CertificateInfo[];
  createdAt: string;
  updatedAt: string;
}

export interface LecturerProfileRequest {
  specialties?: string;
  expertise?: string;
  experienceYears?: number;
  education?: string;
  website?: string;
  linkedin?: string;
}