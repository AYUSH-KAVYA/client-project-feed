let accessToken: string | null = null;

export const setAccessToken = (token: string | null) => {
  accessToken = token;
};

export const getAccessToken = () => accessToken;

async function request<T>(url: string, options: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
    credentials: 'include', // Include HttpOnly cookies
  });

  // Handle 401 Unauthorized -> try refresh token once
  if (response.status === 401 && !url.includes('/api/auth/login') && !url.includes('/api/auth/refresh')) {
    const refreshRes = await fetch('/api/auth/refresh', {
      method: 'POST',
      credentials: 'include',
    });

    if (refreshRes.ok) {
      const refreshData = await refreshRes.json();
      setAccessToken(refreshData.data.accessToken);

      // Retry original request
      headers['Authorization'] = `Bearer ${refreshData.data.accessToken}`;
      const retryResponse = await fetch(url, {
        ...options,
        headers,
        credentials: 'include',
      });

      const retryJson = await retryResponse.json();
      if (!retryResponse.ok) {
        const detailMsg = Array.isArray(retryJson.error?.details) && retryJson.error.details.length > 0
          ? retryJson.error.details.map((d: any) => d.message).join(', ')
          : retryJson.error?.message || 'API Error';
        throw new Error(detailMsg);
      }
      return retryJson.data;
    } else {
      setAccessToken(null);
      window.dispatchEvent(new Event('auth:unauthorized'));
    }
  }

  const json = await response.json();
  if (!response.ok) {
    const detailMsg = Array.isArray(json.error?.details) && json.error.details.length > 0
      ? json.error.details.map((d: any) => d.message).join(', ')
      : json.error?.message || 'API Error';
    throw new Error(detailMsg);
  }

  return json.data;
}

export const api = {
  get: <T>(url: string) => request<T>(url, { method: 'GET' }),
  post: <T>(url: string, body: any) => request<T>(url, { method: 'POST', body: JSON.stringify(body) }),
  put: <T>(url: string, body: any) => request<T>(url, { method: 'PUT', body: JSON.stringify(body) }),
  patch: <T>(url: string, body?: any) => request<T>(url, { method: 'PATCH', body: body ? JSON.stringify(body) : undefined }),
  delete: <T>(url: string) => request<T>(url, { method: 'DELETE' }),
};
