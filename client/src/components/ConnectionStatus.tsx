import React, { useState, useEffect } from 'react';

interface ConnectionStatusProps {
  onStatusChange?: (isConnected: boolean) => void;
}

const ConnectionStatus: React.FC<ConnectionStatusProps> = ({ onStatusChange }) => {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  const checkConnection = async () => {
    if (isChecking) return;
    
    setIsChecking(true);
    try {
      const token = localStorage.getItem('staff_token');
      if (!token) {
        setIsConnected(false);
        onStatusChange?.(false);
        console.error('[CONNECTION] No token available for connection check');
        return;
      }
      
      console.log('[CONNECTION] Checking DB connection...');
      const res = await fetch('/api/db-test', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-Device-Type': /iPhone|iPad|iPod|Android|Mobile|webOS|BlackBerry/i.test(navigator.userAgent) ? 'mobile' : 'desktop'
        },
        cache: 'no-store'
      });
      
      const connected = res.ok;
      console.log(`[CONNECTION] Connection status: ${connected ? 'CONNECTED' : 'DISCONNECTED'}`);
      
      setIsConnected(connected);
      setLastChecked(new Date());
      onStatusChange?.(connected);
    } catch (error) {
      console.error('[CONNECTION] Error checking connection:', error);
      setIsConnected(false);
      onStatusChange?.(false);
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    checkConnection();
    const interval = setInterval(checkConnection, 60000); // Check every minute
    return () => clearInterval(interval);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="fixed bottom-2 right-2 p-2 bg-white rounded-md shadow-md text-xs flex flex-col items-end">
      <div className="flex items-center">
        <span className="mr-2">Database:</span>
        {isConnected === null ? (
          <span className="text-yellow-500">Kiểm tra...</span>
        ) : isConnected ? (
          <span className="text-green-600 font-semibold flex items-center">
            <span className="h-2 w-2 rounded-full bg-green-500 mr-1"></span>
            Đã kết nối
          </span>
        ) : (
          <span className="text-red-600 font-semibold flex items-center">
            <span className="h-2 w-2 rounded-full bg-red-500 mr-1"></span>
            Mất kết nối
          </span>
        )}
      </div>
      {lastChecked && (
        <div className="text-gray-500 text-xs mt-1">
          Kiểm tra lúc: {formatTime(lastChecked)}
        </div>
      )}
      <button 
        onClick={checkConnection} 
        disabled={isChecking}
        className="mt-1 px-2 py-0.5 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 text-xs"
      >
        {isChecking ? 'Đang kiểm tra...' : 'Kiểm tra lại'}
      </button>
    </div>
  );
};

export default ConnectionStatus; 