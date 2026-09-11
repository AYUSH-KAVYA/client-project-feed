let accessToken: string | null = null;

export const setAccessToken = (token: string | null) => {
  accessToken = token;
};

export const getAccessToken = () => accessToken;

function buildUrl(endpoint: string): string {
  if (endpoint.startsWith('http://') || endpoint.startsWith('https://')) {
    return endpoint;
  }

  // On any hosted deployment (such as *.vercel.app or custom domain),
  // always use relative URLs to guarantee same-origin requests
  if (typeof window !== 'undefined' && window.location && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    return endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  }

  const rawBaseUrl = (import.meta.env.VITE_API_URL as string) || '';
  if (!rawBaseUrl) {
    return endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  }

  const base = rawBaseUrl.trim().replace(/\/+$/, '');
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${base}${cleanEndpoint}`;
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const targetUrl = buildUrl(endpoint);

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  const response = await fetch(targetUrl, {
    ...options,
    headers,
    credentials: 'include', // Include HttpOnly cookies
  });

  // Handle 401 Unauthorized -> try refresh token once
  if (response.status === 401 && !endpoint.includes('/api/auth/login') && !endpoint.includes('/api/auth/refresh')) {
    const refreshUrl = buildUrl('/api/auth/refresh');
    const refreshRes = await fetch(refreshUrl, {
      method: 'POST',
      credentials: 'include',
    });

    if (refreshRes.ok) {
      const refreshData = await refreshRes.json();
      setAccessToken(refreshData.data.accessToken);

      // Retry original request
      headers['Authorization'] = `Bearer ${refreshData.data.accessToken}`;
      const retryResponse = await fetch(targetUrl, {
        ...options,
        headers,
        credentials: 'include',
      });

      let retryJson: any = null;
      const retryType = retryResponse.headers.get('content-type');
      if (retryType && retryType.includes('application/json')) {
        try {
          retryJson = await retryResponse.json();
        } catch {
          retryJson = null;
        }
      }

      if (!retryResponse.ok) {
        const detailMsg = Array.isArray(retryJson?.error?.details) && retryJson.error.details.length > 0
          ? retryJson.error.details.map((d: any) => d.message).join(', ')
          : retryJson?.error?.message || `Request failed (${retryResponse.status})`;
        throw new Error(detailMsg);
      }
      return retryJson?.data;
    } else {
      setAccessToken(null);
      window.dispatchEvent(new Event('auth:unauthorized'));
    }
  }

  let json: any = null;
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    try {
      json = await response.json();
    } catch {
      json = null;
    }
  }

  if (!response.ok) {
    const detailMsg = Array.isArray(json?.error?.details) && json.error.details.length > 0
      ? json.error.details.map((d: any) => d.message).join(', ')
      : json?.error?.message || `Request failed (${response.status}: ${response.statusText || 'Error'})`;
    throw new Error(detailMsg);
  }

  return json?.data;
}

export const api = {
  get: <T>(url: string) => request<T>(url, { method: 'GET' }),
  post: <T>(url: string, body: any) => request<T>(url, { method: 'POST', body: JSON.stringify(body) }),
  put: <T>(url: string, body: any) => request<T>(url, { method: 'PUT', body: JSON.stringify(body) }),
  patch: <T>(url: string, body?: any) => request<T>(url, { method: 'PATCH', body: body ? JSON.stringify(body) : undefined }),
  delete: <T>(url: string) => request<T>(url, { method: 'DELETE' }),
};
