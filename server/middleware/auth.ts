import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

interface JwtPayload {
  [key: string]: any;
}

export function verifyJWT(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  const userAgent = req.headers['user-agent'] || 'Unknown';
  const isMobile = /iPhone|iPad|iPod|Android|Mobile|webOS|BlackBerry/i.test(userAgent);
  
  console.log(`[AUTH] Request from ${isMobile ? 'MOBILE' : 'DESKTOP'} device`);
  console.log(`[AUTH] User-Agent: ${userAgent}`);
  console.log(`[AUTH] Auth header present: ${Boolean(authHeader)}`);
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.log('[AUTH] Missing or invalid authorization header');
    return res.status(401).json({ message: 'Missing or invalid authorization header' });
  }

  const token = authHeader.split(' ')[1];
  console.log(`[AUTH] Token received: ${token.substring(0, 10)}...`);
  
  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      console.error('[AUTH] JWT_SECRET is not defined in environment');
      return res.status(500).json({ message: 'Internal server error' });
    }
    
    console.log(`[AUTH] Verifying token with secret: ${secret.substring(0, 3)}...`);
    const payload = jwt.verify(token, secret) as JwtPayload;
    
    // Gắn payload lên request để sử dụng ở các middleware/route sau
    (req as any).user = payload;
    console.log(`[AUTH] Token valid for user: ${JSON.stringify(payload)}`);
    next();
  } catch (err) {
    console.error(`[AUTH] Token verification failed: ${(err as Error).message}`);
    return res.status(403).json({ message: 'Invalid or expired token' });
  }
} 