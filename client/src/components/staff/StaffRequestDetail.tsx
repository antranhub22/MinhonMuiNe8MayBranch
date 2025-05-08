import React, { useState } from 'react';
import type { StaffRequestStatus, StaffMessage } from '@/types';

interface StaffRequestDetailProps {
  open: boolean;
  onClose: () => void;
  request: {
    id: number;
    room: string;
    guest: string;
    content: string;
    time: string;
    status: StaffRequestStatus;
    messages: StaffMessage[];
  };
  onUpdateStatus: (status: StaffRequestStatus) => void;
  onSendMessage: (msg: string) => void;
}

const statusOptions: StaffRequestStatus[] = [
  'New', 'Confirmed', 'Doing', 'Delivering', 'Done', 'Error'
];

const StaffRequestDetail: React.FC<StaffRequestDetailProps> = ({ open, onClose, request, onUpdateStatus, onSendMessage }) => {
  const [status, setStatus] = useState<StaffRequestStatus>(request.status);
  const [message, setMessage] = useState('');

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-lg border border-gray-200 relative">
        <button onClick={onClose} className="absolute top-3 right-3 text-gray-400 hover:text-red-500 text-xl">×</button>
        <h2 className="text-xl font-bold text-[#223A7A] mb-2">Order #{request.id} - Room {request.room}</h2>
        <div className="mb-2 text-gray-700"><b>Guest:</b> {request.guest}</div>
        <div className="mb-2 text-gray-700"><b>Time:</b> {request.time}</div>
        <div className="mb-2 text-gray-700"><b>Request:</b> {request.content}</div>
        <div className="mb-4">
          <label className="block font-medium text-gray-700 mb-1">Status</label>
          <select value={status} onChange={e => setStatus(e.target.value as StaffRequestStatus)} className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#223A7A]">
            {statusOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
          </select>
          <button onClick={() => onUpdateStatus(status)} className="mt-2 px-4 py-2 bg-[#223A7A] text-white rounded font-semibold hover:bg-[#1a2e5b] transition">Cập nhật trạng thái</button>
        </div>
        <div className="mb-4">
          <label className="block font-medium text-gray-700 mb-1">Staff Message to Guest</label>
          <div className="flex gap-2">
            <input type="text" value={message} onChange={e => setMessage(e.target.value)} className="flex-1 p-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#223A7A]" placeholder="Nhập message..." />
            <button onClick={() => { onSendMessage(message); setMessage(''); }} className="px-4 py-2 bg-[#FFD700] text-[#223A7A] rounded font-semibold hover:bg-yellow-300 transition">Send</button>
          </div>
        </div>
        <div className="mb-2 font-medium text-[#223A7A]">Lịch sử trạng thái & message:</div>
        <div className="max-h-40 overflow-y-auto text-sm">
          {request.messages.map(msg => (
            <div key={msg.id} className="mb-1">
              <span className="text-gray-500">[{new Date(msg.timestamp).toLocaleTimeString()}]</span> <b>{msg.sender === 'staff' ? 'Staff' : 'System'}:</b> <span className="text-gray-800">{msg.content}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StaffRequestDetail; 