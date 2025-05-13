import React, { useState } from 'react';

interface StaffRequestDetailModalProps {
  request: any;
  onClose: () => void;
  onStatusChange: (status: string) => void;
  onOpenMessage: () => void;
}

const statusOptions = [
  'Đã ghi nhận',
  'Đang thực hiện',
  'Đã thực hiện và đang bàn giao cho khách',
  'Hoàn thiện',
  'Lưu ý khác',
];

const StaffRequestDetailModal: React.FC<StaffRequestDetailModalProps> = ({ request, onClose, onStatusChange, onOpenMessage }) => {
  const [pendingStatus, setPendingStatus] = useState<string>(request.status);
  if (!request) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-lg relative">
        <button className="absolute top-2 right-2 text-gray-500 hover:text-blue-700" onClick={onClose}>&times;</button>
        <h3 className="text-xl font-bold text-blue-900 mb-4">Request Details</h3>
        <div className="space-y-2 mb-4">
          <div><b>Room:</b> {request.room}</div>
          <div><b>Order ID:</b> {request.id}</div>
          <div><b>Guest Name:</b> {request.guestName}</div>
          <div><b>Content:</b> {request.content}</div>
          <div><b>Time:</b> {request.time}</div>
          <div className="flex items-center gap-2">
            <b>Status:</b>
            <select className="border rounded px-2 py-1 text-xs" value={pendingStatus} onChange={e => setPendingStatus(e.target.value)}>
              {statusOptions.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>
          <div><b>Notes:</b> {request.notes || '-'}</div>
        </div>
        <div className="flex gap-2 justify-end">
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-semibold" onClick={() => { if (pendingStatus !== request.status) onStatusChange(pendingStatus); }}>Cập Nhật</button>
          <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded font-semibold" onClick={onOpenMessage}>Nhắn khách</button>
          <button className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded font-semibold" onClick={onClose}>Đóng</button>
        </div>
      </div>
    </div>
  );
};

export default StaffRequestDetailModal; 