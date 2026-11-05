import { NextResponse } from "next/server";

export interface ApiResponseMeta {
  timestamp: string;
  requestId?: string;
  [key: string]: any;
}

export interface ApiSuccessResponse<T = any> {
  success: true;
  data: T;
  meta: ApiResponseMeta;
}

export interface ApiErrorResponse {
  success: false;
  error: string;
  details?: any;
  meta: ApiResponseMeta;
}

/**
 * Return a standardized JSON success response.
 */
export function apiSuccess<T>(data: T, status: number = 200, meta?: Record<string, any>) {
  const payload: ApiSuccessResponse<T> = {
    success: true,
    data,
    meta: {
      timestamp: new Date().toISOString(),
      ...meta,
    },
  };
  return NextResponse.json(payload, { status });
}

/**
 * Return a standardized JSON error response.
 */
export function apiError(
  message: string,
  status: number = 400,
  details?: any,
  meta?: Record<string, any>
) {
  const payload: ApiErrorResponse = {
    success: false,
    error: message,
    ...(details !== undefined ? { details } : {}),
    meta: {
      timestamp: new Date().toISOString(),
      ...meta,
    },
  };
  return NextResponse.json(payload, { status });
}

/**
 * Higher-order wrapper for Next.js Route Handlers to guarantee
 * graceful error handling and prevent uncaught runtime 500 crashes.
 */
export function withErrorHandler(
  handler: (req: Request, context?: any) => Promise<NextResponse>
) {
  return async (req: Request, context?: any): Promise<NextResponse> => {
    try {
      return await handler(req, context);
    } catch (err: any) {
      console.error(`[API Handler Error] ${req.method} ${req.url}:`, err);
      return apiError(
        err?.message || "Internal server error occurred while processing request.",
        500
      );
    }
  };
}
