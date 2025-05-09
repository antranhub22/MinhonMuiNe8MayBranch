import VapiClient from '@vapi-ai/web';

if (!process.env.VITE_VAPI_PUBLIC_KEY) {
  throw new Error('VITE_VAPI_PUBLIC_KEY is not set in environment variables');
}

if (!process.env.VITE_VAPI_ASSISTANT_ID) {
  throw new Error('VITE_VAPI_ASSISTANT_ID is not set in environment variables');
}

export const vapi = new VapiClient({
  publicKey: process.env.VITE_VAPI_PUBLIC_KEY,
});

// Function to start a call
export async function startCall(phoneNumber: string) {
  try {
    const call = await vapi.calls.create({
      phoneNumber,
      assistantId: process.env.VITE_VAPI_ASSISTANT_ID!,
    });
    return call;
  } catch (error) {
    console.error('Error starting call:', error);
    throw error;
  }
}

// Function to end a call
export async function endCall(callId: string) {
  try {
    await vapi.calls.end(callId);
  } catch (error) {
    console.error('Error ending call:', error);
    throw error;
  }
}

// Function to get call status
export async function getCallStatus(callId: string) {
  try {
    const status = await vapi.calls.get(callId);
    return status;
  } catch (error) {
    console.error('Error getting call status:', error);
    throw error;
  }
}

// Function to get call transcript
export async function getCallTranscript(callId: string) {
  try {
    const transcript = await vapi.calls.getTranscript(callId);
    return transcript;
  } catch (error) {
    console.error('Error getting call transcript:', error);
    throw error;
  }
}

// Lấy language từ request (giả sử truyền qua query hoặc body)
function getLanguage(req: any) {
  return req.query?.language || req.body?.language || 'en';
}

// Lấy publicKey và assistantId theo ngôn ngữ
function getVapiConfig(language: string) {
  return {
    publicKey: language === 'fr'
      ? process.env.VITE_VAPI_PUBLIC_KEY_FR
      : process.env.VITE_VAPI_PUBLIC_KEY,
    assistantId: language === 'fr'
      ? process.env.VITE_VAPI_ASSISTANT_ID_FR
      : process.env.VITE_VAPI_ASSISTANT_ID,
  };
}

// Khi sử dụng:
// const { publicKey, assistantId } = getVapiConfig(getLanguage(req)); 