const LOCAL_API_BASE_URL = 'http://localhost:8080'

const configuredApiBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim()

if (import.meta.env.PROD && !configuredApiBaseUrl) {
  throw new Error('VITE_API_BASE_URL must be configured before building the Vercel deployment.')
}

/**
 * Base URL for the Spring Boot API.
 *
 * Local development falls back to http://localhost:8080. In Vercel, define
 * VITE_API_BASE_URL as the Railway backend's public HTTPS origin, without a
 * trailing slash.
 */
export const API_BASE_URL = (configuredApiBaseUrl || LOCAL_API_BASE_URL).replace(/\/+$/, '')
