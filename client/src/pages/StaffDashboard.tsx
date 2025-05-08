import React from 'react';

const dummyRequests = [
  {
    id: 'ORD123',
    room: '201',
    guest: 'Tony',
    content: '2 beef burgers, 1 orange juice',
    time: '08:30',
    status: 'New',
  },
  {
    id: 'ORD124',
    room: '105',
    guest: 'Anna',
    content: 'Extra towels',
    time: '08:32',
    status: 'Doing',
  },
];

const statusColor: Record<string, string> = {
  'New': 'bg-[#223A7A] text-white',
  'Doing': 'bg-[#FFD700] text-[#223A7A]',
  'Done': 'bg-[#4ADE80] text-white',
  'Error': 'bg-[#F87171] text-white',
};

const StaffDashboard: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      <header className="bg-[#223A7A] text-white py-4 px-8 flex justify-between items-center">
        <h1 className="text-xl font-bold tracking-wide">Management for Staff</h1>
        <button className="bg-[#FFD700] text-[#223A7A] font-semibold px-4 py-2 rounded hover:bg-yellow-300 transition">Logout</button>
      </header>
      <main className="max-w-4xl mx-auto mt-8 bg-white rounded-xl shadow p-6 border border-gray-200">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#F5F5F5]">
              <th className="py-2 px-3 font-semibold text-[#223A7A]">#</th>
              <th className="py-2 px-3 font-semibold text-[#223A7A]">Room</th>
              <th className="py-2 px-3 font-semibold text-[#223A7A]">Order ID</th>
              <th className="py-2 px-3 font-semibold text-[#223A7A]">Guest</th>
              <th className="py-2 px-3 font-semibold text-[#223A7A]">Request Content</th>
              <th className="py-2 px-3 font-semibold text-[#223A7A]">Time</th>
              <th className="py-2 px-3 font-semibold text-[#223A7A]">Status</th>
            </tr>
          </thead>
          <tbody>
            {dummyRequests.map((req, idx) => (
              <tr key={req.id} className="border-b border-gray-100 hover:bg-[#F0F4FF] cursor-pointer">
                <td className="py-2 px-3">{idx + 1}</td>
                <td className="py-2 px-3 font-semibold">{req.room}</td>
                <td className="py-2 px-3">{req.id}</td>
                <td className="py-2 px-3">{req.guest}</td>
                <td className="py-2 px-3">{req.content}</td>
                <td className="py-2 px-3">{req.time}</td>
                <td className={`py-2 px-3 rounded ${statusColor[req.status] || ''}`}>{req.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="mt-4 text-gray-500 text-sm">Click vào từng dòng để xem chi tiết & cập nhật trạng thái</div>
      </main>
    </div>
  );
};

export default StaffDashboard; 