import React, { useState, useEffect } from 'react';
import StaffRequestDetailModal from '../components/StaffRequestDetailModal';
import StaffMessagePopup from '../components/StaffMessagePopup';
import { useNavigate } from 'react-router-dom';

const statusOptions = [
  'Tất cả',
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
  const [statusFilter, setStatusFilter] = useState('Tất cả');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const navigate = useNavigate();

  // Lấy token từ localStorage
  const getToken = () => localStorage.getItem('staff_token');

  // Fetch requests from API
  const fetchRequests = async () => {
    const token = getToken();
    if (!token) {
      navigate('/staff');
      return;
    }
    try {
      const res = await fetch('/api/staff/requests', {
        headers: { 'Authorization': `Bearer ${token}` },
        credentials: 'include'
      });
      if (res.status === 401) {
        localStorage.removeItem('staff_token');
        navigate('/staff');
        return;
      }
      const data = await res.json();
      setRequests(data);
    } catch (err) {
      console.error('Failed to fetch requests:', err);
    }
  };

  useEffect(() => {
    fetchRequests();
    // Thêm polling mỗi 30 giây
    const intervalId = setInterval(fetchRequests, 30000);
    return () => clearInterval(intervalId);
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
  const handleStatusChange = async (status: string, reqId: number) => {
    const token = getToken();
    if (!token) return navigate('/staff');
    try {
      await fetch(`/api/staff/requests/${reqId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include',
        body: JSON.stringify({ status })
      });
      // Cập nhật local state ngay
      setRequests(reqs => reqs.map(r => r.id === reqId ? { ...r, status } : r));
      if (selectedRequest && selectedRequest.id === reqId) setSelectedRequest({ ...selectedRequest, status });
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };
  // Mở popup nhắn tin
  const handleOpenMessage = async () => {
    setShowMessagePopup(true);
    if (!selectedRequest) return;
    const token = getToken();
    if (!token) return navigate('/staff');
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
    if (!token) return navigate('/staff');
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

  // Filter requests theo status và thời gian
  const filteredRequests = requests.filter(r => {
    // Filter theo status
    if (statusFilter !== 'Tất cả' && r.status !== statusFilter) {
      return false;
    }
    
    // Filter theo thời gian
    if (startDate || endDate) {
      const requestDate = new Date(r.created_at);
      
      if (startDate) {
        const filterStartDate = new Date(startDate);
        filterStartDate.setHours(0, 0, 0, 0);
        if (requestDate < filterStartDate) return false;
      }
      
      if (endDate) {
        const filterEndDate = new Date(endDate);
        filterEndDate.setHours(23, 59, 59, 999);
        if (requestDate > filterEndDate) return false;
      }
    }
    
    return true;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-200 p-6">
      <div className="max-w-7xl mx-auto bg-white rounded-xl shadow-lg p-6 border border-gray-200">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-blue-900">Staff Request Management</h2>
          <button
            onClick={fetchRequests}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-semibold"
          >
            Refresh
          </button>
        </div>

        {/* Filters */}
        <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Filter status */}
          <div className="flex flex-wrap items-center gap-3">
            <label className="font-semibold text-blue-900">Lọc theo trạng thái:</label>
            <select
              className="border rounded px-3 py-1 text-sm"
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
            >
              {statusOptions.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>
          
          {/* Filter thời gian */}
          <div className="flex flex-wrap items-center gap-3">
            <label className="font-semibold text-blue-900">Lọc theo thời gian:</label>
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600">Từ:</label>
              <input 
                type="date" 
                className="border rounded px-2 py-1 text-sm"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600">Đến:</label>
              <input 
                type="date" 
                className="border rounded px-2 py-1 text-sm"
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
              />
            </div>
            {(startDate || endDate) && (
              <button
                onClick={() => {
                  setStartDate('');
                  setEndDate('');
                }}
                className="text-blue-600 hover:text-blue-800 text-sm"
              >
                Xóa lọc
              </button>
            )}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-blue-100 text-blue-900">
                <th className="py-2 px-3 text-left">Room</th>
                <th className="py-2 px-3 text-left">Order ID</th>
                <th className="py-2 px-6 text-left w-3/5">Content</th>
                <th className="py-2 px-3 text-left">Time</th>
                <th className="py-2 px-2 text-left w-1/12">Status</th>
                <th className="py-2 px-3 text-left">Action</th>
              </tr>
            </thead>
            <tbody>
              {(Array.isArray(filteredRequests) ? [...filteredRequests].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()) : []).map(req => (
                <tr key={req.id} className="border-b hover:bg-blue-50">
                  <td className="py-2 px-3 font-semibold">{req.room_number}</td>
                  <td className="py-2 px-3">{req.orderId || req.id}</td>
                  <td className="py-2 px-6 whitespace-pre-line break-words max-w-4xl">{req.request_content}</td>
                  <td className="py-2 px-3">
                    {req.created_at && (
                      <span className="block whitespace-nowrap">{new Date(req.created_at).toLocaleDateString()}</span>
                    )}
                    {req.created_at && (
                      <span className="block whitespace-nowrap text-xs text-gray-500">{new Date(req.created_at).toLocaleTimeString()}</span>
                    )}
                  </td>
                  <td className="py-2 px-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusColor(req.status)} break-words whitespace-normal block text-center`}>{req.status}</span>
                  </td>
                  <td className="py-2 px-3 space-x-2">
                    <select
                      className="border rounded px-2 py-1 text-xs"
                      value={req.status}
                      onChange={e => handleStatusChange(e.target.value, req.id)}
                    >
                      {statusOptions.filter(opt => opt !== 'Tất cả').map(opt => (
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
          onStatusChange={status => handleStatusChange(status, selectedRequest.id)}
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