import React, { useState } from 'react';
import StaffLayout from '@/layouts/StaffLayout';

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
    window.location.href = '/staff/dashboard';
  };

  return (
    <StaffLayout>
      <div className="flex items-center justify-center min-h-[60vh]">
        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-md w-full max-w-sm">
          <h2 className="text-xl font-bold mb-4 text-[#223A7A]">Staff Login</h2>
          {error && <div className="text-red-500 mb-2">{error}</div>}
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={e => setUsername(e.target.value)}
            className="w-full mb-3 p-2 border rounded"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full mb-4 p-2 border rounded"
          />
          <button type="submit" className="w-full bg-[#223A7A] text-white py-2 rounded font-semibold">Login</button>
        </form>
      </div>
    </StaffLayout>
  );
};

export default StaffLogin; 