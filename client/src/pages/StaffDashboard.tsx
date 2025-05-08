import React, { useState, useEffect } from 'react';
import StaffRequestDetail from '../components/staff/StaffRequestDetail';
import type { StaffRequestStatus, StaffMessage } from '@/types';
import { io, Socket } from 'socket.io-client';
import { useQuery } from '@tanstack/react-query';
import Loading from '@/components/Loading';
import { Line, Pie, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Tooltip, Legend);

const dummyRequests = [
  {
    id: 'ORD123',
    room: '201',
    guest: 'Tony',
    content: '2 beef burgers, 1 orange juice',
    time: '08:30',
    status: 'New' as StaffRequestStatus,
    messages: [
      { id: 'm1', sender: 'staff', content: 'Đã nhận request', timestamp: new Date() },
    ] as StaffMessage[],
  },
  {
    id: 'ORD124',
    room: '105',
    guest: 'Anna',
    content: 'Extra towels',
    time: '08:32',
    status: 'Doing' as StaffRequestStatus,
    messages: [] as StaffMessage[],
  },
];

const defaultStatusColor: Record<string, string> = {
  'New': 'bg-[#223A7A] text-white',
  'Doing': 'bg-[#FFD700] text-[#223A7A]',
  'Done': 'bg-[#4ADE80] text-white',
  'Error': 'bg-[#F87171] text-white',
};

interface Stats {
  totalRequests: number;
  requestsByStatus: Record<string, number>;
  avgProcessingTime: number; // in minutes
  newToday: number;
}

// Demo data for charts (replace with API data if available)
const demoRequestsByDay = {
  labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  data: [5, 8, 6, 10, 7, 12, 9],
};
const demoStatusPie = {
  labels: ['New', 'Doing', 'Done', 'Error'],
  data: [12, 8, 15, 2],
};
const demoTopRooms = {
  labels: ['201', '105', '301', '202', '110'],
  data: [7, 6, 5, 4, 3],
};

