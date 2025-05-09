import React, { useState } from 'react';
import StaffLogin from './StaffLogin';
import StaffDashboard from './StaffDashboard';

const StaffPage: React.FC = () => {
  // State giả lập đăng nhập
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Xử lý đăng nhập thành công
  const handleLoginSuccess = () => setIsLoggedIn(true);

  return isLoggedIn ? <StaffDashboard /> : <StaffLogin onLogin={handleLoginSuccess} />;
};

export default StaffPage; 