const API_URL = '/api/backend';

export async function apiRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...init?.headers,
    },
    credentials: 'same-origin',
    cache: 'no-store',
  });
  if (!response.ok) {
    const body = await response.text();
    if (response.status === 401 && typeof window !== 'undefined' && !path.startsWith('/auth/login')) {
      window.location.replace('/login');
    }
    throw new Error(body || `Falha na API (${response.status})`);
  }
  return response.json() as Promise<T>;
}
