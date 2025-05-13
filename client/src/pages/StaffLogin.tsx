import React, { useState } from 'react';

interface StaffLoginProps {
  onLogin: () => void;
}

const StaffLogin: React.FC<StaffLoginProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      setError('Please enter both username and password.');
      return;
    }
    
    setError('');
    setIsLoading(true);
    
    try {
      // Make a real API call to verify credentials
      const response = await fetch('/api/staff/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });
      
      // Log the response status for debugging
      console.log(`Login response status: ${response.status}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Authentication failed');
      }
      
      const data = await response.json();
      
      // Save the token to localStorage
      localStorage.setItem('staff_token', data.token);
      console.log('Login successful, token saved');
      
      // Call the onLogin callback
      onLogin();
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || 'Invalid username or password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-blue-300">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md space-y-6 border border-gray-200">
        <h2 className="text-2xl font-bold text-blue-900 mb-4 text-center">Staff Login</h2>
        {error && <div className="text-red-500 text-sm mb-2">{error}</div>}
        <div>
          <label className="block text-gray-700 font-medium mb-1">Username</label>
          <input 
            type="text" 
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400" 
            value={username} 
            onChange={e => setUsername(e.target.value)} 
            autoFocus 
            disabled={isLoading}
          />
        </div>
        <div>
          <label className="block text-gray-700 font-medium mb-1">Password</label>
          <input 
            type="password" 
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400" 
            value={password} 
            onChange={e => setPassword(e.target.value)} 
            disabled={isLoading}
          />
        </div>
        <button 
          type="submit" 
          className={`w-full bg-blue-700 hover:bg-blue-800 text-white font-semibold py-2 rounded-lg transition ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
          disabled={isLoading}
        >
          {isLoading ? 'Logging in...' : 'Login'}
        </button>
      </form>
    </div>
  );
};

export default StaffLogin; 