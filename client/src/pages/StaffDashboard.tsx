import React, { useState } from 'react';
import StaffRequestDetailModal from '../components/StaffRequestDetailModal';
import StaffMessagePopup from '../components/StaffMessagePopup';

// Dummy data mẫu cho request
const sampleRequests = [
  {
    id: 'ORD-10001',
    room: '101',
    guestName: 'Tony',
    content: 'Beef burger x 2',
    time: '2024-05-08 09:00',
    status: 'Đã ghi nhận',
    notes: '',
  },
  {
    id: 'ORD-10002',
    room: '202',
    guestName: 'Anna',
    content: 'Spa booking at 10:00',
    time: '2024-05-08 09:05',
    status: 'Đang thực hiện',
    notes: '',
  },
];

const statusOptions = [
  'Đã ghi nhận',
  'Đang thực hiện',
  'Đã thực hiện và đang bàn giao cho khách',
  'Hoàn thiện',
  'Lưu ý khác',
];

const statusColor = (status: string) => {
  switch (status) {
    case 'Đã ghi nhận': return 'bg-gray-300 text-gray-800';
    case 'Đang thực hiện': return 'bg-yellow-200 text-yellow-800';
    case 'Đã thực hiện và đang bàn giao cho khách': return 'bg-blue-200 text-blue-800';
    case 'Hoàn thiện': return 'bg-green-200 text-green-800';
    case 'Lưu ý khác': return 'bg-red-200 text-red-800';
    default: return 'bg-gray-100 text-gray-700';
  }
};

// Dummy messages
const dummyMessages = [
  { id: '1', sender: 'guest', content: 'Can I get my order soon?', time: '09:01' },
  { id: '2', sender: 'staff', content: 'We are preparing your order.', time: '09:02' },
];

const StaffDashboard: React.FC = () => {
  const [requests, setRequests] = useState(sampleRequests);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showMessagePopup, setShowMessagePopup] = useState(false);
  const [messages, setMessages] = useState(dummyMessages);
  const [loadingMsg, setLoadingMsg] = useState(false);

  // Mở modal chi tiết
  const handleOpenDetail = (req: any) => {
    setSelectedRequest(req);
    setShowDetailModal(true);
  };
  // Đóng modal chi tiết
  const handleCloseDetail = () => {
    setShowDetailModal(false);
    setSelectedRequest(null);
  };
  // Cập nhật trạng thái request
  const handleStatusChange = (status: string) => {
    if (!selectedRequest) return;
    setRequests(reqs => reqs.map(r => r.id === selectedRequest.id ? { ...r, status } : r));
    setSelectedRequest({ ...selectedRequest, status });
    // TODO: Gọi API cập nhật trạng thái thực tế
  };
  // Mở popup nhắn tin
  const handleOpenMessage = () => {
    setShowMessagePopup(true);
    // TODO: Fetch messages thực tế từ API
  };
  // Đóng popup nhắn tin
  const handleCloseMessage = () => setShowMessagePopup(false);
  // Gửi tin nhắn
  const handleSendMessage = (msg: string) => {
    setLoadingMsg(true);
    setTimeout(() => {
      setMessages(msgs => [
        ...msgs,
        { id: (msgs.length + 1).toString(), sender: 'staff', content: msg, time: new Date().toLocaleTimeString().slice(0,5) }
      ]);
      setLoadingMsg(false);
      // TODO: Gọi API gửi tin nhắn thực tế
    }, 500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-200 p-6">
      <div className="max-w-5xl mx-auto bg-white rounded-xl shadow-lg p-6 border border-gray-200">
        <h2 className="text-2xl font-bold text-blue-900 mb-6">Staff Request Management</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-blue-100 text-blue-900">
                <th className="py-2 px-3 text-left">Room</th>
                <th className="py-2 px-3 text-left">Order ID</th>
                <th className="py-2 px-3 text-left">Guest Name</th>
                <th className="py-2 px-3 text-left">Content</th>
                <th className="py-2 px-3 text-left">Time</th>
                <th className="py-2 px-3 text-left">Status</th>
                <th className="py-2 px-3 text-left">Action</th>
              </tr>
            </thead>
            <tbody>
              {requests.map(req => (
                <tr key={req.id} className="border-b hover:bg-blue-50">
                  <td className="py-2 px-3 font-semibold">{req.room}</td>
                  <td className="py-2 px-3">{req.id}</td>
                  <td className="py-2 px-3">{req.guestName}</td>
                  <td className="py-2 px-3">{req.content}</td>
                  <td className="py-2 px-3">{req.time}</td>
                  <td className="py-2 px-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusColor(req.status)}`}>{req.status}</span>
                  </td>
                  <td className="py-2 px-3 space-x-2">
                    <select
                      className="border rounded px-2 py-1 text-xs"
                      value={req.status}
                      onChange={e => handleStatusChange(e.target.value)}
                    >
                      {statusOptions.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                    <button className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs font-semibold" onClick={() => handleOpenDetail(req)}>Chi tiết</button>
                    <button className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-xs font-semibold" onClick={() => { setSelectedRequest(req); handleOpenMessage(); }}>Nhắn khách</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {/* Modal chi tiết request */}
      {showDetailModal && selectedRequest && (
        <StaffRequestDetailModal
          request={selectedRequest}
          onClose={handleCloseDetail}
          onStatusChange={handleStatusChange}
          onOpenMessage={handleOpenMessage}
        />
      )}
      {/* Popup nhắn tin */}
      {showMessagePopup && (
        <StaffMessagePopup
          messages={messages}
          onSend={handleSendMessage}
          onClose={handleCloseMessage}
          loading={loadingMsg}
        />
      )}
    </div>
  );
};

export default StaffDashboard; 