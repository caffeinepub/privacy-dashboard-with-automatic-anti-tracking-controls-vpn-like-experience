import { normalizeDomain } from './trackerBlocklist';

export interface ParsedDomain {
  original: string;
  normalized: string;
  isValid: boolean;
  error?: string;
}

export function parseDomainInput(input: string): ParsedDomain[] {
  const lines = input
    .split(/[\n,;]/)
    .map(line => line.trim())
    .filter(line => line.length > 0);

  return lines.map(line => {
    try {
      const normalized = normalizeDomain(line);
      
      if (!normalized || normalized.length === 0) {
        return {
          original: line,
          normalized: '',
          isValid: false,
          error: 'Empty domain',
        };
      }

      // Basic domain validation
      const domainRegex = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)*$/;
      if (!domainRegex.test(normalized)) {
        return {
          original: line,
          normalized,
          isValid: false,
          error: 'Invalid domain format',
        };
      }

      return {
        original: line,
        normalized,
        isValid: true,
      };
    } catch (error) {
      return {
        original: line,
        normalized: '',
        isValid: false,
        error: 'Parse error',
      };
    }
  });
}
