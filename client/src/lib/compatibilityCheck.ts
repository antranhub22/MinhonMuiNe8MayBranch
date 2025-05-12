/**
 * Module kiểm tra tính tương thích của Vapi.ai Voice Assistant
 * với hệ thống JavaScript hiện tại
 */

/**
 * Danh sách các đối tượng global có thể xung đột
 * với thư viện Voice Assistant
 */
const POTENTIAL_CONFLICTS = [
  'AudioContext',
  'webkitAudioContext',
  'MediaRecorder',
  'navigator.mediaDevices',
  'getUserMedia',
  'WebSocket'
];

/**
 * Kiểm tra xung đột với các thư viện audio và WebRTC
 */
export function checkAudioConflicts(): { hasConflicts: boolean; conflicts: string[] } {
  const conflicts: string[] = [];

  // Kiểm tra AudioContext
  try {
    if (typeof window !== 'undefined' && window.AudioContext) {
      // Thử tạo một AudioContext
      const testContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      testContext.close().catch((e) => {
        conflicts.push(`AudioContext conflict: ${e.message}`);
      });
    }
  } catch (e) {
    conflicts.push(`AudioContext not available: ${(e as Error).message}`);
  }

  // Kiểm tra MediaDevices
  try {
    if (
      typeof navigator !== 'undefined' &&
      navigator.mediaDevices &&
      typeof navigator.mediaDevices.getUserMedia !== 'function'
    ) {
      conflicts.push('navigator.mediaDevices.getUserMedia is not available');
    }
  } catch (e) {
    conflicts.push(`MediaDevices API conflict: ${(e as Error).message}`);
  }

  return {
    hasConflicts: conflicts.length > 0,
    conflicts
  };
}

/**
 * Kiểm tra tính khả dụng của các API cần thiết
 */
export function checkRequiredAPIs(): { hasAllAPIs: boolean; missing: string[] } {
  const missing: string[] = [];

  // Các API cần thiết cho voice assistant
  const requiredAPIs = [
    { name: 'WebSocket', check: () => typeof WebSocket !== 'undefined' },
    { name: 'AudioContext', check: () => typeof (window.AudioContext || (window as any).webkitAudioContext) !== 'undefined' },
    { name: 'MediaRecorder', check: () => typeof window.MediaRecorder !== 'undefined' },
    { name: 'navigator.mediaDevices', check: () => typeof navigator.mediaDevices !== 'undefined' },
    { name: 'getUserMedia', check: () => typeof navigator.mediaDevices?.getUserMedia === 'function' }
  ];

  // Kiểm tra từng API
  requiredAPIs.forEach(api => {
    try {
      if (!api.check()) {
        missing.push(api.name);
      }
    } catch (e) {
      missing.push(`${api.name} (Error: ${(e as Error).message})`);
    }
  });

  return {
    hasAllAPIs: missing.length === 0,
    missing
  };
}

/**
 * Kiểm tra luồng dữ liệu audio
 */
export async function testAudioDataFlow(): Promise<{ success: boolean; message: string }> {
  if (typeof navigator === 'undefined' || !navigator.mediaDevices) {
    return { success: false, message: 'Media devices API không khả dụng' };
  }

  try {
    // Thử yêu cầu quyền truy cập vào microphone
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    
    // Kiểm tra xem stream có active không
    if (!stream.active) {
      stream.getTracks().forEach(track => track.stop());
      return { success: false, message: 'Audio stream không hoạt động' };
    }
    
    // Kiểm tra MediaRecorder có thể khởi tạo với stream
    try {
      const recorder = new MediaRecorder(stream);
      if (recorder.state !== 'inactive') {
        return { success: false, message: 'MediaRecorder không ở trạng thái inactive ban đầu' };
      }
      
      // Dừng tất cả các track và giải phóng tài nguyên
      stream.getTracks().forEach(track => track.stop());
      return { success: true, message: 'Kiểm tra luồng dữ liệu âm thanh thành công' };
    } catch (e) {
      stream.getTracks().forEach(track => track.stop());
      return { success: false, message: `Không thể khởi tạo MediaRecorder: ${(e as Error).message}` };
    }
  } catch (e) {
    return { success: false, message: `Không thể truy cập microphone: ${(e as Error).message}` };
  }
}

