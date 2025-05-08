import React from 'react';
import GuestLayout from '@/layouts/GuestLayout';

const GuestHome: React.FC = () => (
  <GuestLayout>
    <div className="p-6 bg-white rounded-xl shadow">
      <h2 className="text-lg font-semibold mb-2">Welcome to Mi Nhon Hotel!</h2>
      <p>How can we assist you today?</p>
    </div>
  </GuestLayout>
);

export default GuestHome; 