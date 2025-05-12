/**
 * Module giám sát và logging cho Voice Assistant
 * Cung cấp các chức năng giám sát, phân tích và ghi log
 */

// Các loại sự kiện cần theo dõi
type EventType = 
  | 'transcription'
  | 'model_output'
  | 'call_start'
  | 'call_end'
  | 'error'
  | 'speech_start'
  | 'speech_end'
  | 'volume_level'
  | 'network_issue'
  | 'api_call'
  | 'user_interaction'
  | 'info';

// Thông tin chi tiết về sự kiện
interface EventDetail {
  timestamp: number;
  type: EventType;
  data?: any;
  duration?: number;
  source?: string;
  success?: boolean;
  errorDetails?: string | Error;
}

// Cấu hình cho việc ghi log
interface LoggingConfig {
  // Có ghi log ra console không
  consoleOutput: boolean;
  // Có ghi log lên server không
  serverReporting: boolean;
  // Các loại sự kiện cần ghi log
  logLevels: {
    [key in EventType]?: 'debug' | 'info' | 'warn' | 'error' | 'none';
  };
  // URL để gửi log lên server
  serverLogEndpoint?: string;
  // Ngưỡng báo động cho độ trễ API (ms)
  apiLatencyThreshold: number;
  // Có bật ghi log các sự kiện nhạy cảm không
  logSensitiveData: boolean;
}

// Cấu hình mặc định
const DEFAULT_CONFIG: LoggingConfig = {
  consoleOutput: true,
  serverReporting: false,
  logLevels: {
    transcription: 'debug',
    model_output: 'debug',
    call_start: 'info',
    call_end: 'info',
    error: 'error',
    speech_start: 'debug',
    speech_end: 'debug',
    volume_level: 'none',
    network_issue: 'warn',
    api_call: 'debug',
    user_interaction: 'debug',
    info: 'info'
  },
  apiLatencyThreshold: 1000,
  logSensitiveData: false
};

// Kho lưu trữ sự kiện
let eventStore: EventDetail[] = [];
// Giới hạn số lượng sự kiện lưu trữ để tránh memory leak
const MAX_STORED_EVENTS = 1000;
// Cấu hình hiện tại
let config: LoggingConfig = {...DEFAULT_CONFIG};

/**
 * Cấu hình hệ thống giám sát
 */
export function configureMonitoring(userConfig: Partial<LoggingConfig>): void {
  config = { ...DEFAULT_CONFIG, ...userConfig };
}

/**
 * Ghi lại một sự kiện
 */
export function logEvent(
  type: EventType,
  data?: any,
  options?: {
    duration?: number;
    source?: string;
    success?: boolean;
    errorDetails?: string | Error;
  }
): void {
  const event: EventDetail = {
    timestamp: Date.now(),
    type,
    data,
    ...options
  };

  // Kiểm tra xem có nên lọc dữ liệu nhạy cảm không
  if (!config.logSensitiveData && (type === 'transcription' || type === 'model_output')) {
    // Lọc thông tin nhạy cảm trước khi lưu
    event.data = sanitizeSensitiveData(event.data);
  }

  // Thêm vào kho lưu trữ
  addToEventStore(event);

  // Ghi log ra console nếu được cấu hình
  if (config.consoleOutput && shouldLogEvent(type)) {
    logToConsole(event);
  }

  // Gửi log lên server nếu được cấu hình
  if (config.serverReporting && shouldLogEvent(type)) {
    reportToServer(event);
  }

  // Kiểm tra các điều kiện cảnh báo
  checkForAlerts(event);
}

/**
 * Kiểm tra xem sự kiện có nên được ghi log không
 */
function shouldLogEvent(type: EventType): boolean {
  const logLevel = config.logLevels[type];
  return logLevel !== 'none';
}

/**
 * Lọc dữ liệu nhạy cảm
 */
