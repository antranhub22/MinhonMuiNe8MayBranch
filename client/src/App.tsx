import React, { Suspense, useEffect } from "react";
import ErrorBoundary from '@/components/ErrorBoundary';
import { Switch, Route, Link } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import VoiceAssistant from "@/components/VoiceAssistant";
import { AssistantProvider } from "@/context/AssistantContext";
import NotFound from "@/pages/not-found";
import EmailTester from "@/components/EmailTester";
import { useWebSocket } from '@/hooks/useWebSocket';
import StaffPage from '@/pages/staff';
import { BrowserRouter } from 'react-router-dom';

// Lazy-loaded components
const CallHistory = React.lazy(() => import('@/pages/CallHistory'));
const CallDetails = React.lazy(() => import('@/pages/CallDetails'));

// Loading fallback
const LoadingFallback = () => (
  <div className="flex items-center justify-center h-screen bg-gray-50">
    <div className="flex flex-col items-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
      <p className="text-gray-500">Đang tải...</p>
    </div>
  </div>
);

// Email tester page
const EmailTestPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Kiểm tra Tính năng Email</h1>
          <Link href="/" className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90">
            Quay lại Trang Chính
          </Link>
        </div>
        <EmailTester />
      </div>
    </div>
  );
};

function Router() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <Switch>
        <Route path="/call-history" component={CallHistory} />
        <Route path="/call-details/:callId" component={CallDetails} />
        <Route path="/email-test" component={EmailTestPage} />
        <Route path="/staff" component={StaffPage} />
        <Route path="/" component={VoiceAssistant} />
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

function App() {
  // Initialize WebSocket globally to keep connection across routes
  useWebSocket();

  // Version check and cache busting
  useEffect(() => {
    try {
      // Lấy version từ meta tag
      const metaVersion = document.querySelector('meta[name="version"]')?.getAttribute('content');
      const currentVersion = metaVersion || '1.0.2-07052024';
      
      // Lấy phiên bản đã lưu
      const lastVersion = localStorage.getItem('app_version');
      
      console.log('App version check:', { currentVersion, lastVersion });
      
      // Nếu phiên bản khác với phiên bản đã lưu, cập nhật localStorage và làm mới trang
      if (lastVersion !== currentVersion) {
        localStorage.setItem('app_version', currentVersion);
        
        // Chỉ làm mới khi đã có phiên bản trước đó (không phải lần đầu truy cập)
        if (lastVersion) {
          console.log('New version detected, refreshing page...');
          window.location.reload();
        }
      }
    } catch (err) {
      console.error('Error checking app version:', err);
    }
  }, []);

  return (
    <BrowserRouter>
      <AssistantProvider>
        <ErrorBoundary>
          <Router />
          <Toaster />
        </ErrorBoundary>
      </AssistantProvider>
    </BrowserRouter>
  );
}

export default App;
