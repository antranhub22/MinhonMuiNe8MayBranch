import React from 'react';
import { Link } from 'wouter';
import VoiceAssistant from '@/components/VoiceAssistant';

const Home: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto max-w-3xl px-2 py-4 sm:px-4 sm:py-8">
        <header className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Hotel Service Management</h1>
          <p className="text-gray-600 mt-1 sm:mt-2 text-sm sm:text-base">Welcome to our voice-enabled service assistant</p>
        </header>

        <main className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-8">
          <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 flex flex-col">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2 sm:mb-4">Voice Assistant</h2>
            <div className="flex-1 flex items-center justify-center w-full">
              <VoiceAssistant />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 flex flex-col">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2 sm:mb-4">Quick Links</h2>
            <div className="space-y-3 sm:space-y-4 w-full">
              <Link href="/call-history">
                <button className="w-full px-4 py-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors flex items-center justify-center text-sm sm:text-base">
                  <span className="material-icons mr-2">history</span>
                  View Call History
                </button>
              </Link>
              <Link href="/staff/login">
                <button className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors flex items-center justify-center text-sm sm:text-base">
                  <span className="material-icons mr-2">login</span>
                  Staff Login
                </button>
              </Link>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Home; 