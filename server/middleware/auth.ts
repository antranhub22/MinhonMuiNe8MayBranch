import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

interface JwtPayload {
  [key: string]: any;
}

export function verifyJWT(req: Request, res: Response, next: NextFunction) {
  console.log('Authorization Header:', req.headers.authorization);
  console.log('User-Agent:', req.headers['user-agent']);
  
  // Kiểm tra token từ nhiều nguồn: header, cookie, query param
  let token: string | undefined;
  
  // 1. Kiểm tra Authorization header
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  }
  
  // 2. Kiểm tra cookie (nếu không có trong header)
  if (!token && req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }
  
  // 3. Kiểm tra query param (cho thiết bị di động)
  if (!token && req.query.token) {
    token = req.query.token as string;
  }
  
  // Nếu không tìm thấy token, trả về lỗi
  if (!token) {
    console.log('Token not found from any source');
    return res.status(401).json({ 
      message: 'Missing or invalid authorization token',
      detail: 'Please provide a valid token via Authorization header, cookie or query parameter'
    });
  }
  
  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      console.error('JWT_SECRET is not defined in environment');
      return res.status(500).json({ message: 'Internal server error' });
    }
    
    console.log('Verifying token:', token.substring(0, 10) + '...');
    const payload = jwt.verify(token, secret) as JwtPayload;
    console.log('Token verified successfully for user:', payload.username);
    
    // Gắn payload lên request để sử dụng ở các middleware/route sau
    (req as any).user = payload;
    next();
  } catch (err) {
    console.error('Token verification failed:', err);
    return res.status(403).json({ 
      message: 'Invalid or expired token',
      detail: (err as Error).message
    });
  }
} 