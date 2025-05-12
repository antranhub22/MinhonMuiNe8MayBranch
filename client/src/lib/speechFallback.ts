/**
 * Module cung cấp cơ chế dự phòng (fallback) khi nhận dạng giọng nói thất bại
 */

import { getVapiInstance, sendMessage } from './vapiClient';

// Các trạng thái nhận dạng giọng nói
type RecognitionState = 'idle' | 'listening' | 'processing' | 'error' | 'fallback';

// Cấu hình cho cơ chế fallback
interface FallbackConfig {
  // Số lần thử lại tối đa trước khi chuyển sang chế độ nhập text
  maxRetries: number;
  // Thời gian chờ trước khi kích hoạt fallback (ms)
  timeoutDuration: number;
  // Có tự động hiển thị UI nhập text không
  autoShowTextInput: boolean;
  // Có thông báo cho người dùng về vấn đề không
  notifyUser: boolean;
  // Thông báo hiển thị khi gặp lỗi
  errorMessage: string;
}

// Cấu hình mặc định
const DEFAULT_FALLBACK_CONFIG: FallbackConfig = {
  maxRetries: 3,
  timeoutDuration: 5000, // 5 giây
  autoShowTextInput: true,
  notifyUser: true,
  errorMessage: "Không thể nhận dạng giọng nói. Vui lòng thử lại hoặc sử dụng bàn phím."
};

// Đối tượng lưu trữ trạng thái hiện tại
let currentState: RecognitionState = 'idle';
let retryCount = 0;
let fallbackConfig: FallbackConfig = DEFAULT_FALLBACK_CONFIG;
let fallbackTimer: NodeJS.Timeout | null = null;

/**
 * Thiết lập cấu hình cho cơ chế fallback
 */
export function configureFallback(config: Partial<FallbackConfig>): void {
  fallbackConfig = { ...DEFAULT_FALLBACK_CONFIG, ...config };
}

/**
 * Bắt đầu theo dõi quá trình nhận dạng giọng nói
 */
export function startRecognitionMonitoring(): void {
  if (currentState !== 'idle') {
    resetFallbackTimer();
  }
  
  currentState = 'listening';
  startFallbackTimer();
}

/**
 * Báo hiệu rằng nhận dạng giọng nói thành công
 */
export function recognitionSucceeded(): void {
  resetFallbackTimer();
  currentState = 'idle';
  retryCount = 0;
}

/**
 * Báo hiệu rằng nhận dạng giọng nói thất bại
 */
export function recognitionFailed(error?: Error): void {
  resetFallbackTimer();
  
  retryCount++;
  console.error('Lỗi nhận dạng giọng nói:', error);
  
  if (retryCount >= fallbackConfig.maxRetries) {
    activateFallback();
  } else {
    currentState = 'error';
    
    // Thông báo lỗi
    if (fallbackConfig.notifyUser) {
      // Thực hiện thông báo UI
      showErrorNotification(`${fallbackConfig.errorMessage} (Lần thử ${retryCount}/${fallbackConfig.maxRetries})`);
    }
    
    // Thử lại sau một khoảng thời gian
    setTimeout(() => {
      startRecognitionMonitoring();
    }, 1000);
  }
}

/**
 * Kích hoạt cơ chế fallback
 */
function activateFallback(): void {
  currentState = 'fallback';
  
  // Hiển thị text input nếu được cấu hình
  if (fallbackConfig.autoShowTextInput) {
    showTextInputInterface();
  }
  
  // Thông báo cho người dùng
  if (fallbackConfig.notifyUser) {
    showErrorNotification("Đã chuyển sang chế độ nhập văn bản do gặp vấn đề với micro.");
  }
}

/**
 * Gửi văn bản từ interface fallback đến assistant
 */
export function sendTextInput(text: string): void {
  if (!text.trim()) return;
  
  const vapi = getVapiInstance();
  if (!vapi) {
    console.error('Vapi instance not initialized');
    return;
  }
  
  try {
    // Gửi tin nhắn dưới dạng text
    sendMessage(text, 'user');
    
    // Đặt lại trạng thái
    currentState = 'idle';
    retryCount = 0;
  } catch (error) {
    console.error('Không thể gửi tin nhắn văn bản:', error);
  }
}

/**
 * Kiểm tra xem đang ở chế độ fallback không
 */
export function isFallbackActive(): boolean {
  return currentState === 'fallback';
}

/**
 * Bắt đầu đếm ngược thời gian trước khi kích hoạt fallback
 */
function startFallbackTimer(): void {
  resetFallbackTimer();
  
  fallbackTimer = setTimeout(() => {
    // Nếu không nhận được phản hồi trong thời gian quy định
    if (currentState === 'listening') {
      recognitionFailed(new Error('Timeout waiting for speech recognition'));
    }
  }, fallbackConfig.timeoutDuration);
}

/**
 * Hủy bỏ bộ đếm thời gian
 */
function resetFallbackTimer(): void {
  if (fallbackTimer) {
    clearTimeout(fallbackTimer);
    fallbackTimer = null;
  }
}

/**
 * Hiển thị giao diện nhập văn bản
 * (lưu ý: cần được triển khai bởi ứng dụng)
 */
function showTextInputInterface(): void {
  // Triển khai theo UI cụ thể của ứng dụng
  const textInputEvent = new CustomEvent('show-text-input');
  window.dispatchEvent(textInputEvent);
}

/**
 * Hiển thị thông báo lỗi
 * (lưu ý: cần được triển khai bởi ứng dụng)
 */
function showErrorNotification(message: string): void {
  // Triển khai theo UI cụ thể của ứng dụng
  const notificationEvent = new CustomEvent('voice-recognition-error', {
    detail: { message }
  });
  window.dispatchEvent(notificationEvent);
}

/**
 * Chuyển đổi giữa chế độ giọng nói và nhập văn bản
 */
export function toggleInputMode(): 'voice' | 'text' {
  if (currentState === 'fallback') {
    // Chuyển về chế độ giọng nói
    currentState = 'idle';
    retryCount = 0;
    return 'voice';
  } else {
    // Chuyển sang chế độ nhập văn bản
    activateFallback();
    return 'text';
  }
}

/**
 * Nhận trạng thái hiện tại
 */
export function getCurrentState(): RecognitionState {
  return currentState;
}

/**
 * Đặt lại tất cả trạng thái
 */
export function resetState(): void {
  resetFallbackTimer();
  currentState = 'idle';
  retryCount = 0;
} 