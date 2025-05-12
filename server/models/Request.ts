export interface Request {
  id: number;
  room_number: string;
  guestName: string;
  request_content: string;
  created_at: Date;
  status: string; // Đã ghi nhận, Đang thực hiện, ...
  notes?: string;
} 