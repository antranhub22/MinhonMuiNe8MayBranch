import React, { useState } from 'react';

const StaffLogin: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Gọi API backend để xác thực
    if (!username || !password) {
      setError('Please enter username and password');
      return;
    }
    setError('');
    // Giả lập chuyển trang
    localStorage.setItem('staff_logged_in', 'true');
    window.location.href = '/staff/dashboard';
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F5F5F5]">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-md w-full max-w-sm border border-gray-200">
        <h2 className="text-2xl font-bold mb-6 text-center text-[#223A7A]">Staff Login</h2>
        <div className="mb-4">
          <label className="block text-gray-700 mb-1 font-medium">Username</label>
          <input type="text" className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#223A7A]" value={username} onChange={e => setUsername(e.target.value)} />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 mb-1 font-medium">Password</label>
          <input type="password" className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#223A7A]" value={password} onChange={e => setPassword(e.target.value)} />
        </div>
        {error && <div className="mb-3 text-red-500 text-sm">{error}</div>}
        <button type="submit" className="w-full py-2 bg-[#223A7A] text-white font-semibold rounded hover:bg-[#1a2e5b] transition">Login</button>
      </form>
    </div>
  );
};

export default StaffLogin; 