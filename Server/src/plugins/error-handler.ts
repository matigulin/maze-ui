import type { FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';
import { ZodError } from 'zod';
import {
  AppError,
  ConflictError,
  InternalError,
  RateLimitError,
  ValidationError,
} from '../lib/errors.js';

const MUTATING_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

function zodToValidation(error: ZodError): ValidationError {
  const details = error.issues.map((issue) => ({
    field: issue.path.join('.') || undefined,
    message: issue.message,
  }));
  return new ValidationError('Validation failed', details);
}

function mapUnknownError(error: unknown): AppError {
  if (error instanceof AppError) return error;
  if (error instanceof ZodError) return zodToValidation(error);

  const err = error as { name?: string; errors?: Array<{ path?: string }> };

  if (err?.name === 'SequelizeUniqueConstraintError') {
    return new ConflictError('DUPLICATE_RESOURCE', 'Resource already exists');
  }
  if (err?.name === 'SequelizeForeignKeyConstraintError') {
    return new ValidationError('Invalid reference');
  }

  return new InternalError();
}

const errorHandlerPlugin: FastifyPluginAsync = async (fastify) => {
  fastify.setErrorHandler((error, request, reply) => {
    const appError = mapUnknownError(error);
    const requestId = request.requestId ?? 'unknown';

    if (appError.isOperational) {
      request.log.warn(
        { err: appError, code: appError.code, statusCode: appError.statusCode, requestId },
        appError.message,
      );
    } else {
      request.log.error({ err: error, requestId }, 'Unhandled error');
    }

    if (appError instanceof RateLimitError) {
      const retryAfter = (error as RateLimitError & { retryAfter?: number }).retryAfter;
      if (retryAfter) {
        reply.header('Retry-After', String(retryAfter));
      }
    }

    return reply.status(appError.statusCode).send({
      error: {
        code: appError.code,
        message: appError.message,
        details: appError.details,
      },
      requestId,
    });
  });

  fastify.setNotFoundHandler((request, reply) => {
    const requestId = request.requestId ?? 'unknown';
    return reply.status(404).send({
      error: {
        code: 'NOT_FOUND',
        message: 'Not found',
        details: [],
      },
      requestId,
    });
  });
};

export default fp(errorHandlerPlugin, { name: 'error-handler' });

export { MUTATING_METHODS };
