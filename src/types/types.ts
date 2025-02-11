export interface ServiceHours {
  id?: string;
  studentId: string;
  hours: number;
  date: Date;
  location: string;
  description: string;
  status: 'pending' | 'approved' | 'rejected';
  verifierId?: string;
}

export interface Student {
  id: string;
  name: string;
  email: string;
  totalHours: number;
  requiredHours: number;
  punishmentHours: number;
  isFirstLogin: boolean;
}
