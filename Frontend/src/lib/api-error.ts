import axios from "axios";

interface ApiErrorData {
  message?: string;
  title?: string;
  errors?: Record<string, string[]>;
}

export function getApiError(
  error: unknown,
  fallback = "حدث خطأ غير متوقع"
): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as ApiErrorData | undefined;

    if (data?.message) return data.message;
    if (data?.title) return data.title;

    const firstError = data?.errors
      ? Object.values(data.errors).flat()[0]
      : undefined;

    if (firstError) return firstError;
  }

  return error instanceof Error ? error.message : fallback;
}
