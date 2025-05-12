import React, { useState, useEffect, useRef } from 'react';
import StaffRequestDetailModal from '../components/StaffRequestDetailModal';
import StaffMessagePopup from '../components/StaffMessagePopup';
import { useNavigate } from 'react-router-dom';
import { io, Socket } from 'socket.io-client';

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
  const [isLoading, setIsLoading] = useState(false);
  const [hasNewData, setHasNewData] = useState(false);
  const [lastUpdateTime, setLastUpdateTime] = useState<Date>(new Date());
  const [connectedClients, setConnectedClients] = useState(0);
  const previousRequestsRef = useRef<any[]>([]);
  const socketRef = useRef<Socket | null>(null);
  const navigate = useNavigate();

  // Lấy token từ localStorage
  const getToken = () => localStorage.getItem('staff_token');

  // Kết nối socket và thiết lập các event listeners
  useEffect(() => {
    // Khởi tạo Socket.IO client
    if (!socketRef.current) {
      const SOCKET_URL = window.location.origin; // Cùng domain với web app
      
      console.log('Connecting to socket at:', SOCKET_URL);
      
      const socket = io(SOCKET_URL, {
        transports: ['websocket', 'polling'],
        autoConnect: true,
        reconnection: true,
        reconnectionAttempts: Infinity,
        reconnectionDelay: 1000
      });
      
      socket.on('connect', () => {
        console.log('Socket connected:', socket.id);
        playPingSound();
      });
      
      socket.on('disconnect', () => {
        console.log('Socket disconnected');
      });
      
      socket.on('error', (error) => {
        console.error('Socket error:', error);
      });
      
      socket.on('clients_count', (count) => {
        console.log('Connected clients:', count);
        setConnectedClients(count);
      });
      
      // Listen for data change events
      socket.on('data_changed', (data) => {
        console.log('Received data change event:', data);
        
        if (data.type === 'status_update' || data.type === 'new_request') {
          setHasNewData(true);
          setLastUpdateTime(new Date());
          playNotificationSound();
          fetchRequests(); // Refresh data
        }
      });
      
      // Setup ping to keep connection alive
      const pingInterval = setInterval(() => {
        if (socket.connected) {
          socket.emit('ping', (response: any) => {
            console.log('Ping response:', response);
          });
        }
      }, 25000);
      
      socketRef.current = socket;
      
      return () => {
        clearInterval(pingInterval);
        socket.disconnect();
        socketRef.current = null;
      };
    }
  }, []);

  // Fetch requests from API
  const fetchRequests = async () => {
    const token = getToken();
    if (!token) {
      navigate('/staff');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Thêm timestamp ngẫu nhiên để tránh cache
      const timestamp = new Date().getTime();
      const res = await fetch(`/api/staff/requests?_=${timestamp}`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache', 
          'Expires': '0'
        },
        credentials: 'include'
      });
      
      if (res.status === 401) {
        localStorage.removeItem('staff_token');
        navigate('/staff');
        return;
      }
      
      const data = await res.json();
      
      // Kiểm tra nếu có dữ liệu mới hoặc thay đổi
      const prevIds = new Set(previousRequestsRef.current.map(r => r.id));
      const newReqs = data.filter((r: any) => !prevIds.has(r.id));
      
      // Kiểm tra các trạng thái cập nhật
      const hasStatusChanges = data.some((newReq: any) => {
        const oldReq = previousRequestsRef.current.find(r => r.id === newReq.id);
        return oldReq && oldReq.status !== newReq.status;
      });
      
      if (newReqs.length > 0 || hasStatusChanges) {
        setHasNewData(true);
        setLastUpdateTime(new Date());
        
        // Thông báo âm thanh nếu có request mới
        if (newReqs.length > 0) {
          playNotificationSound();
        }
      }
      
      setRequests(data);
      previousRequestsRef.current = data;
    } catch (err) {
      console.error('Failed to fetch requests:', err);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Phát âm thanh thông báo khi có yêu cầu mới
  const playNotificationSound = () => {
    try {
      const audio = new Audio('/notification.mp3');
      audio.play().catch(e => console.log('Notification sound could not be played', e));
    } catch (err) {
      console.error('Could not play notification sound:', err);
    }
  };

  useEffect(() => {
    // Fetch ngay khi component được mount
    fetchRequests();
    
    // Thêm polling mỗi 5 giây thay vì 30 giây
    const intervalId = setInterval(fetchRequests, 5000);
    
    return () => clearInterval(intervalId);
  }, []);
  
  // Reset thông báo mới khi người dùng tương tác hoặc click Refresh
  const handleManualRefresh = () => {
    setHasNewData(false);
    fetchRequests();
  };

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

  // Filter requests theo status
  const filteredRequests = statusFilter === 'Tất cả'
    ? requests
    : requests.filter(r => r.status === statusFilter);

  // Phát âm thanh ping nhẹ khi kết nối socket
  const playPingSound = () => {
    try {
      const audio = new Audio('/ping.mp3');
      audio.volume = 0.2; // Nhỏ hơn so với notification
      audio.play().catch(e => console.log('Ping sound could not be played', e));
    } catch (err) {
      console.error('Could not play ping sound:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-200 p-6">
      <div className="max-w-7xl mx-auto bg-white rounded-xl shadow-lg p-6 border border-gray-200">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-blue-900">
            Staff Request Management
            {hasNewData && (
              <span className="ml-3 px-2 py-1 bg-red-500 text-white text-xs rounded-full animate-pulse">
                Mới!
              </span>
            )}
          </h2>
          <div className="flex items-center space-x-3">
            {lastUpdateTime && (
              <span className="text-xs text-gray-500">
                Cập nhật lúc: {lastUpdateTime.toLocaleTimeString()}
              </span>
            )}
            <button
              onClick={handleManualRefresh}
              className={`bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-semibold flex items-center ${isLoading ? 'opacity-75' : ''}`}
              disabled={isLoading}
            >
              {isLoading ? (
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : null}
              {isLoading ? 'Đang tải...' : 'Refresh'}
            </button>
          </div>
        </div>
        {/* Filter status */}
        <div className="mb-4 flex flex-wrap items-center gap-3">
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