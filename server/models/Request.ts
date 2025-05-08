export interface Request {
  id: number;
  room: string;
  guestName: string;
  content: string;
  time: Date;
  status: string; // Đã ghi nhận, Đang thực hiện, ...
  notes?: string;
} 