function sanitizeSensitiveData(data: any): any {
  if (!data) return data;

  // Nếu là string, lọc các thông tin nhạy cảm
  if (typeof data === 'string') {
    // Mẫu regex để phát hiện thông tin nhạy cảm: email, số điện thoại, thẻ tín dụng, v.v.
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
    const phoneRegex = /(\+\d{1,3}[ -]?)?\(?\d{3}\)?[ -]?\d{3}[ -]?\d{4}/g;
    const creditCardRegex = /\b(?:\d[ -]*?){13,16}\b/g;

    let sanitized = data
      .replace(emailRegex, '[EMAIL]')
      .replace(phoneRegex, '[PHONE]')
      .replace(creditCardRegex, '[CREDIT_CARD]');

    return sanitized;
  }

  // Nếu là object, lọc các trường nhạy cảm
  if (typeof data === 'object' && data !== null) {
    const sensitiveKeys = ['email', 'phone', 'password', 'address', 'credit_card', 'cc', 'cvv'];
    const sanitized = { ...data };

    for (const key of Object.keys(sanitized)) {
      if (sensitiveKeys.some(sk => key.toLowerCase().includes(sk))) {
        sanitized[key] = '[REDACTED]';
      } else if (typeof sanitized[key] === 'object') {
        // Đệ quy cho các object lồng nhau
        sanitized[key] = sanitizeSensitiveData(sanitized[key]);
      }
    }

    return sanitized;
  }

  return data;
}

/**
 * Thêm sự kiện vào kho lưu trữ
 */
function addToEventStore(event: EventDetail): void {
  eventStore.push(event);

  // Giới hạn kích thước của kho lưu trữ
  if (eventStore.length > MAX_STORED_EVENTS) {
    eventStore = eventStore.slice(-MAX_STORED_EVENTS);
  }
}

/**
 * Ghi log ra console
 */
function logToConsole(event: EventDetail): void {
  const logLevel = config.logLevels[event.type] || 'info';
  const prefix = `[VoiceAssistant][${event.type}]`;

  switch (logLevel) {
    case 'debug':
      console.debug(prefix, event);
      break;
    case 'info':
      console.info(prefix, event);
      break;
    case 'warn':
      console.warn(prefix, event);
      break;
    case 'error':
      console.error(prefix, event);
      break;
  }
}

/**
 * Gửi log lên server
 */
async function reportToServer(event: EventDetail): Promise<void> {
  if (!config.serverLogEndpoint) return;

  try {
    await fetch(config.serverLogEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        timestamp: event.timestamp,
        type: event.type,
        data: event.data,
        duration: event.duration,
        source: event.source,
        success: event.success,
        errorDetails: event.errorDetails ? String(event.errorDetails) : undefined,
        userAgent: navigator.userAgent,
        url: window.location.href
      })
    });
  } catch (error) {
    // Không ghi log lỗi này để tránh vòng lặp vô hạn
    if (config.consoleOutput) {
      console.error('[VoiceAssistant] Failed to report event to server:', error);
    }
  }
}

/**
 * Kiểm tra các điều kiện cảnh báo
 */
function checkForAlerts(event: EventDetail): void {
  // Kiểm tra độ trễ API
  if (event.type === 'api_call' && event.duration && event.duration > config.apiLatencyThreshold) {
    triggerAlert('high_latency', {
      message: `API call latency exceeded threshold: ${event.duration}ms`,
      threshold: config.apiLatencyThreshold,
      actual: event.duration
    });
  }

  // Kiểm tra các lỗi liên tiếp
  if (event.type === 'error') {
    const recentErrors = getRecentEvents('error', 60000); // 1 phút
    if (recentErrors.length >= 3) {
      triggerAlert('consecutive_errors', {
        message: 'Multiple errors occurred in short succession',
        count: recentErrors.length,
        errors: recentErrors.map(e => e.errorDetails || 'Unknown error')
      });
    }
  }
}

