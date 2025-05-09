import React, { useState, useEffect } from 'react';
import StaffRequestDetailModal from '../components/StaffRequestDetailModal';
import StaffMessagePopup from '../components/StaffMessagePopup';
import { useHistory } from 'react-router-dom';

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

const StaffDashboard: React.FC = () => {
  const [requests, setRequests] = useState<any[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showMessagePopup, setShowMessagePopup] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [loadingMsg, setLoadingMsg] = useState(false);
  const history = useHistory();

  // Lấy token từ localStorage
  const getToken = () => localStorage.getItem('staff_token');

  // Fetch requests from API
  useEffect(() => {
    const fetchRequests = async () => {
      const token = getToken();
      if (!token) {
        history.push('/staff'); // Chuyển về login nếu chưa có token
        return;
      }
      try {
        const res = await fetch('/api/staff/requests', {
          headers: { 'Authorization': `Bearer ${token}` },
          credentials: 'include'
        });
        if (res.status === 401) {
          localStorage.removeItem('staff_token');
          history.push('/staff');
          return;
        }
        const data = await res.json();
        setRequests(data);
      } catch (err) {
        console.error('Failed to fetch requests:', err);
      }
    };
    fetchRequests();
    // eslint-disable-next-line
  }, []);

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
  const handleStatusChange = async (status: string) => {
    if (!selectedRequest) return;
    const token = getToken();
    if (!token) return history.push('/staff');
    try {
      await fetch(`/api/staff/requests/${selectedRequest.id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include',
        body: JSON.stringify({ status })
      });
      setRequests(reqs => reqs.map(r => r.id === selectedRequest.id ? { ...r, status } : r));
      setSelectedRequest({ ...selectedRequest, status });
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };
  // Mở popup nhắn tin
  const handleOpenMessage = async () => {
    setShowMessagePopup(true);
    if (!selectedRequest) return;
    const token = getToken();
    if (!token) return history.push('/staff');
    try {
      const res = await fetch(`/api/staff/requests/${selectedRequest.id}/messages`, {
        headers: { 'Authorization': `Bearer ${token}` },
        credentials: 'include'
      });
      const data = await res.json();
      setMessages(data);
    } catch (err) {
      setMessages([]);
    }
  };
  // Đóng popup nhắn tin
  const handleCloseMessage = () => setShowMessagePopup(false);
  // Gửi tin nhắn
  const handleSendMessage = async (msg: string) => {
    setLoadingMsg(true);
    const token = getToken();
    if (!token) return history.push('/staff');
    try {
      await fetch(`/api/staff/requests/${selectedRequest.id}/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include',
        body: JSON.stringify({ content: msg })
      });
      setMessages(msgs => [
        ...msgs,
        { id: (msgs.length + 1).toString(), sender: 'staff', content: msg, time: new Date().toLocaleTimeString().slice(0,5) }
      ]);
    } catch (err) {
      // handle error
    }
    setLoadingMsg(false);
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
                  <td className="py-2 px-3">{req.orderId || req.id}</td>
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
      {showMessagePopup && selectedRequest && (
        <StaffMessagePopup
          messages={messages}
          onClose={handleCloseMessage}
          onSend={handleSendMessage}
          loading={loadingMsg}
        />
      )}
    </div>
  );
};

export default StaffDashboard; 