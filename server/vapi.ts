import VapiClient from '@vapi-ai/web';
import https from 'https';

// Validate environment variables
if (!process.env.VITE_VAPI_PUBLIC_KEY) {
  throw new Error('VITE_VAPI_PUBLIC_KEY is not set in environment variables');
}

if (!process.env.VITE_VAPI_ASSISTANT_ID) {
  throw new Error('VITE_VAPI_ASSISTANT_ID is not set in environment variables');
}

// Create secure HTTPS agent with modern TLS settings
const secureHttpsAgent = new https.Agent({
  rejectUnauthorized: true, // Verify server certificates
  minVersion: 'TLSv1.2',    // Minimum TLS version
  maxVersion: 'TLSv1.3',    // Maximum TLS version
  ciphers: [               // Modern cipher suite
    'TLS_AES_128_GCM_SHA256',
    'TLS_AES_256_GCM_SHA384',
    'TLS_CHACHA20_POLY1305_SHA256',
    'ECDHE-ECDSA-AES128-GCM-SHA256',
    'ECDHE-RSA-AES128-GCM-SHA256',
    'ECDHE-ECDSA-AES256-GCM-SHA384',
    'ECDHE-RSA-AES256-GCM-SHA384',
    'ECDHE-ECDSA-CHACHA20-POLY1305',
    'ECDHE-RSA-CHACHA20-POLY1305'
  ].join(':')
});

// API request timeout in milliseconds
const API_TIMEOUT = 30000; // 30 seconds

// Initialize client with secure settings
export const vapi = new VapiClient(process.env.VITE_VAPI_PUBLIC_KEY);

// Add security and timeout settings if supported by the library
// Newer versions of the library might support these options
try {
  // @ts-ignore - Attempt to set additional properties if available
  vapi.setRequestOptions?.({
    httpsAgent: secureHttpsAgent,
    timeout: API_TIMEOUT
  });
} catch (e) {
  console.warn('Unable to set advanced HTTP options for Vapi client');
}

// Function to start a call with enhanced error handling
export async function startCall(phoneNumber: string) {
  try {
    // Input validation
    if (!phoneNumber || typeof phoneNumber !== 'string') {
      throw new Error('Invalid phone number format');
    }

    // Use correct API format based on library version
    // Older versions might use direct methods
    // @ts-ignore - Access calls property which might exist in some versions
    if (vapi.calls && typeof vapi.calls.create === 'function') {
      // @ts-ignore - Call the create method
      return await vapi.calls.create({
        phoneNumber,
        assistantId: process.env.VITE_VAPI_ASSISTANT_ID!,
      });
    } else {
      // Fallback for older API
      // @ts-ignore - Call start method
      return await vapi.start(process.env.VITE_VAPI_ASSISTANT_ID!);
    }
  } catch (error) {
    console.error('Error starting call:', error);
    // Rethrow with sanitized message
    throw new Error('Failed to initiate call. Please try again later.');
  }
}

// Function to end a call with enhanced error handling
export async function endCall(callId: string) {
  try {
    // Input validation
    if (!callId || typeof callId !== 'string') {
      throw new Error('Invalid call ID format');
    }

    // Use correct API format based on library version
    // @ts-ignore - Access calls property which might exist in some versions
    if (vapi.calls && typeof vapi.calls.end === 'function') {
      // @ts-ignore - Call the end method
      await vapi.calls.end(callId);
    } else {
      // Fallback for older API
      // @ts-ignore - Call stop method
      await vapi.stop();
    }
  } catch (error) {
    console.error('Error ending call:', error);
    // Rethrow with sanitized message
    throw new Error('Failed to end call. Please try again later.');
  }
}

// Function to get call status with enhanced error handling
export async function getCallStatus(callId: string) {
  try {
    // Input validation
    if (!callId || typeof callId !== 'string') {
      throw new Error('Invalid call ID format');
    }

    // Use correct API format based on library version
    // @ts-ignore - Access calls property which might exist in some versions
    if (vapi.calls && typeof vapi.calls.get === 'function') {
      // @ts-ignore - Call the get method
      return await vapi.calls.get(callId);
    } else {
      // Fallback for older API - return basic status
      return { status: 'unknown', callId };
    }
  } catch (error) {
    console.error('Error getting call status:', error);
    // Rethrow with sanitized message
    throw new Error('Failed to retrieve call status. Please try again later.');
  }
}

// Function to get call transcript with enhanced error handling
export async function getCallTranscript(callId: string) {
  try {
    // Input validation
    if (!callId || typeof callId !== 'string') {
      throw new Error('Invalid call ID format');
    }

    // Use correct API format based on library version
    // @ts-ignore - Access calls property which might exist in some versions
    if (vapi.calls && typeof vapi.calls.getTranscript === 'function') {
      // @ts-ignore - Call the getTranscript method
      return await vapi.calls.getTranscript(callId);
    } else {
      // Fallback for older API - return empty transcript
      return { messages: [] };
    }
  } catch (error) {
    console.error('Error getting call transcript:', error);
    // Rethrow with sanitized message
    throw new Error('Failed to retrieve call transcript. Please try again later.');
  }
}

// Lấy language từ request (giả sử truyền qua query hoặc body)
function getLanguage(req: any) {
  // Input sanitization
  const lang = (req.query?.language || req.body?.language || 'en').toString().toLowerCase();
  
  // Return only supported languages
  const supportedLanguages = ['en', 'fr', 'zh', 'ru', 'ko'];
  return supportedLanguages.includes(lang) ? lang : 'en';
}

// Lấy publicKey và assistantId theo ngôn ngữ
function getVapiConfig(language: string) {
  // Use nullish coalescing to handle undefined values
  return {
    publicKey: language === 'fr'
      ? process.env.VITE_VAPI_PUBLIC_KEY_FR ?? process.env.VITE_VAPI_PUBLIC_KEY
      : language === 'zh'
        ? process.env.VITE_VAPI_PUBLIC_KEY_ZH ?? process.env.VITE_VAPI_PUBLIC_KEY
        : language === 'ru' 
          ? process.env.VITE_VAPI_PUBLIC_KEY_RU ?? process.env.VITE_VAPI_PUBLIC_KEY
          : language === 'ko'
            ? process.env.VITE_VAPI_PUBLIC_KEY_KO ?? process.env.VITE_VAPI_PUBLIC_KEY
            : process.env.VITE_VAPI_PUBLIC_KEY,
    assistantId: language === 'fr'
      ? process.env.VITE_VAPI_ASSISTANT_ID_FR ?? process.env.VITE_VAPI_ASSISTANT_ID
      : language === 'zh'
        ? process.env.VITE_VAPI_ASSISTANT_ID_ZH ?? process.env.VITE_VAPI_ASSISTANT_ID
        : language === 'ru'
          ? process.env.VITE_VAPI_ASSISTANT_ID_RU ?? process.env.VITE_VAPI_ASSISTANT_ID
          : language === 'ko'
            ? process.env.VITE_VAPI_ASSISTANT_ID_KO ?? process.env.VITE_VAPI_ASSISTANT_ID
            : process.env.VITE_VAPI_ASSISTANT_ID,
  };
}

// Khi sử dụng:
// const { publicKey, assistantId } = getVapiConfig(getLanguage(req)); 