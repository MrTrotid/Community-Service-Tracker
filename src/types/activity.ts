export interface Activity {
  id: string;
  title: string;
  description: string;
  hours: number;
  date: string;
  status: 'pending' | 'approved' | 'rejected';
  userId: string;
  createdAt: string;
  updatedAt: string;
  isPunishment: boolean;
}
