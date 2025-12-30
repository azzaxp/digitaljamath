export const getApiBaseUrl = () => {
    // Server-side: Use env var or default to internal docker network
    if (typeof window === 'undefined') {
        return process.env.NEXT_PUBLIC_API_URL || 'http://web:8000';
    }

    // Client-side: Always use current origin. 
    // This ensures requests go to distinct subdomains (e.g. demo.domain.com/api)
    // which is required for multi-tenant routing and avoids CORS issues.
    return window.location.origin;
};

/**
 * Get the domain suffix for workspace domains.
 * Configurable via NEXT_PUBLIC_DOMAIN_SUFFIX environment variable.
 * Falls back to current hostname for self-hosted deployments.
 */
export const getDomainSuffix = () => {
    // Allow override via environment variable
    if (process.env.NEXT_PUBLIC_DOMAIN_SUFFIX) {
        return process.env.NEXT_PUBLIC_DOMAIN_SUFFIX;
    }

    if (typeof window === 'undefined') return 'localhost';

    const hostname = window.location.hostname;

    // For localhost, just show "localhost"
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
        return 'localhost';
    }

    // For production, use the current domain
    return hostname;
};

/**
 * Get the base domain for redirect checks (main domain without subdomain)
 */
export const getBaseDomain = () => {
    if (process.env.NEXT_PUBLIC_BASE_DOMAIN) {
        return process.env.NEXT_PUBLIC_BASE_DOMAIN;
    }

    if (typeof window === 'undefined') return 'localhost';

    const hostname = window.location.hostname;

    // Handle localhost subdomains (e.g. tenant.localhost -> localhost)
    if (hostname.endsWith('.localhost')) {
        return 'localhost';
    }

    return hostname;
};

/**
 * Get the application version
 */
export const APP_VERSION = process.env.NEXT_PUBLIC_APP_VERSION || '1.0.4-alpha';
