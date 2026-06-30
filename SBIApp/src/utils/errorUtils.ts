export class AppError extends Error {
  public code: string;
  public statusCode?: number;

  constructor(message: string, code: string = 'UNKNOWN_ERROR', statusCode?: number) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.statusCode = statusCode;
  }
}

export const handleApiError = (error: any): AppError => {
  if (error.response) {
    const { status, data } = error.response;
    const message = data?.message || data?.error || 'Server error occurred';
    return new AppError(message, `API_${status}`, status);
  }
  if (error.request) {
    return new AppError('Network error - please check your connection', 'NETWORK_ERROR');
  }
  return new AppError(error.message || 'Unexpected error', 'UNKNOWN_ERROR');
};

export const logError = (error: Error, context?: any): void => {
  console.error('[ERROR]', error.name, error.message, context);
  // In production, send to error tracking service
};