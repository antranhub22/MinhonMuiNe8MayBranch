import React from 'react';

const GuestLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="min-h-screen bg-[#F5F5F5]">
    {/* Header guest */}
    <header className="bg-white shadow p-4 mb-4">
      <h1 className="text-xl font-bold text-[#223A7A]">Mi Nhon Hotel - Guest</h1>
    </header>
    <main className="max-w-2xl mx-auto w-full">{children}</main>
  </div>
);

export default GuestLayout; 