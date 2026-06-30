import { type Request, type Response, type NextFunction } from 'express';

/**
 * Global error handler.
 * Never exposes internal error details to the client.
 */
export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  console.error('[Error]:', err.message);

  const statusCode = (err as AppError).statusCode || 500;
  const message =
    statusCode === 500
      ? 'An unexpected error occurred. Please try again later.'
      : err.message;

  res.status(statusCode).json({
    success: false,
    message,
  });
}

/**
 * Custom error class with HTTP status code.
 */
export class AppError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.statusCode = statusCode;
    this.name = 'AppError';
  }
}
