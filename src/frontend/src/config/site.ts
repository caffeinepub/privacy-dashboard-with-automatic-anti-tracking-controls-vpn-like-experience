interface SiteConfig {
  baseUrl: string;
  name: string;
  description: string;
}

export function getSiteConfig(): SiteConfig {
  // Try to get the base URL from environment variable (set at build time)
  // @ts-ignore - Vite injects import.meta.env
  const envBaseUrl = import.meta.env?.VITE_SITE_BASE_URL;
  
  // Fallback to current origin if no environment variable is set
  const baseUrl = envBaseUrl || (typeof window !== 'undefined' ? window.location.origin : '');

  return {
    baseUrl,
    name: 'Incognibro',
    description: 'Privacy dashboard with automatic anti-tracking controls. Detect and block trackers to protect your online privacy.',
  };
}
