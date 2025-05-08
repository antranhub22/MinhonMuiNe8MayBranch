import React, { useState } from 'react';

interface Message {
  id: string;
  sender: string;
  content: string;
  time: string;
}

interface StaffMessagePopupProps {
  messages: Message[];
  onSend: (msg: string) => void;
  onClose: () => void;
  loading?: boolean;
}

const StaffMessagePopup: React.FC<StaffMessagePopupProps> = ({ messages, onSend, onClose, loading }) => {
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (input.trim()) {
      onSend(input);
      setInput('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-xl shadow-xl p-5 w-full max-w-md relative flex flex-col">
        <button className="absolute top-2 right-2 text-gray-500 hover:text-blue-700" onClick={onClose}>&times;</button>
        <h3 className="text-lg font-bold text-blue-900 mb-3">Nhắn tin tới Guest</h3>
        <div className="flex-1 overflow-y-auto mb-3 max-h-60 border rounded p-2 bg-gray-50">
          {messages.length === 0 ? (
            <div className="text-gray-400 text-sm text-center">Chưa có tin nhắn</div>
          ) : (
            messages.map(msg => (
              <div key={msg.id} className={`mb-2 ${msg.sender === 'staff' ? 'text-right' : 'text-left'}`}>
                <div className={`inline-block px-3 py-1 rounded-lg ${msg.sender === 'staff' ? 'bg-blue-100 text-blue-900' : 'bg-gray-200 text-gray-800'}`}>
                  <span className="font-semibold">{msg.sender === 'staff' ? 'Staff' : 'Guest'}:</span> {msg.content}
                </div>
                <div className="text-xs text-gray-400 mt-0.5">{msg.time}</div>
              </div>
            ))
          )}
        </div>
        <div className="flex gap-2 mt-2">
          <input
            type="text"
            className="flex-1 border rounded px-2 py-1"
            placeholder="Nhập tin nhắn..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleSend(); }}
            disabled={loading}
          />
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1 rounded font-semibold"
            onClick={handleSend}
            disabled={loading || !input.trim()}
          >Gửi</button>
        </div>
      </div>
    </div>
  );
};

export default StaffMessagePopup; 