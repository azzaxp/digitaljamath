/**
 * API utilities for making authenticated requests with Token Refresh support.
 */

import { getApiBaseUrl } from './config'

interface TokenResponse {
    access: string;
    refresh?: string;
}

let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

function onRefreshed(token: string) {
    refreshSubscribers.forEach((callback) => callback(token));
    refreshSubscribers = [];
}

function addRefreshSubscriber(callback: (token: string) => void) {
    refreshSubscribers.push(callback);
}

/**
 * Make an authenticated fetch request.
 * Automatically handles 401 errors by attempting to refresh the token.
 */
export async function fetchWithAuth(
    url: string,
    options: RequestInit = {}
): Promise<Response> {
    const apiBase = getApiBaseUrl();
    const fullUrl = url.startsWith('http') ? url : `${apiBase}${url}`;

    // Helper to constructing headers
    const getHeaders = (token: string | null) => {
        const headers = new Headers(options.headers || {});
        if (token) {
            headers.set('Authorization', `Bearer ${token}`);
        }
        if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
            headers.set('Content-Type', 'application/json');
        }
        return headers;
    };

    let token = localStorage.getItem('access_token');

    // 1. Initial Attempt
    let response = await fetch(fullUrl, {
        ...options,
        headers: getHeaders(token),
    });

    // 2. Handle 401 (Unauthorized)
    if (response.status === 401) {
        if (!isRefreshing) {
            isRefreshing = true;
            const refreshSuccess = await attemptRefreshToken();
            isRefreshing = false;

            if (refreshSuccess) {
                const newToken = localStorage.getItem('access_token');
                if (newToken) {
                    onRefreshed(newToken);
                } else {
                    logout(); // Should not happen if success
                }
            } else {
                logout();
                // Optionally redirect here or let the caller handle it
                // window.location.href = '/auth/signin'; 
                return response; // Return the 401
            }
        }

        // Wait for refresh to complete (if another request started it)
        const retryPromise = new Promise<Response>((resolve) => {
            addRefreshSubscriber(async (newToken) => {
                // Retry original request with new token
                const retryResponse = await fetch(fullUrl, {
                    ...options,
                    headers: getHeaders(newToken),
                });
                resolve(retryResponse);
            });
        });

        // If we just refreshed successfully, we can't rely on subscribers for *this* instance's trigger
        // actually if isRefreshing was true, subscribers are populated.
        // if isRefreshing was false (we did it), we must trigger manually or just retry.
        // Simpler approach: Just retry immediately if we were the refresher.

        // REFACTOR: The above "mutex" logic is complex with fetch.
        // Simplified Logic: 
        // If 401, try refresh. If successful, retry. If fail, logout.
        // We will ignore concurrent refresh optimization for now to keep it robust.

        const refreshed = await attemptRefreshToken();
        if (refreshed) {
            token = localStorage.getItem('access_token');
            return fetch(fullUrl, {
                ...options,
                headers: getHeaders(token),
            });
        } else {
            logout();
            return response;
        }
    }

    return response;
}

/**
 * Attempt to refresh the access token using the refresh token.
 */
async function attemptRefreshToken(): Promise<boolean> {
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) return false;

    const apiBase = getApiBaseUrl();
    try {
        const response = await fetch(`${apiBase}/api/token/refresh/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refresh: refreshToken }),
        });

        if (response.ok) {
            const data: TokenResponse = await response.json();
            localStorage.setItem('access_token', data.access);
            // Some APIs rotate refresh tokens too
            if (data.refresh) {
                localStorage.setItem('refresh_token', data.refresh);
            }
            return true;
        }
    } catch (error) {
        console.error("Token refresh failed", error);
    }
    return false;
}

/**
 * Login and store tokens.
 */
export async function login(email: string, password: string): Promise<boolean> {
    const apiBase = getApiBaseUrl()
    try {
        const response = await fetch(`${apiBase}/api/token/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: email, password }),
        })

        if (!response.ok) {
            return false
        }

        const data = await response.json()
        localStorage.setItem('access_token', data.access)
        localStorage.setItem('refresh_token', data.refresh)
        return true
    } catch (e) {
        return false;
    }
}

/**
 * Logout and clear tokens.
 */
export function logout(): void {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    // Dispatch event so UI can react?
    window.location.href = '/auth/signin';
}

/**
 * Check if user is authenticated.
 */
export function isAuthenticated(): boolean {
    return !!localStorage.getItem('access_token')
}
