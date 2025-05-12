export interface Message {
  id: number;
  requestId: number;
  sender: 'staff' | 'guest';
  content: string;
  created_at: Date;
  updatedAt: Date;
} 