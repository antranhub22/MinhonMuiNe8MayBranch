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
  const [expandedContent, setExpandedContent] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [pendingStatus, setPendingStatus] = useState<{ [id: number]: string }>({});
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
      console.log('Fetched requests data:', data); // Debug log
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

  // Xóa tất cả requests
  const handleDeleteAllRequests = async () => {
    setShowPasswordDialog(true);
    setDeletePassword('');
    setPasswordError('');
  };

  // Xác nhận xóa sau khi nhập mật khẩu
  const confirmDelete = async () => {
    // Kiểm tra mật khẩu
    if (deletePassword !== '2208') {
      setPasswordError('Mật khẩu không đúng');
      return;
    }
    
    setIsDeleting(true);
    
    try {
      const token = getToken();
      if (!token) {
        setShowPasswordDialog(false);
        return navigate('/staff');
      }
      
      const response = await fetch('/api/staff/requests/all', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include'
      });
      
      const result = await response.json();
      
      setShowPasswordDialog(false);
      
      if (result.success) {
        alert(`${result.message}`);
        // Cập nhật state để hiển thị danh sách trống
        setRequests([]);
      } else {
        alert(`Lỗi: ${result.error || 'Không thể xóa requests'}`);
      }
    } catch (error) {
      console.error('Error deleting all requests:', error);
      alert('Đã xảy ra lỗi khi xóa requests');
      setShowPasswordDialog(false);
    } finally {
      setIsDeleting(false);
      setDeletePassword('');
    }
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

  // Xử lý khi nhấn Enter trong hộp mật khẩu
  const handlePasswordKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      confirmDelete();
    }
    // Xóa thông báo lỗi khi người dùng bắt đầu nhập lại
    if (passwordError) {
      setPasswordError('');
    }
  };

  // Ngăn chặn việc đóng modal khi click bên ngoài
  const handleDialogClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-200 p-2 sm:p-6">
      <div className="max-w-7xl mx-auto bg-white rounded-xl shadow-lg p-3 sm:p-6 border border-gray-200">
        {/* Logo và tiêu đề */}
        <div className="flex flex-col items-center mb-6">
          <img 
            src="/assets/references/images/minhon-logo.jpg" 
            alt="Minhon Logo" 
            className="h-16 object-contain mb-2"
          />
          <h2 className="text-xl sm:text-2xl font-bold text-blue-900 text-center">Staff Request Management</h2>
        </div>

        {/* Nút Refresh */}
        <div className="flex justify-between mb-4">
          <button
            onClick={handleDeleteAllRequests}
            disabled={isDeleting || requests.length === 0}
            className={`w-auto bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded font-semibold ${(isDeleting || requests.length === 0) ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isDeleting ? 'Đang xóa...' : 'Xóa tất cả Requests'}
          </button>
          <button
            onClick={fetchRequests}
            className="w-auto bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-semibold"
          >
            Refresh
          </button>
        </div>

        {/* Filters */}
        <div className="mb-4 grid grid-cols-1 gap-4">
          {/* Filter status */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <label className="font-semibold text-blue-900 w-full sm:w-auto">Lọc theo trạng thái:</label>
            <select
              className="w-full sm:w-auto border rounded px-3 py-1 text-sm"
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
            >
              {statusOptions.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>
          
          {/* Filter thời gian */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <label className="font-semibold text-blue-900 w-full sm:w-auto">Lọc theo thời gian:</label>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full sm:w-auto">
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <label className="text-sm text-gray-600 min-w-10">Từ:</label>
                <input 
                  type="date" 
                  className="border rounded px-2 py-1 text-sm w-full"
                  value={startDate}
                  onChange={e => setStartDate(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <label className="text-sm text-gray-600 min-w-10">Đến:</label>
                <input 
                  type="date" 
                  className="border rounded px-2 py-1 text-sm w-full"
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
                  className="text-blue-600 hover:text-blue-800 text-sm mt-2 sm:mt-0"
                >
                  Xóa lọc
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Mobile version of requests - Card style */}
        <div className="block sm:hidden">
          <div className="space-y-4">
            {/* Debug log */}
            {(() => { console.log('Mobile rendering - filteredRequests:', filteredRequests); return null; })()}
            {filteredRequests.length > 0 ? (
              [...filteredRequests]
                .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                .map(req => (
                  <div key={req.id} className="border rounded-lg p-3 bg-white shadow-sm">
                    <div className="flex justify-between mb-2">
                      <div className="font-semibold">Phòng: {req.room_number || 'N/A'}</div>
                      <div className={`px-2 py-1 rounded-full text-xs font-semibold ${statusColor(req.status)}`}>{req.status || 'Chưa xác định'}</div>
                    </div>
                    <div className="text-sm text-gray-500 mb-2">Order ID: {req.orderId || req.id || 'N/A'}</div>
                    <div className="text-xs text-gray-500 mb-3">
                      {req.created_at ? (
                        <>
                          {new Date(req.created_at).toLocaleDateString()} {new Date(req.created_at).toLocaleTimeString()}
                        </>
                      ) : (
                        'Thời gian không xác định'
                      )}
                    </div>

                    {/* Collapsible content */}
                    <div className="mb-3">
                      <button 
                        onClick={() => setExpandedContent(expandedContent === req.id ? null : req.id)}
                        className="w-full flex justify-between items-center py-1 px-2 border rounded bg-gray-50 hover:bg-gray-100"
                      >
                        <span className="text-sm font-medium text-blue-700">
                          {expandedContent === req.id ? 'Ẩn nội dung' : 'Xem nội dung'}
                        </span>
                        <svg 
                          className={`w-4 h-4 text-blue-700 transition-transform ${expandedContent === req.id ? 'rotate-180' : ''}`} 
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      
                      {expandedContent === req.id && (
                        <div className="mt-2 p-2 bg-gray-50 rounded-md whitespace-pre-line break-words text-sm">
                          {req.request_content || 'Không có nội dung'}
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col gap-2">
                      <select
                        className="border rounded px-2 py-2 text-sm w-full"
                        value={pendingStatus[req.id] ?? req.status}
                        onChange={e => setPendingStatus(s => ({ ...s, [req.id]: e.target.value }))}
                      >
                        {statusOptions.filter(opt => opt !== 'Tất cả').map(opt => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          className="bg-blue-600 hover:bg-blue-700 text-white px-2 py-2 rounded text-sm font-semibold"
                          onClick={async () => {
                            const newStatus = pendingStatus[req.id];
                            if (newStatus && newStatus !== req.status) {
                              await handleStatusChange(newStatus, req.id);
                              setPendingStatus(s => {
                                const { [req.id]: _, ...rest } = s;
                                return rest;
                              });
                            }
                          }}
                        >Cập Nhật</button>
                        <button className="bg-green-600 hover:bg-green-700 text-white px-2 py-2 rounded text-sm font-semibold" onClick={() => { setSelectedRequest(req); handleOpenMessage(); }}>Nhắn khách</button>
                      </div>
                    </div>
                  </div>
                ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>Không có yêu cầu nào</p>
                <p className="mt-2 text-sm">Nhấn Refresh để tải lại dữ liệu</p>
              </div>
            )}
          </div>
        </div>

        {/* Desktop version - Table */}
        <div className="hidden sm:block overflow-x-auto">
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
                      value={pendingStatus[req.id] ?? req.status}
                      onChange={e => setPendingStatus(s => ({ ...s, [req.id]: e.target.value }))}
                    >
                      {statusOptions.filter(opt => opt !== 'Tất cả').map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                    <button
                      className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs font-semibold"
                      onClick={async () => {
                        const newStatus = pendingStatus[req.id];
                        if (newStatus && newStatus !== req.status) {
                          await handleStatusChange(newStatus, req.id);
                          setPendingStatus(s => {
                            const { [req.id]: _, ...rest } = s;
                            return rest;
                          });
                        }
                      }}
                    >Cập Nhật</button>
                    <button className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-xs font-semibold" onClick={() => { setSelectedRequest(req); handleOpenMessage(); }}>Nhắn khách</button>
                  </td>
                </tr>
              ))}
              {filteredRequests.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-500">Không có yêu cầu nào</td>
                </tr>
              )}
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
      {/* Password Dialog for Delete */}
      {showPasswordDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md mx-4" onClick={handleDialogClick}>
            <h3 className="text-lg font-bold text-red-600 mb-4">Xác nhận xóa toàn bộ requests</h3>
            <p className="mb-4 text-gray-700">Hành động này sẽ xóa tất cả requests và không thể hoàn tác. Vui lòng nhập mật khẩu để xác nhận:</p>
            
            <div className="mb-4">
              <input
                type="password"
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
                onKeyDown={handlePasswordKeyDown}
                className={`w-full px-3 py-2 border rounded ${passwordError ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-red-500`}
                placeholder="Nhập mật khẩu xác nhận"
                autoFocus
              />
              {passwordError && <p className="text-red-500 text-sm mt-1">{passwordError}</p>}
              <p className="text-gray-500 text-xs mt-2 italic">Biện pháp bảo vệ: Chức năng xóa yêu cầu mật khẩu xác nhận để ngăn ngừa xóa dữ liệu do nhầm lẫn.</p>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowPasswordDialog(false)}
                className="px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded transition duration-200"
              >
                Hủy
              </button>
              <button
                onClick={confirmDelete}
                disabled={isDeleting}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded transition duration-200 flex items-center disabled:opacity-70"
              >
                {isDeleting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Đang xóa...
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Xác nhận xóa
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffDashboard; 