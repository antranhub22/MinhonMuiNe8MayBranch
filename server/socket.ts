import { Server as SocketIOServer, Socket } from "socket.io";
import { Server as HTTPServer } from "http";

export function setupSocket(server: HTTPServer) {
  const io = new SocketIOServer(server, {
    cors: {
      origin: process.env.CLIENT_URL || "*",
      methods: ["GET", "POST"],
      credentials: true
    },
    pingTimeout: 60000,
    pingInterval: 25000,
    transports: ['websocket', 'polling']
  });

  const connectedClients = new Map();

  const STAFF_ROOM = 'staff_requests';

  io.on("connection", (socket: Socket) => {
    console.log(`Socket connected: ${socket.id}`);

    const userAgent = socket.handshake.headers['user-agent'] || '';
    const isMobile = /iPhone|iPad|iPod|Android|Mobile|webOS|BlackBerry/i.test(userAgent);

    connectedClients.set(socket.id, {
      id: socket.id,
      deviceType: isMobile ? 'mobile' : 'desktop',
      connectedAt: new Date(),
      userAgent
    });

    console.log(`Device connected: ${isMobile ? 'Mobile' : 'Desktop'} - ${socket.id.substring(0, 6)}`);

    socket.join(STAFF_ROOM);
    console.log(`Socket ${socket.id} joined staff room`);

    io.emit('clients_count', connectedClients.size);

    socket.on("join_room", (orderId: string) => {
      socket.join(orderId);
      console.log(`Socket ${socket.id} joined room ${orderId}`);
    });

    socket.on("update_order_status", (data: { orderId: string; status: string }) => {
      const { orderId, status } = data;
      console.log(`Received status update for order ${orderId}: ${status}`);

      io.to(orderId).emit("order_status_update", { orderId, status });

      io.to(STAFF_ROOM).emit("data_changed", { 
        type: 'status_update',
        orderId, 
        status,
        timestamp: new Date().toISOString()
      });
    });

    socket.on("new_request", (data) => {
      console.log(`New request received from ${socket.id}`);

      io.to(STAFF_ROOM).emit("data_changed", {
        type: 'new_request',
        data,
        timestamp: new Date().toISOString()
      });
    });

    socket.on("ping", (callback) => {
      if (typeof callback === 'function') {
        callback({
          time: new Date().toISOString(),
          clients: connectedClients.size
        });
      }
    });

    socket.on("disconnect", () => {
      console.log(`Socket disconnected: ${socket.id}`);
      connectedClients.delete(socket.id);

      io.emit('clients_count', connectedClients.size);
    });
  });

  (io as any).broadcastStaffDataChange = (type: string, data: any) => {
    io.to(STAFF_ROOM).emit("data_changed", {
      type,
      data,
      timestamp: new Date().toISOString()
    });
  };

  return io;
}