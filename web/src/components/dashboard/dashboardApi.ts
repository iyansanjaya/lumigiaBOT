'use client';

export type DashboardFieldValue = string | number | null;

export class DashboardApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'DashboardApiError';
    this.status = status;
  }
}

async function readApiError(res: Response) {
  const payload = await res.json().catch(() => null);
  if (payload && typeof payload.error === 'string') return payload.error;
  return `Request gagal (${res.status})`;
}

export async function dashboardRequest<T = unknown>(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<T> {
  const res = await fetch(input, init);
  if (!res.ok) {
    throw new DashboardApiError(await readApiError(res), res.status);
  }
  return (await res.json().catch(() => ({}))) as T;
}

export async function patchDashboardField(
  endpoint: string,
  field: string,
  value: DashboardFieldValue,
) {
  return dashboardRequest<{ ok: boolean }>(endpoint, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ field, value }),
  });
}

export function getDashboardErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}
