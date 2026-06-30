import { type Request, type Response, type NextFunction } from 'express';
import { auth } from '../config/firebase.js';

/**
 * Middleware to verify Firebase ID token from Authorization header.
 */
export async function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ success: false, message: 'Unauthorized: No token provided' });
    return;
  }

  const token = authHeader.split('Bearer ')[1];

  try {
    const decodedToken = await auth.verifyIdToken(token);
    // Attach user info to request for downstream handlers
    (req as AuthenticatedRequest).user = {
      uid: decodedToken.uid,
      email: decodedToken.email || '',
      role: (decodedToken.role as string) || 'citizen',
    };
    next();
  } catch {
    res.status(401).json({ success: false, message: 'Unauthorized: Invalid token' });
  }
}

export interface AuthenticatedRequest extends Request {
  user: {
    uid: string;
    email: string;
    role: string;
  };
}
