export type ApiSuccess<T> = { data: T; error: null };
export type ApiError = { data: null; error: { message: string; code: string } };
export type ApiResponse<T> = ApiSuccess<T> | ApiError;

export function apiSuccess<T>(data: T): ApiSuccess<T> {
  return { data, error: null };
}
export function apiError(message: string, code: string): ApiError {
  return { data: null, error: { message, code } };
}
