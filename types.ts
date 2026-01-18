export interface CertificateData {
  id: string;
  studentName: string;
  studentEmailHash: string; // Hashed for privacy
  studentAddress: string;
  course: string;
  issueDate: number;
  enrollmentDate: number;
  issuer: string;
  isValid: boolean;
  ipfsHash?: string;
  revokeReason?: string;
  isInstitutionActive: boolean;
}

export enum UserRole {
  GUEST = 'GUEST',
  INSTITUTION = 'INSTITUTION',
  STUDENT = 'STUDENT',
  EMPLOYER = 'EMPLOYER'
}