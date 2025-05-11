const WebSocket = require('ws');

const WS_URL = process.env.WS_TEST_URL || 'wss://minhonhotelmuine.talk2go.online/ws';
const CALL_ID = process.env.WS_TEST_CALLID || '#ORD-TEST-RENDER';

console.log('Connecting to', WS_URL, 'with callId', CALL_ID);

const ws = new WebSocket(WS_URL);

ws.on('open', () => {
  console.log('[TEST] WebSocket connection established');
  ws.send(JSON.stringify({ type: 'init', callId: CALL_ID }));
});

ws.on('message', (data) => {
  if (typeof data === 'string' && data === 'ping') {
    ws.send('pong');
    console.log('[TEST] Received ping, sent pong');
    return;
  }
  try {
    const msg = JSON.parse(data);
    console.log('[TEST] Received message:', msg);
  } catch (e) {
    console.log('[TEST] Received non-JSON message:', data);
  }
});

ws.on('close', (code, reason) => {
  console.log('[TEST] WebSocket closed. Code:', code, 'Reason:', reason.toString());
});

ws.on('error', (err) => {
  console.error('[TEST] WebSocket error:', err);
});

// Keep process alive
setInterval(() => {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({ type: 'ping', ts: Date.now() }));
    console.log('[TEST] Sent ping');
  }
}, 20000); 