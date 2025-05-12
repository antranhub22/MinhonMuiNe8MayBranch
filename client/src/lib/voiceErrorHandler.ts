/**
 * Mô-đun xử lý lỗi cụ thể cho Voice Assistant
 * Cung cấp giám sát chi tiết, phân loại lỗi và cảnh báo
 */

import { logEvent } from './voiceMonitoring';

// Các loại lỗi có thể xảy ra với voice assistant
export enum VoiceErrorType {
  MICROPHONE_ACCESS_DENIED = 'microphone_access_denied',
  MICROPHONE_NOT_AVAILABLE = 'microphone_not_available',
  NETWORK_ERROR = 'network_error',
  SPEECH_RECOGNITION_FAILED = 'speech_recognition_failed',
  API_ERROR = 'api_error',
  TRANSCRIPTION_ERROR = 'transcription_error',
  CONTEXT_ERROR = 'context_error',
  UNKNOWN_ERROR = 'unknown_error'
}

// Interface mô tả chi tiết về lỗi
export interface VoiceError {
  type: VoiceErrorType;
  message: string;
  timestamp: number;
  retryable: boolean;
  details?: any;
  stack?: string;
}

// Lưu trữ danh sách lỗi gần đây
const recentErrors: VoiceError[] = [];
const MAX_ERRORS = 50;

// Các loại lỗi được coi là nghiêm trọng
const CRITICAL_ERROR_TYPES = [
  VoiceErrorType.MICROPHONE_ACCESS_DENIED,
  VoiceErrorType.MICROPHONE_NOT_AVAILABLE,
  VoiceErrorType.NETWORK_ERROR
];

// Hàm kiểm tra lỗi nghiêm trọng
export function isCriticalError(errorType: VoiceErrorType): boolean {
  return CRITICAL_ERROR_TYPES.includes(errorType);
}

/**
 * Xử lý lỗi voice assistant
 * Phân loại lỗi, ghi log, và thông báo nếu cần
 */
export function handleVoiceError(
  error: Error | string,
  errorType: VoiceErrorType = VoiceErrorType.UNKNOWN_ERROR,
  details?: any
): VoiceError {
  // Xây dựng đối tượng lỗi
  const voiceError: VoiceError = {
    type: errorType,
    message: typeof error === 'string' ? error : error.message,
    timestamp: Date.now(),
    retryable: errorType !== VoiceErrorType.MICROPHONE_ACCESS_DENIED,
    details,
    stack: error instanceof Error ? error.stack : undefined
  };

  // Lưu lỗi vào danh sách lỗi gần đây
  addToRecentErrors(voiceError);

  // Ghi log lỗi và gửi cảnh báo
  logEvent('error', { errorType: voiceError.type, message: voiceError.message }, {
    source: 'voice-assistant',
    errorDetails: voiceError.details ? JSON.stringify(voiceError.details) : voiceError.message
  });

  // Hiển thị thông báo nếu là lỗi nghiêm trọng
  if (isCriticalError(errorType)) {
    showErrorNotification(voiceError);
  }

  // Kiểm tra mức độ nghiêm trọng của lỗi lặp lại
  checkForRepeatedErrors(errorType);

  return voiceError;
}

/**
 * Thêm lỗi vào danh sách lỗi gần đây và giới hạn kích thước
 */
function addToRecentErrors(error: VoiceError): void {
  recentErrors.unshift(error);
  
  // Giới hạn số lượng lỗi lưu trữ
  if (recentErrors.length > MAX_ERRORS) {
    recentErrors.pop();
  }
}

/**
 * Kiểm tra lỗi lặp lại trong khoảng thời gian gần đây
 */
