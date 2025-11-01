import { Context, Next } from 'hono';
import jwt from 'jsonwebtoken';
import 'dotenv/config';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export interface JWTPayload {
  userId: number;
  email: string;
}

// JWT認証ミドルウェア
export const authMiddleware = async (c: Context, next: Next) => {
  try {
    const authHeader = c.req.header('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return c.json({ error: 'Unauthorized: No token provided' }, 401);
    }

    const token = authHeader.substring(7); // "Bearer " を除去

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
      
      // ユーザー情報をコンテキストに保存
      c.set('userId', decoded.userId);
      c.set('userEmail', decoded.email);
      
      await next();
    } catch (err) {
      if (err instanceof jwt.TokenExpiredError) {
        return c.json({ error: 'Token expired' }, 401);
      }
      if (err instanceof jwt.JsonWebTokenError) {
        return c.json({ error: 'Invalid token' }, 401);
      }
      throw err;
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    return c.json({ error: 'Authentication failed' }, 401);
  }
};

// JWTトークン生成関数
export const generateToken = (userId: number, email: string): string => {
  const payload: JWTPayload = { userId, email };
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';
  
  return jwt.sign(payload, JWT_SECRET, { expiresIn });
};
