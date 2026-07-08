export interface ErrorDetail {
  field?: string;
  message: string;
}

export class AppError extends Error {
  readonly code: string;
  readonly statusCode: number;
  readonly details: ErrorDetail[];
  readonly isOperational: boolean;

  constructor(
    code: string,
    message: string,
    statusCode: number,
    details: ErrorDetail[] = [],
    isOperational = true,
  ) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
    this.isOperational = isOperational;
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details: ErrorDetail[] = []) {
    super('VALIDATION_ERROR', message, 400, details);
  }
}

export class UnauthorizedError extends AppError {
  constructor(code: 'UNAUTHORIZED' | 'TOKEN_EXPIRED' = 'UNAUTHORIZED', message = 'Unauthorized') {
    super(code, message, 401);
  }
}

export class ForbiddenError extends AppError {
  constructor(code: 'FORBIDDEN' | 'CSRF_VALIDATION_FAILED' = 'FORBIDDEN', message = 'Forbidden') {
    super(code, message, 403);
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Not found') {
    super('NOT_FOUND', message, 404);
  }
}

export class ConflictError extends AppError {
  constructor(
    code:
      | 'ORDER_OUT_OF_STOCK'
      | 'CART_LIMIT_EXCEEDED'
      | 'QUOTE_EXPIRED'
      | 'QUOTE_INVALID'
      | 'IDEMPOTENCY_CONFLICT'
      | 'DUPLICATE_RESOURCE',
    message: string,
    details: ErrorDetail[] = [],
  ) {
    super(code, message, 409, details);
  }
}

export class RateLimitError extends AppError {
  constructor(message = 'Too many requests') {
    super('RATE_LIMIT_EXCEEDED', message, 429);
  }
}

export class InternalError extends AppError {
  constructor(message = 'Internal server error') {
    super('INTERNAL_ERROR', message, 500, [], false);
  }
}
