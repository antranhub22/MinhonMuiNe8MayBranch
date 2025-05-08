import React from 'react';

const GuestLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="bg-gray-50 min-h-screen">{children}</div>
);

export default GuestLayout; 