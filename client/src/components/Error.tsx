import React from 'react';
import { Link } from 'wouter';

interface AppErrorProps {
  message?: string;
  subMessage?: string;
  actionText?: string;
  actionLink?: string;
}

const Error: React.FC<AppErrorProps> = ({
  message = 'An error occurred',
  subMessage = 'Please try again later',
  actionText = 'Go Back',
  actionLink = '/'
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-6 bg-red-50 rounded-lg">
      <span className="material-icons text-red-500 text-4xl mb-3">error_outline</span>
      <p className="text-red-700 mb-2">{message}</p>
      <p className="text-red-500 text-sm mb-4">{subMessage}</p>
      <Link to={actionLink}>
        <button className="px-4 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors">
          {actionText}
        </button>
      </Link>
    </div>
  );
};

export default Error; 