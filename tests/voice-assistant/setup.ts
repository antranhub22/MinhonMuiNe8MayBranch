/**
 * Setup file cho tests voice assistant
 * 
 * File này sẽ chạy trước mỗi bài test để thiết lập môi trường test
 */

import { setupVoiceTestEnvironment, cleanupVoiceTestEnvironment } from './test-environment';

// Thiết lập môi trường test voice assistant
beforeAll(() => {
  setupVoiceTestEnvironment();
  console.log('Voice Assistant test environment setup complete');
});

// Dọn dẹp sau khi chạy tất cả tests
afterAll(() => {
  cleanupVoiceTestEnvironment();
  console.log('Voice Assistant test environment cleaned up');
});

// Mock import.meta.env
vi.mock('@/lib/vapiClient', () => ({
  initVapi: vi.fn().mockResolvedValue({}),
  cleanupVapi: vi.fn(),
  getVapiInstance: vi.fn(),
  stopCall: vi.fn()
}));

// Export global vi object để sử dụng trong tests
export { vi } from 'vitest'; 