function checkForRepeatedErrors(errorType: VoiceErrorType): void {
  const lastMinute = Date.now() - 60000; // 1 phút trước
  const sameTypeErrors = recentErrors.filter(
    err => err.type === errorType && err.timestamp > lastMinute
  );

  // Nếu cùng loại lỗi xảy ra 3 lần trở lên trong 1 phút, gửi cảnh báo
  if (sameTypeErrors.length >= 3) {
    const alertEvent = new CustomEvent('voice-assistant-repeated-error', {
      detail: { 
        type: errorType, 
        count: sameTypeErrors.length,
        timestamp: Date.now()
      }
    });
    window.dispatchEvent(alertEvent);

    // Ghi log lỗi lặp lại
    logEvent('error', {
      alertType: 'repeated_errors',
      errorType,
      count: sameTypeErrors.length
    }, { source: 'error_handler' });
  }
}

/**
 * Hiển thị thông báo lỗi cho người dùng
 */
function showErrorNotification(error: VoiceError): void {
  // Lấy thông báo lỗi thân thiện hơn dựa trên loại lỗi
  const friendlyMessage = getFriendlyErrorMessage(error.type);
  
  // Tạo sự kiện để hiển thị thông báo lỗi
  const notificationEvent = new CustomEvent('voice-assistant-error-notification', {
    detail: {
      message: friendlyMessage,
      error: error
    }
  });
  
  window.dispatchEvent(notificationEvent);
}

/**
 * Lấy thông báo lỗi thân thiện dựa trên loại lỗi
 */
function getFriendlyErrorMessage(errorType: VoiceErrorType): string {
  switch (errorType) {
    case VoiceErrorType.MICROPHONE_ACCESS_DENIED:
      return 'Trợ lý ảo cần quyền truy cập microphone để hoạt động. Vui lòng cấp quyền trong cài đặt trình duyệt và thử lại.';
    
    case VoiceErrorType.MICROPHONE_NOT_AVAILABLE:
      return 'Không tìm thấy microphone. Vui lòng kiểm tra microphone của bạn và thử lại.';
    
    case VoiceErrorType.NETWORK_ERROR:
      return 'Không thể kết nối với máy chủ trợ lý ảo. Vui lòng kiểm tra kết nối internet và thử lại.';
    
    case VoiceErrorType.SPEECH_RECOGNITION_FAILED:
      return 'Không thể nhận dạng giọng nói. Vui lòng nói rõ ràng hơn hoặc thử lại trong môi trường yên tĩnh hơn.';
    
    case VoiceErrorType.API_ERROR:
      return 'Đã xảy ra lỗi khi xử lý yêu cầu. Vui lòng thử lại sau.';
    
    case VoiceErrorType.TRANSCRIPTION_ERROR:
      return 'Không thể chuyển đổi giọng nói thành văn bản. Vui lòng thử lại.';
    
    case VoiceErrorType.CONTEXT_ERROR:
      return 'Trợ lý ảo không thể xử lý yêu cầu trong ngữ cảnh hiện tại. Vui lòng thử cách khác.';
    
    default:
      return 'Đã xảy ra lỗi với trợ lý ảo. Vui lòng thử lại sau.';
  }
}

/**
 * Lấy danh sách lỗi gần đây
 */
export function getRecentVoiceErrors(): VoiceError[] {
  return [...recentErrors];
}

/**
 * Xóa danh sách lỗi gần đây
 */
export function clearRecentErrors(): void {
  recentErrors.length = 0;
}

/**
 * Lấy lỗi gần đây nhất theo loại
 */
export function getMostRecentErrorByType(errorType: VoiceErrorType): VoiceError | undefined {
  return recentErrors.find(err => err.type === errorType);
}

/**
 * Kiểm tra xem có lỗi nhất định xảy ra trong khoảng thời gian gần đây không
 */
export function hasErrorOccurredRecently(errorType: VoiceErrorType, timeWindowMs: number = 300000): boolean {
  const cutoffTime = Date.now() - timeWindowMs;
  return recentErrors.some(err => err.type === errorType && err.timestamp > cutoffTime);
} 