const StaffDashboard: React.FC = () => {
  const [selected, setSelected] = useState<number|null>(null);
  const [requests, setRequests] = useState(dummyRequests);
  const [statusColor, setStatusColor] = useState<Record<string, string>>(defaultStatusColor);
  const [newStatus, setNewStatus] = useState('');
  const [newStatusColor, setNewStatusColor] = useState('#60A5FA'); // default blue
  const socketRef = React.useRef<Socket | null>(null);

  const { data, isLoading, isError, refetch } = useQuery<Stats>({
    queryKey: ['staffStats'],
    queryFn: async () => {
      const res = await fetch('/api/staff/requests/stats');
      if (!res.ok) throw new Error('Failed to fetch staff stats');
      return res.json();
    },
    refetchInterval: 60000, // 1 phút
  });

  useEffect(() => {
    // Kết nối socket.io
    const socket = io(window.location.origin);
    socketRef.current = socket;

    // Lắng nghe sự kiện tạo request mới
    socket.on('staff_request_new', ({ request }) => {
      setRequests(prev => [{
        id: request.id,
        room: request.roomNumber,
        guest: request.guestName,
        content: request.content,
        time: new Date(request.createdAt).toLocaleTimeString(),
        status: request.status,
        messages: [],
      }, ...prev]);
    });

    // Lắng nghe sự kiện cập nhật trạng thái
    socket.on('staff_request_status_update', ({ requestId, status }) => {
      setRequests(prev => prev.map(r => r.id === requestId ? { ...r, status, messages: [...r.messages, { id: `msg${Date.now()}`, requestId, sender: 'system', content: `Cập nhật trạng thái: ${status}`, timestamp: new Date() }] } : r));
    });

    // Lắng nghe sự kiện message mới
    socket.on('staff_request_message', ({ requestId, message }) => {
      setRequests(prev => prev.map(r => r.id === requestId ? { ...r, messages: [...r.messages, { ...message, timestamp: new Date(message.timestamp) }] } : r));
    });

    // Join vào tất cả các phòng (demo: room theo từng request)
    requests.forEach(r => {
      socket.emit('join_room', r.room);
      socket.emit('join_room', r.id);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const handleUpdateStatus = (idx: number, status: StaffRequestStatus) => {
    setRequests(reqs => reqs.map((r, i) => i === idx ? { ...r, status, messages: [...r.messages, { id: `msg${Date.now()}`, requestId: r.id, sender: 'staff', content: `Cập nhật trạng thái: ${status}`, timestamp: new Date() }] } : r));
  };
  const handleSendMessage = (idx: number, msg: string) => {
    if (!msg.trim()) return;
    setRequests(reqs => reqs.map((r, i) => i === idx ? { ...r, messages: [...r.messages, { id: `msg${Date.now()}`, requestId: r.id, sender: 'staff', content: msg, timestamp: new Date() }] } : r));
  };

  // Add new status logic
  const handleAddStatus = () => {
    const status = newStatus.trim();
    if (!status || statusColor[status]) return;
    setStatusColor(prev => ({ ...prev, [status]: `bg-[${newStatusColor}] text-white` }));
    setNewStatus('');
    setNewStatusColor('#60A5FA');
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white p-6 rounded-lg shadow-sm animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-10 bg-gray-100 rounded w-full"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="container mx-auto p-6">
        <div className="bg-red-50 p-6 rounded-lg shadow flex flex-col items-center">
          <span className="material-icons text-red-500 text-4xl mb-3">error_outline</span>
          <p className="text-red-700 mb-2">Unable to load statistics</p>
          <button onClick={() => refetch()} className="mt-2 px-4 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors">Try Again</button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-full md:max-w-5xl p-2 sm:p-6">
      <h1 className="text-2xl sm:text-3xl font-bold text-primary mb-4 sm:mb-6">Staff Dashboard</h1>
      <div className="mb-4 sm:mb-6 bg-white p-3 sm:p-4 rounded-lg shadow-sm flex flex-col md:flex-row md:items-center gap-2 sm:gap-4">
        <div className="flex items-center gap-2 w-full md:w-auto">
          <input
            type="text"
            placeholder="Add new status..."
            value={newStatus}
            onChange={e => setNewStatus(e.target.value)}
            className="flex-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
          />
          <input
            type="color"
            value={newStatusColor}
            onChange={e => setNewStatusColor(e.target.value)}
            className="w-8 h-8 p-0 border-none bg-transparent cursor-pointer"
            title="Pick status color"
          />
          <button
            onClick={handleAddStatus}
            className="px-3 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors text-sm sm:text-base"
          >
            Add Status
          </button>
        </div>
        <div className="flex flex-wrap gap-2 mt-2 md:mt-0">
          {Object.keys(statusColor).map(status => (
            <span key={status} className={`px-3 py-1 rounded text-xs sm:text-sm ${statusColor[status]}`}>{status}</span>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <div className="bg-white p-3 sm:p-6 rounded-lg shadow-sm flex flex-col items-center">
          <h3 className="font-semibold mb-2">Requests by Day</h3>
          <Line
            data={{
              labels: demoRequestsByDay.labels,
              datasets: [
                {
                  label: 'Requests',
                  data: demoRequestsByDay.data,
                  borderColor: '#2563eb',
                  backgroundColor: 'rgba(37,99,235,0.1)',
                  tension: 0.4,
                  fill: true,
                },
              ],
            }}
            options={{
              responsive: true,
              plugins: { legend: { display: false } },
              scales: { x: { grid: { display: false } }, y: { beginAtZero: true } },
            }}
            height={180}
          />
        </div>
        <div className="bg-white p-3 sm:p-6 rounded-lg shadow-sm flex flex-col items-center">
          <h3 className="font-semibold mb-2">Status Distribution</h3>
          <Pie
            data={{
              labels: demoStatusPie.labels,
              datasets: [
                {
                  data: demoStatusPie.data,
                  backgroundColor: ['#2563eb', '#fbbf24', '#22c55e', '#ef4444'],
                },
              ],
            }}
            options={{ responsive: true, plugins: { legend: { position: 'bottom' } } }}
            height={180}
          />
        </div>
        <div className="bg-white p-3 sm:p-6 rounded-lg shadow-sm flex flex-col items-center">
          <h3 className="font-semibold mb-2">Top Rooms</h3>
          <Bar
            data={{
              labels: demoTopRooms.labels,
              datasets: [
                {
                  label: 'Requests',
                  data: demoTopRooms.data,
                  backgroundColor: '#2563eb',
                },
              ],
            }}
            options={{
              responsive: true,
              plugins: { legend: { display: false } },
              scales: { x: { grid: { display: false } }, y: { beginAtZero: true } },
            }}
            height={180}
          />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm flex flex-col items-center">
          <span className="material-icons text-blue-500 text-4xl mb-2">assignment</span>
          <div className="text-3xl font-bold">{data.totalRequests}</div>
          <div className="text-gray-600 mt-1">Total Requests</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm flex flex-col items-center">
          <span className="material-icons text-green-500 text-4xl mb-2">fiber_new</span>
          <div className="text-3xl font-bold">{data.newToday}</div>
          <div className="text-gray-600 mt-1">New Today</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm flex flex-col items-center">
          <span className="material-icons text-yellow-500 text-4xl mb-2">timer</span>
          <div className="text-3xl font-bold">{data.avgProcessingTime.toFixed(1)} min</div>
          <div className="text-gray-600 mt-1">Avg. Processing Time</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm flex flex-col items-center">
          <span className="material-icons text-purple-500 text-4xl mb-2">pie_chart</span>
          <div className="text-3xl font-bold">{Object.keys(data.requestsByStatus).length}</div>
          <div className="text-gray-600 mt-1">Statuses</div>
        </div>
      </div>
      <div className="bg-white p-3 sm:p-6 rounded-lg shadow-sm">
        <h2 className="text-base sm:text-lg font-semibold mb-2 sm:mb-4">Requests by Status</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4">
          {Object.entries(data.requestsByStatus).map(([status, count]) => (
            <div key={status} className="flex flex-col items-center">
              <span className="material-icons text-xl sm:text-2xl mb-1">check_circle</span>
              <div className="font-bold text-base sm:text-lg">{count}</div>
              <div className="text-gray-600 text-xs sm:text-sm">{status}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StaffDashboard; 