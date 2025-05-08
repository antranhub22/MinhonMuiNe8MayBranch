export interface Message {
  id: number;
  requestId: number;
  sender: 'staff' | 'guest';
  content: string;
  time: Date;
} 