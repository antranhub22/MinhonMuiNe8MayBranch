/**
 * Module tối ưu hóa kích thước bundle và lazy-loading cho Voice Assistant
 */

import { initVapi, cleanupVapi } from './vapiClient';

// Các biến để theo dõi trạng thái tải
let isVapiLoaded = false;
let isLoadingVapi = false;
let vapiLoadPromise: Promise<void> | null = null;
let networkStatus: 'online' | 'offline' | 'slow' = 'online';

/**
 * Kiểm tra tình trạng mạng
 */
async function checkNetworkQuality(): Promise<'online' | 'offline' | 'slow'> {
  if (!navigator.onLine) {
    return 'offline';
  }

  try {
    const startTime = Date.now();
    const response = await fetch('https://api.vapi.ai/ping', { 
      method: 'HEAD',
      cache: 'no-cache',
      headers: {
        'Cache-Control': 'no-cache'
      }
    });
    
    const endTime = Date.now();
    const latency = endTime - startTime;
    
    if (!response.ok) {
      return 'offline';
    }
    
    // Nếu độ trễ quá cao (> 1.5 giây), coi là mạng chậm
    return latency > 1500 ? 'slow' : 'online';
  } catch (error) {
    return 'offline';
  }
}

/**
 * Lazy load Vapi SDK
 */
export async function lazyLoadVapi(): Promise<void> {
  // Nếu đã tải xong, không cần tải lại
  if (isVapiLoaded) {
    return;
  }
  
  // Nếu đang tải, trả về promise hiện tại
  if (isLoadingVapi && vapiLoadPromise) {
    return vapiLoadPromise;
  }
  
  // Đánh dấu đang tải
  isLoadingVapi = true;
  
  // Tạo promise tải
  vapiLoadPromise = new Promise<void>(async (resolve, reject) => {
    try {
      // Kiểm tra tình trạng mạng trước khi tải
      networkStatus = await checkNetworkQuality();
      
      if (networkStatus === 'offline') {
        throw new Error('Không có kết nối internet');
      }
      
      // Lấy api key từ biến môi trường
      const apiKey = import.meta.env.VITE_VAPI_PUBLIC_KEY;
      
      if (!apiKey) {
        throw new Error('API key không được cấu hình');
      }
      
      // Khởi tạo Vapi
      await initVapi(apiKey);
      
      // Đánh dấu đã tải thành công
      isVapiLoaded = true;
      isLoadingVapi = false;
      
      // Thiết lập theo dõi kết nối mạng
      setupNetworkListeners();
      
      resolve();
    } catch (error) {
      console.error('Không thể tải Vapi:', error);
      isLoadingVapi = false;
      reject(error);
    }
  });
  
  return vapiLoadPromise;
}

/**
 * Theo dõi tình trạng mạng
 */
function setupNetworkListeners(): void {
  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);
  
  // Kiểm tra chất lượng mạng định kỳ
  setInterval(async () => {
    networkStatus = await checkNetworkQuality();
  }, 30000); // Kiểm tra mỗi 30 giây
}

/**
 * Xử lý khi có kết nối mạng
 */
function handleOnline(): void {
  networkStatus = 'online';
}

/**
 * Xử lý khi mất kết nối mạng
 */
function handleOffline(): void {
  networkStatus = 'offline';
}

/**
 * Giải phóng tài nguyên khi không sử dụng
 */
export function unloadVapi(): void {
  if (isVapiLoaded) {
    cleanupVapi();
    isVapiLoaded = false;
  }
  
  // Gỡ bỏ event listeners
  window.removeEventListener('online', handleOnline);
  window.removeEventListener('offline', handleOffline);
}

/**
 * Kiểm tra pin của thiết bị (nếu có)
 * Sử dụng Battery Status API
 */
export async function checkBatteryStatus(): Promise<{
  level: number;
  charging: boolean;
  lowPower: boolean;
} | null> {
  // Type definition cho Battery API
  interface BatteryManager {
    charging: boolean;
    chargingTime: number;
    dischargingTime: number;
    level: number;
    onchargingchange: ((this: BatteryManager, ev: Event) => any) | null;
    onchargingtimechange: ((this: BatteryManager, ev: Event) => any) | null;
    ondischargingtimechange: ((this: BatteryManager, ev: Event) => any) | null;
    onlevelchange: ((this: BatteryManager, ev: Event) => any) | null;
  }

  // Type definition cho navigator extension
  interface NavigatorWithBattery extends Navigator {
    getBattery?: () => Promise<BatteryManager>;
  }

  // Cast navigator to extended type
  const nav = navigator as NavigatorWithBattery;
  
  if (nav.getBattery) {
    try {
      const battery = await nav.getBattery();
      return {
        level: battery.level * 100, // Phần trăm
        charging: battery.charging,
        lowPower: battery.level <= 0.15 // Coi là pin yếu khi dưới 15%
      };
    } catch (error) {
      console.warn('Không thể kiểm tra trạng thái pin:', error);
    }
  }
  
  return null;
}

/**
 * Quyết định xem có nên tải Voice Assistant dựa trên điều kiện hiện tại
 */
export async function shouldLoadVoiceAssistant(): Promise<{
  shouldLoad: boolean;
  reason?: string;
}> {
  // Kiểm tra mạng
  if (networkStatus === 'offline') {
    return { shouldLoad: false, reason: 'Không có kết nối mạng' };
  }
  
  // Kiểm tra pin
  const batteryStatus = await checkBatteryStatus();
  if (batteryStatus && batteryStatus.lowPower && !batteryStatus.charging) {
    return { shouldLoad: false, reason: 'Pin yếu, hãy kết nối sạc để sử dụng voice assistant' };
  }
  
  return { shouldLoad: true };
}

/**
 * Kiểm tra khả năng sử dụng tính năng voice trong điều kiện mạng hiện tại
 */
export function getNetworkStatus(): 'online' | 'offline' | 'slow' {
  return networkStatus;
}

/**
 * Xác định xem voice assistant đã được tải chưa
 */
export function isVapiReady(): boolean {
  return isVapiLoaded;
} 