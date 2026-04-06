import { getAPIUrl } from './api';

const API_URL = getAPIUrl();

/**
 * Centralized admin API helper with automatic auth headers.
 * All admin endpoints require Bearer token from Supabase session.
 */
export async function adminFetch(
  path: string,
  options: RequestInit = {},
): Promise<Response> {
  // Get supabase session token from localStorage
  const storageKey = Object.keys(localStorage).find((k) =>
    k.startsWith('sb-') && k.endsWith('-auth-token')
  );
  let token = '';
  if (storageKey) {
    try {
      const session = JSON.parse(localStorage.getItem(storageKey) || '{}');
      token = session?.access_token || '';
    } catch {}
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return fetch(`${API_URL}/admin${path}`, {
    ...options,
    headers,
  });
}

/**
 * Typed GET request
 */
export async function adminGet<T = any>(path: string): Promise<T> {
  const res = await adminFetch(path);
  if (!res.ok) throw new Error(`Admin API error: ${res.status}`);
  return res.json();
}

/**
 * Typed POST request
 */
export async function adminPost<T = any>(
  path: string,
  body?: any,
): Promise<T> {
  const res = await adminFetch(path, {
    method: 'POST',
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Admin API error: ${res.status}`);
  }
  return res.json();
}

/**
 * Typed PATCH request
 */
export async function adminPatch<T = any>(
  path: string,
  body?: any,
): Promise<T> {
  const res = await adminFetch(path, {
    method: 'PATCH',
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Admin API error: ${res.status}`);
  }
  return res.json();
}

/**
 * Typed DELETE request
 */
export async function adminDelete<T = any>(path: string): Promise<T> {
  const res = await adminFetch(path, { method: 'DELETE' });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Admin API error: ${res.status}`);
  }
  return res.json();
}
