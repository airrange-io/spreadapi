export const ERROR_CODES = {
  INVALID_REQUEST: { code: 'INVALID_REQUEST', status: 400, message: 'Request format is invalid' },
  UNAUTHORIZED: { code: 'UNAUTHORIZED', status: 401, message: 'Authentication required' },
  NOT_FOUND: { code: 'NOT_FOUND', status: 404, message: 'Resource not found' },
  RATE_LIMIT_EXCEEDED: { code: 'RATE_LIMIT_EXCEEDED', status: 429, message: 'Rate limit exceeded' },
  INTERNAL_ERROR: { code: 'INTERNAL_ERROR', status: 500, message: 'Internal server error' }
} as const;

export function createErrorResponse(
  errorCode: keyof typeof ERROR_CODES,
  customMessage?: string,
  additionalData?: any
): { body: any; status: number } {
  const errorDef = ERROR_CODES[errorCode];
  return {
    body: {
      error: errorDef.code,
      message: customMessage || errorDef.message,
      ...additionalData
    },
    status: errorDef.status
  };
}
