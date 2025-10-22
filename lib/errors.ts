export const ERROR_CODES = {
  // 4xx Client Errors
  INVALID_INPUT: {
    code: 'INVALID_INPUT',
    status: 400,
    message: 'One or more input parameters are invalid'
  },
  MISSING_PARAMETER: {
    code: 'MISSING_PARAMETER',
    status: 400,
    message: 'A required parameter is missing'
  },
  INVALID_TYPE: {
    code: 'INVALID_TYPE',
    status: 400,
    message: 'Parameter has wrong data type'
  },
  VALIDATION_ERROR: {
    code: 'VALIDATION_ERROR',
    status: 400,
    message: 'Parameter value fails validation rules'
  },
  INVALID_REQUEST: {
    code: 'INVALID_REQUEST',
    status: 400,
    message: 'Request format is invalid'
  },
  VALUE_TOO_LOW: {
    code: 'VALUE_TOO_LOW',
    status: 400,
    message: 'Value is below minimum allowed'
  },
  VALUE_TOO_HIGH: {
    code: 'VALUE_TOO_HIGH',
    status: 400,
    message: 'Value exceeds maximum allowed'
  },
  INVALID_VALUE: {
    code: 'INVALID_VALUE',
    status: 400,
    message: 'Value is not in the list of allowed values'
  },
  UNAUTHORIZED: {
    code: 'UNAUTHORIZED',
    status: 401,
    message: 'Authentication required'
  },
  TOKEN_INVALID: {
    code: 'TOKEN_INVALID',
    status: 401,
    message: 'Invalid authentication token'
  },
  TOKEN_EXPIRED: {
    code: 'TOKEN_EXPIRED',
    status: 401,
    message: 'Authentication token has expired'
  },
  NOT_FOUND: {
    code: 'NOT_FOUND',
    status: 404,
    message: 'Resource not found'
  },
  RATE_LIMIT_EXCEEDED: {
    code: 'RATE_LIMIT_EXCEEDED',
    status: 429,
    message: 'Rate limit exceeded'
  },

  // 5xx Server Errors
  CALCULATION_ERROR: {
    code: 'CALCULATION_ERROR',
    status: 500,
    message: 'Error during calculation'
  },
  INTERNAL_ERROR: {
    code: 'INTERNAL_ERROR',
    status: 500,
    message: 'Internal server error'
  },
  SERVICE_UNAVAILABLE: {
    code: 'SERVICE_UNAVAILABLE',
    status: 503,
    message: 'Service temporarily unavailable'
  }
} as const;

export interface ApiError {
  error: string;      // Error code
  message: string;    // Human-readable message
  field?: string;     // Field name (for validation errors)
  details?: any;      // Additional context
  timestamp?: string; // ISO timestamp
  requestId?: string; // For tracking/debugging
}

export function createErrorResponse(
  errorCode: keyof typeof ERROR_CODES,
  customMessage?: string,
  additionalData?: Partial<ApiError>
): { body: ApiError; status: number } {
  const errorDef = ERROR_CODES[errorCode];

  const error: ApiError = {
    error: errorDef.code,
    message: customMessage || errorDef.message,
    timestamp: new Date().toISOString(),
    ...additionalData
  };

  return {
    body: error,
    status: errorDef.status
  };
}
