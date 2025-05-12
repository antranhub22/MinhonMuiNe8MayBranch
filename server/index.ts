import 'dotenv/config';
import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { setupSocket } from './socket';
import cors from 'cors';
import cookieParser from 'cookie-parser';

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// Thêm CORS middleware để cho phép truy cập từ điện thoại
app.use(cors({
  origin: '*', // Cho phép tất cả các nguồn
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'PUT', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Device-Type'],
  credentials: true
}));

app.use((req, res, next) => {
  // Thêm headers CORS
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, PUT, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Device-Type');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  // Handle OPTIONS method
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  next();
});

// Support route
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    environment: process.env.NODE_ENV,
    time: new Date().toISOString(),
    hasDB: Boolean(process.env.DATABASE_URL)
  });
});

setupVite(app).then(async (isProduction) => {
  // Setup WebSocket first
  const httpServer = await registerRoutes(app);
  
  // Now setup Socket.IO and make it available to the app
  const io = setupSocket(httpServer);
  app.set('io', io); // Store IO instance in app for use in routes
  
  const port = process.env.PORT || 3000;
  httpServer.listen(port, () => {
    if (isProduction) {
      log(`Server running at http://localhost:${port}`);
    }
  });
});