/**
 * Kích hoạt cảnh báo
 */
function triggerAlert(alertType: string, alertData: any): void {
  // Ghi log cảnh báo
  logEvent('error', { alertType, ...alertData }, { source: 'monitoring_system' });

  // Thông báo sự kiện cảnh báo
  const alertEvent = new CustomEvent('voice-assistant-alert', {
    detail: { type: alertType, data: alertData }
  });
  window.dispatchEvent(alertEvent);
}

/**
 * Lấy các sự kiện gần đây theo loại
 */
export function getRecentEvents(type: EventType, timeWindow: number = 300000): EventDetail[] {
  const now = Date.now();
  return eventStore.filter(event => 
    event.type === type && (now - event.timestamp) <= timeWindow
  );
}

/**
 * Lấy toàn bộ lịch sử sự kiện
 */
export function getEventHistory(): EventDetail[] {
  return [...eventStore];
}

/**
 * Xóa lịch sử sự kiện
 */
export function clearEventHistory(): void {
  eventStore = [];
}

/**
 * Tạo báo cáo hiệu suất
 */
export function generatePerformanceReport(): {
  callCount: number;
  averageCallDuration: number;
  errorRate: number;
  apiLatency: number;
  transcriptionAccuracy: number;
} {
  const now = Date.now();
  const timeWindow = 24 * 60 * 60 * 1000; // 24 giờ
  const recentEvents = eventStore.filter(event => (now - event.timestamp) <= timeWindow);
  
  // Tổng số cuộc gọi
  const callStartEvents = recentEvents.filter(event => event.type === 'call_start');
  const callCount = callStartEvents.length;
  
  // Thời lượng trung bình
  const callEndEvents = recentEvents.filter(event => event.type === 'call_end' && event.duration);
  const totalDuration = callEndEvents.reduce((sum, event) => sum + (event.duration || 0), 0);
  const averageCallDuration = callCount > 0 ? totalDuration / callCount : 0;
  
  // Tỷ lệ lỗi
  const errorEvents = recentEvents.filter(event => event.type === 'error');
  const errorRate = callCount > 0 ? errorEvents.length / callCount : 0;
  
  // Độ trễ API
  const apiCallEvents = recentEvents.filter(event => event.type === 'api_call' && event.duration);
  const totalLatency = apiCallEvents.reduce((sum, event) => sum + (event.duration || 0), 0);
  const apiLatency = apiCallEvents.length > 0 ? totalLatency / apiCallEvents.length : 0;
  
  // Độ chính xác transcription (giả định)
  const transcriptionAccuracy = 0.95; // Giá trị cố định vì không có cách đo trực tiếp
  
  return {
    callCount,
    averageCallDuration,
    errorRate,
    apiLatency,
    transcriptionAccuracy
  };
}

/**
 * Thiết lập xử lý lỗi toàn cục
 */
function setupGlobalErrorHandling(): void {
  // Lắng nghe các lỗi không bắt được
  window.addEventListener('error', (event) => {
    logEvent('error', { message: event.message }, { 
      source: 'window',
      errorDetails: `${event.message} at ${event.filename}:${event.lineno}:${event.colno}`
    });
  });

  // Lắng nghe các rejection không bắt được
  window.addEventListener('unhandledrejection', (event) => {
    logEvent('error', { message: 'Unhandled Promise Rejection' }, {
      source: 'promise',
      errorDetails: event.reason
    });
  });
}

/**
 * Khởi tạo hệ thống giám sát
 */
export function initMonitoring(userConfig?: Partial<LoggingConfig>): void {
  if (userConfig) {
    configureMonitoring(userConfig);
  }
  
  // Ghi log sự kiện khởi tạo
  logEvent('info', { message: 'Voice monitoring system initialized' }, { source: 'monitoring_system' });
  
  // Thiết lập theo dõi lỗi global
  setupGlobalErrorHandling();
} 