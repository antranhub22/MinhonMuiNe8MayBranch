/**
 * Hook xử lý sự kiện từ Vapi SDK
 * Lắng nghe các sự kiện từ voice assistant và xử lý chúng theo cách chuẩn hóa
 */

import { useEffect, useRef, useState } from 'react';
import { getVapiInstance, initVapi } from '@/lib/vapiClient';
import { logEvent } from '@/lib/voiceMonitoring';
import { handleVoiceError, VoiceErrorType } from '@/lib/voiceErrorHandler';

interface UseVapiEventsOptions {
  onCallStart?: () => void;
  onCallEnd?: () => void;
  onSpeechStart?: () => void;
  onSpeechEnd?: () => void;
  onError?: (error: any) => void;
  onVolumeLevel?: (level: number) => void;
  onMessage?: (message: any) => void;
}

export const useVapiEvents = (options: UseVapiEventsOptions = {}) => {
  const [isCallActive, setIsCallActive] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [volumeLevel, setVolumeLevel] = useState(0);
  const [lastError, setLastError] = useState<any>(null);
  
  // Theo dõi nếu event handlers đã được attach
  const eventHandlersAttached = useRef(false);
  
  useEffect(() => {
    const setupEventListeners = async () => {
      // Kiểm tra nếu Vapi đã được khởi tạo
      const vapi = getVapiInstance();
      if (!vapi || eventHandlersAttached.current) return;
      
      try {
        // Đánh dấu là đã attach event handlers để tránh attach nhiều lần
        eventHandlersAttached.current = true;
        
        // Lắng nghe sự kiện call-start
        vapi.on('call-start', () => {
          console.log('VapiEvents: Call started');
          setIsCallActive(true);
          logEvent('call_start', { timestamp: Date.now() });
          options.onCallStart?.();
        });
        
        // Lắng nghe sự kiện call-end
        vapi.on('call-end', () => {
          console.log('VapiEvents: Call ended');
          setIsCallActive(false);
          setIsSpeaking(false);
          logEvent('call_end', { timestamp: Date.now() });
          options.onCallEnd?.();
        });
        
        // Lắng nghe sự kiện speech-start
        vapi.on('speech-start', () => {
          console.log('VapiEvents: Speech started');
          setIsSpeaking(true);
          logEvent('speech_start', { timestamp: Date.now() });
          options.onSpeechStart?.();
        });
        
        // Lắng nghe sự kiện speech-end
        vapi.on('speech-end', () => {
          console.log('VapiEvents: Speech ended');
          setIsSpeaking(false);
          logEvent('speech_end', { timestamp: Date.now() });
          options.onSpeechEnd?.();
        });
        
        // Lắng nghe sự kiện volume-level
        vapi.on('volume-level', (volume) => {
          // Chỉ log khi volume thay đổi đáng kể để tránh quá tải
          if (Math.abs(volume - volumeLevel) > 0.1) {
            console.log(`VapiEvents: Volume level: ${volume}`);
            logEvent('volume_level', { level: volume });
            options.onVolumeLevel?.(volume);
          }
          setVolumeLevel(volume);
        });
        
        // Lắng nghe sự kiện message
        vapi.on('message', (message) => {
          console.log('VapiEvents: Message received', message);
          logEvent('user_interaction', { message });
          options.onMessage?.(message);
        });
        
        // Lắng nghe sự kiện error
        vapi.on('error', (error) => {
          console.error('VapiEvents: Error occurred', error);
          setLastError(error);
          
          // Xử lý lỗi bằng error handler
          handleVoiceError(
            error, 
            VoiceErrorType.API_ERROR,
            { source: 'vapi_sdk', timestamp: Date.now() }
          );
          
          logEvent('error', { 
            errorMessage: error?.message || 'Unknown error',
            errorType: 'vapi_sdk_error'
          });
          
          options.onError?.(error);
        });
        
        // Thêm event listener tùy chỉnh cho sự kiện đặc biệt từ ứng dụng
        window.addEventListener('vapi-call-ended', () => {
          setIsCallActive(false);
          setIsSpeaking(false);
        });
        
        console.log('VapiEvents: All event listeners attached successfully');
      } catch (error) {
        console.error('VapiEvents: Failed to setup event listeners', error);
        handleVoiceError(
          error as Error,
          VoiceErrorType.UNKNOWN_ERROR,
          { source: 'vapi_events_setup' }
        );
      }
    };
    
    setupEventListeners();
    
    return () => {
      // Cleanup nếu cần
      const vapi = getVapiInstance();
      if (vapi && eventHandlersAttached.current) {
        try {
          // Có thể không cần xóa event listeners vì vapi instance được giữ lại
          // nhưng vẫn nên đánh dấu là chưa attach để có thể attach lại nếu cần
          eventHandlersAttached.current = false;
          
          // Xóa event listener tùy chỉnh
          window.removeEventListener('vapi-call-ended', () => {});
        } catch (error) {
          console.warn('VapiEvents: Error during cleanup', error);
        }
      }
    };
  }, [options]);
  
  return {
    isCallActive,
    isSpeaking,
    volumeLevel,
    lastError
  };
};

export default useVapiEvents; 