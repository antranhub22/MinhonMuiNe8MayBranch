import React from 'react';
import { Link } from 'wouter';
import VoiceAssistant from '@/components/VoiceAssistant';

const Home: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <VoiceAssistant />
    </div>
  );
};

export default Home; 