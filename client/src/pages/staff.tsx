import React from 'react';
import StaffLogin from './StaffLogin';
import StaffDashboard from './StaffDashboard';

const StaffPage: React.FC = () => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('staff_token') : null;
  return token ? <StaffDashboard /> : <StaffLogin />;
};

export default StaffPage; 