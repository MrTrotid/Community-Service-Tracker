export const COLLECTIONS = {
  STUDENTS: 'students',
  SERVICE_HOURS: 'serviceHours'
} as const;

// Firestore document types
export interface FirestoreStudent {
  id: string;
  name: string;
  email: string;
  totalHours: number;
  requiredHours: number;
  punishmentHours: number;
  isFirstLogin: boolean;
  createdAt: string;
  lastUpdated: string;
}

export interface FirestoreServiceHour {
  id: string;
  studentId: string;
  studentEmail: string;  // Adding email for better querying
  hours: number;
  date: string;  // ISO string format
  location: string;
  description: string;
  status: 'pending' | 'approved' | 'rejected';
  verifierId?: string;
  verifierEmail?: string;  // Adding verifier email for tracking
  verifiedAt?: string;
  createdAt: string;
  lastUpdated: string;
  attachments?: string[];  // Optional URLs for proof of service
}
