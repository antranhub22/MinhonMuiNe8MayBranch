import React from 'react';

const StaffLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="bg-white min-h-screen">{children}</div>
);

export default StaffLayout; 