// Built-in tracker domains for detection
export const DEFAULT_TRACKER_DOMAINS = [
  'doubleclick.net',
  'google-analytics.com',
  'googletagmanager.com',
  'facebook.com',
  'facebook.net',
  'connect.facebook.net',
  'analytics.twitter.com',
  'ads.twitter.com',
  'ads-twitter.com',
  'pixel.twitter.com',
  'static.ads-twitter.com',
  'analytics.tiktok.com',
  'ads.tiktok.com',
  'ads.linkedin.com',
  'analytics.linkedin.com',
  'ads.pinterest.com',
  'analytics.pinterest.com',
  'scorecardresearch.com',
  'quantserve.com',
  'hotjar.com',
  'mouseflow.com',
  'crazyegg.com',
  'mixpanel.com',
  'segment.com',
  'amplitude.com',
  'fullstory.com',
  'logrocket.com',
  'newrelic.com',
  'sentry.io',
  'bugsnag.com',
  'rollbar.com',
  'trackjs.com',
  'clarity.ms',
  'bing.com/analytics',
  'yandex.ru/metrika',
  'baidu.com/analytics',
];

export function normalizeDomain(input: string): string {
  try {
    let domain = input.trim().toLowerCase();
    
    // Remove protocol
    domain = domain.replace(/^https?:\/\//, '');
    domain = domain.replace(/^www\./, '');
    
    // Remove path and query
    domain = domain.split('/')[0];
    domain = domain.split('?')[0];
    domain = domain.split('#')[0];
    
    // Remove port
    domain = domain.split(':')[0];
    
    return domain;
  } catch {
    return input.trim().toLowerCase();
  }
}

export function isTrackerDomain(domain: string, blocklist: string[]): boolean {
  const normalized = normalizeDomain(domain);
  
  return blocklist.some(tracker => {
    const normalizedTracker = normalizeDomain(tracker);
    
    // Exact match
    if (normalized === normalizedTracker) {
      return true;
    }
    
    // Subdomain match (e.g., "ads.example.com" matches "example.com")
    if (normalized.endsWith('.' + normalizedTracker)) {
      return true;
    }
    
    return false;
  });
}

export function getEffectiveBlocklist(userBlocklist: string[]): string[] {
  const combined = [...DEFAULT_TRACKER_DOMAINS, ...userBlocklist];
  return Array.from(new Set(combined));
}