/**
 * Kiểm tra tính tương thích tổng thể của Vapi.ai
 * với hệ thống hiện tại
 */
export async function checkVapiCompatibility(): Promise<{
  isCompatible: boolean;
  issues: string[];
  browserSupport: boolean;
}> {
  const issues: string[] = [];
  
  // Kiểm tra trình duyệt
  const browser = detectBrowser();
  const isBrowserSupported = isSupported(browser);
  
  if (!isBrowserSupported) {
    issues.push(`Trình duyệt ${browser.name} ${browser.version} không được hỗ trợ đầy đủ cho Voice Assistant`);
  }
  
  // Kiểm tra xung đột audio
  const audioConflicts = checkAudioConflicts();
  if (audioConflicts.hasConflicts) {
    issues.push(...audioConflicts.conflicts);
  }
  
  // Kiểm tra các API cần thiết
  const apiCheck = checkRequiredAPIs();
  if (!apiCheck.hasAllAPIs) {
    issues.push(`Thiếu các API cần thiết: ${apiCheck.missing.join(', ')}`);
  }

  // Kiểm tra luồng dữ liệu
  try {
    const dataFlowCheck = await testAudioDataFlow();
    if (!dataFlowCheck.success) {
      issues.push(`Kiểm tra luồng dữ liệu âm thanh thất bại: ${dataFlowCheck.message}`);
    }
  } catch (e) {
    issues.push(`Lỗi kiểm tra luồng dữ liệu: ${(e as Error).message}`);
  }

  return {
    isCompatible: issues.length === 0,
    issues,
    browserSupport: isBrowserSupported
  };
}

/**
 * Phát hiện thông tin trình duyệt
 */
function detectBrowser(): { name: string; version: string } {
  const userAgent = navigator.userAgent;
  let browserName = "Unknown";
  let version = "Unknown";

  if (userAgent.indexOf("Firefox") > -1) {
    browserName = "Firefox";
    version = userAgent.match(/Firefox\/([0-9.]+)/)?.[1] || "Unknown";
  } else if (userAgent.indexOf("Edg") > -1) {
    browserName = "Edge";
    version = userAgent.match(/Edg\/([0-9.]+)/)?.[1] || "Unknown";
  } else if (userAgent.indexOf("Chrome") > -1) {
    browserName = "Chrome";
    version = userAgent.match(/Chrome\/([0-9.]+)/)?.[1] || "Unknown";
  } else if (userAgent.indexOf("Safari") > -1) {
    browserName = "Safari";
    version = userAgent.match(/Version\/([0-9.]+)/)?.[1] || "Unknown";
  } else if (userAgent.indexOf("MSIE") > -1 || userAgent.indexOf("Trident/") > -1) {
    browserName = "Internet Explorer";
    version = userAgent.match(/(?:MSIE |rv:)([0-9.]+)/)?.[1] || "Unknown";
  }

  return { name: browserName, version };
}

/**
 * Kiểm tra xem trình duyệt có được hỗ trợ không
 */
function isSupported(browser: { name: string; version: string }): boolean {
  // Danh sách các trình duyệt được hỗ trợ
  const supportedBrowsers = {
    "Chrome": 60,
    "Firefox": 60,
    "Safari": 14,
    "Edge": 80
  };
  
  // Chuyển đổi version thành số
  const majorVersion = parseInt(browser.version.split('.')[0], 10);
  
  // Kiểm tra xem trình duyệt có trong danh sách hỗ trợ không
  if (browser.name in supportedBrowsers) {
    const minVersion = supportedBrowsers[browser.name as keyof typeof supportedBrowsers];
    return !isNaN(majorVersion) && majorVersion >= minVersion;
  }
  
  return false;
} 