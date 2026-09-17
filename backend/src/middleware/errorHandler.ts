import { Request, Response, NextFunction } from 'express';

export function errorHandler(
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  console.error('Error:', err);

  if (err.code === '23505') {
    return res.status(409).json({
      success: false,
      message: 'Resource already exists',
    });
  }

  if (err.code === '22P02' || err.code === '23514') {
    return res.status(400).json({
      success: false,
      message: 'Invalid input data',
    });
  }

  const status = err.status || err.statusCode || 500;
  const message = err.message || 'Internal server error';

  res.status(status).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
}

export function notFoundHandler(_req: Request, res: Response) {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found',
  });
}
