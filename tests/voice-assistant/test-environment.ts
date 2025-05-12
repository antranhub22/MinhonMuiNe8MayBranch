/**
 * Môi trường test riêng cho Voice Assistant
 * 
 * Tệp này thiết lập môi trường kiểm thử để chạy các bài test liên quan
 * đến voice assistant độc lập với các bài test khác.
 */

import { vi } from 'vitest';

/**
 * Thiết lập môi trường test voice assistant
 */
export function setupVoiceTestEnvironment(): void {
  // Mock Browser APIs
  mockBrowserApis();
  
  // Mock Vapi SDK
  mockVapiSdk();
  
  // Thiết lập các biến môi trường cần thiết
  setupEnvironmentVariables();

  console.log('Voice Assistant test environment setup completed');
}

/**
 * Mock các API trình duyệt cần thiết cho voice assistant
 */
function mockBrowserApis(): void {
  // Mock Audio APIs
  global.window = {
    ...global.window,
    AudioContext: vi.fn().mockImplementation(() => ({
      createAnalyser: vi.fn().mockReturnValue({
        connect: vi.fn(),
        disconnect: vi.fn(),
        fftSize: 0,
        getByteFrequencyData: vi.fn()
      }),
      createMediaStreamSource: vi.fn().mockReturnValue({
        connect: vi.fn()
      }),
      close: vi.fn().mockResolvedValue(undefined)
    })),
    webkitAudioContext: vi.fn().mockImplementation(() => ({
      createAnalyser: vi.fn(),
      createMediaStreamSource: vi.fn(),
      close: vi.fn()
    })),
    MediaRecorder: vi.fn().mockImplementation(() => ({
      start: vi.fn(),
      stop: vi.fn(),
      pause: vi.fn(),
      resume: vi.fn(),
      ondataavailable: null,
      onerror: null,
      addEventListener: vi.fn(),
      state: 'inactive'
    })),
    URL: {
      createObjectURL: vi.fn(),
      revokeObjectURL: vi.fn()
    },
    setTimeout: vi.fn(),
    clearTimeout: vi.fn(),
    setInterval: vi.fn(),
    clearInterval: vi.fn(),
    CustomEvent: vi.fn().mockImplementation((type, options) => ({
      type,
      detail: options?.detail
    })),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn()
  } as any;

  // Mock Navigator APIs
  global.navigator = {
    ...global.navigator,
    mediaDevices: {
      getUserMedia: vi.fn().mockImplementation(async (constraints) => {
        // Verify audio constraints
        if (!constraints || !constraints.audio) {
          throw new Error('Audio constraints required');
        }
        
        // Return mock media stream
        return {
          active: true,
          id: 'mock-stream-id',
          getTracks: () => ([{
            kind: 'audio',
            id: 'mock-audio-track',
            enabled: true,
            stop: vi.fn()
          }])
        };
      }),
      enumerateDevices: vi.fn().mockResolvedValue([
        {
          deviceId: 'mock-microphone',
          kind: 'audioinput',
          label: 'Mock Microphone',
          groupId: 'mock-group'
        }
      ])
    },
    userAgent: 'Mock User Agent',
    onLine: true
  } as any;
  
  // Mock WebSocket
  global.WebSocket = vi.fn().mockImplementation(() => ({
    close: vi.fn(),
    send: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    readyState: 1, // OPEN
    CONNECTING: 0,
    OPEN: 1,
    CLOSING: 2,
    CLOSED: 3
  })) as any;
  
  // Mock console methods to prevent test noise
  global.console = {
    ...global.console,
    log: vi.fn(),
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn()
  };
}

/**
 * Mock Vapi SDK
 */
function mockVapiSdk(): void {
  // Mock global fetch
  global.fetch = vi.fn().mockImplementation(async (url, options) => {
    if (url.toString().includes('api.vapi.ai/ping')) {
      return {
        ok: true,
        status: 200,
        text: vi.fn().mockResolvedValue('pong')
      };
    }
    
    return {
      ok: true,
      status: 200,
      json: vi.fn().mockResolvedValue({ success: true })
    };
  }) as any;
}

/**
 * Thiết lập biến môi trường cho tests
 */
function setupEnvironmentVariables(): void {
  // Setup import.meta 
  if (!global.import) {
    global.import = {
      meta: {
        env: {
          VITE_VAPI_PUBLIC_KEY: 'test-vapi-key',
          VITE_API_URL: 'https://test-api.example.com'
        }
      }
    } as any;
  } else {
    // Đã có import global, thêm meta 
    (global.import as any).meta = {
      env: {
        VITE_VAPI_PUBLIC_KEY: 'test-vapi-key',
        VITE_API_URL: 'https://test-api.example.com'
      }
    };
  }
}

/**
 * Dọn dẹp sau khi chạy tests
 */
export function cleanupVoiceTestEnvironment(): void {
  // Restore all mocks
  vi.restoreAllMocks();
  console.log('Voice Assistant test environment cleaned up');
}

/**
 * Helper function để tạo mock media stream
 */
export function createMockMediaStream(isActive = true): MediaStream {
  return {
    active: isActive,
    id: `mock-stream-${Date.now()}`,
    getTracks: () => ([{
      kind: 'audio',
      id: `mock-audio-track-${Date.now()}`,
      enabled: true,
      stop: vi.fn()
    }])
  } as unknown as MediaStream;
}

/**
 * Helper function để tạo lỗi mediaDevices
 */
export function simulateMediaDeviceError(errorMessage = 'Permission denied'): void {
  (global.navigator.mediaDevices as any).getUserMedia = vi.fn().mockRejectedValue(
    new Error(errorMessage)
  );
} 