import React from 'react';

const StaffLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="min-h-screen bg-[#223A7A] bg-opacity-5">
    {/* Header staff */}
    <header className="bg-[#223A7A] text-white shadow p-4 mb-4">
      <h1 className="text-xl font-bold">Mi Nhon Hotel - Staff Management</h1>
    </header>
    <main className="max-w-4xl mx-auto w-full">{children}</main>
  </div>
);

export default StaffLayout; 