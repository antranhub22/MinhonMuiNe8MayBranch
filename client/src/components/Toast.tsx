import React from 'react';
import { Toaster } from 'react-hot-toast';

const Toast: React.FC = () => {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 4000,
        style: {
          background: '#363636',
          color: '#fff',
        },
        success: {
          duration: 3000,
          style: {
            background: '#4aed88',
            color: '#fff',
          },
        },
        error: {
          duration: 4000,
          style: {
            background: '#ff4b4b',
            color: '#fff',
          },
        },
      }}
    />
  );
};

export default Toast; 