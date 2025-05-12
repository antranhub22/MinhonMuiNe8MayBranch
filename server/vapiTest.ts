/**
 * Test suite for Vapi.ai integration
 * 
 * Utility script to verify Vapi.ai connections are working correctly.
 * Run with: ts-node server/vapiTest.ts
 */

import { vapi, startCall, endCall, getCallStatus, getCallTranscript } from './vapi';
import https from 'https';
import { setTimeout as sleep } from 'timers/promises';

// Test settings
const TEST_PHONE = '+12345678900'; // Fake test number
const TIMEOUT = 10000; // 10 seconds
let testCallId: string | null = null;

/**
 * Checks if the Vapi client is properly initialized
 */
async function testVapiInitialization() {
  console.log('🔍 Testing Vapi initialization...');
  
  try {
    // Check if vapi instance exists
    if (!vapi) {
      throw new Error('Vapi client not initialized');
    }
    
    // Check if environmental variables are set
    if (!process.env.VITE_VAPI_PUBLIC_KEY) {
      throw new Error('VITE_VAPI_PUBLIC_KEY environment variable not set');
    }
    
    if (!process.env.VITE_VAPI_ASSISTANT_ID) {
      throw new Error('VITE_VAPI_ASSISTANT_ID environment variable not set');
    }
    
    console.log('✅ Vapi client initialized successfully');
    return true;
  } catch (error) {
    console.error('❌ Vapi initialization test failed:', error);
    return false;
  }
}

/**
 * Tests starting a call
 */
async function testStartCall() {
  console.log('🔍 Testing startCall function...');
  
  try {
    const call = await startCall(TEST_PHONE);
    
    // Check if we got a call response
    if (!call) {
      throw new Error('No call object returned');
    }
    
    // Get call ID for further tests
    testCallId = call.id || null;
    
    console.log(`✅ Start call successful. Call ID: ${testCallId}`);
    return true;
  } catch (error) {
    console.error('❌ Start call test failed:', error);
    return false;
  }
}

/**
 * Tests getting call status
 */
async function testGetCallStatus() {
  console.log('🔍 Testing getCallStatus function...');
  
  try {
    if (!testCallId) {
      throw new Error('No test call ID available');
    }
    
    const status = await getCallStatus(testCallId);
    
    // Check if we got a status response
    if (!status) {
      throw new Error('No status object returned');
    }
    
    console.log(`✅ Get call status successful. Status: ${JSON.stringify(status)}`);
    return true;
  } catch (error) {
    console.error('❌ Get call status test failed:', error);
    return false;
  }
}

/**
 * Tests ending a call
 */
async function testEndCall() {
  console.log('🔍 Testing endCall function...');
  
  try {
    if (!testCallId) {
      throw new Error('No test call ID available');
    }
    
    await endCall(testCallId);
    console.log('✅ End call successful');
    return true;
  } catch (error) {
    console.error('❌ End call test failed:', error);
    return false;
  }
}

/**
 * Tests getting call transcript
 */
async function testGetCallTranscript() {
  console.log('🔍 Testing getCallTranscript function...');
  
  try {
    if (!testCallId) {
      throw new Error('No test call ID available');
    }
    
    const transcript = await getCallTranscript(testCallId);
    
    // Check if we got a transcript response
    if (!transcript) {
      throw new Error('No transcript object returned');
    }
    
    console.log(`✅ Get call transcript successful. Messages count: ${transcript.messages?.length || 0}`);
    return true;
  } catch (error) {
    console.error('❌ Get call transcript test failed:', error);
    return false;
  }
}

/**
 * Tests HTTPS connection security
 */
async function testHTTPSConnection() {
  console.log('🔍 Testing HTTPS connection security...');
  
  try {
    // Create a promise to verify TLS connection
    return new Promise((resolve) => {
      const agent = new https.Agent({
        rejectUnauthorized: true,
        minVersion: 'TLSv1.2'
      });
      
      const url = new URL('https://api.vapi.ai');
      const options = {
        hostname: url.hostname,
        port: 443,
        path: '/ping',
        method: 'GET',
        agent
      };
      
      const req = https.request(options, (res) => {
        // Check for secure connection
        if (res.socket && 'encrypted' in res.socket && res.socket.encrypted) {
          console.log(`✅ HTTPS connection secure. TLS version: ${(res.socket as any).getProtocol?.() || 'unknown'}`);
          resolve(true);
        } else {
          console.error('❌ Connection not using HTTPS/TLS');
          resolve(false);
        }
      });
      
      req.on('error', (error) => {
        console.error('❌ HTTPS connection test failed:', error);
        resolve(false);
      });
      
      req.end();
    });
  } catch (error) {
    console.error('❌ HTTPS connection test failed:', error);
    return false;
  }
}

/**
 * Run all tests in sequence
 */
async function runTests() {
  console.log('=== STARTING VAPI INTEGRATION TESTS ===');
  
  // Set up a timeout to avoid hanging tests
  const timeoutId = setTimeout(() => {
    console.error('⚠️ Tests timed out after', TIMEOUT, 'ms');
    process.exit(1);
  }, TIMEOUT);
  
  // Check basic initialization
  const initResult = await testVapiInitialization();
  if (!initResult) {
    console.error('❌ Initialization failed, skipping remaining tests');
    clearTimeout(timeoutId);
    process.exit(1);
  }
  
  // Check HTTPS security
  await testHTTPSConnection();
  
  // Run call function tests in sequence
  const startResult = await testStartCall();
  if (!startResult || !testCallId) {
    console.error('❌ Unable to start call, skipping dependent tests');
    clearTimeout(timeoutId);
    process.exit(1);
  }
  
  // Give the API some time to process the call
  await sleep(1000);
  
  // Run remaining tests
  await testGetCallStatus();
  await testGetCallTranscript();
  await testEndCall();
  
  // All done
  clearTimeout(timeoutId);
  console.log('=== ALL TESTS COMPLETED ===');
}

// Run the tests
runTests().catch(error => {
  console.error('Unexpected error during tests:', error);
  process.exit(1);
}); 