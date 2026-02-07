import { useEffect } from 'react';
import { getSiteConfig } from '../config/site';

interface SeoMetadataOptions {
  title?: string;
  description?: string;
  path?: string;
}

export function useSeoMetadata(options: SeoMetadataOptions = {}) {
  useEffect(() => {
    const config = getSiteConfig();
    
    // Update document title
    if (options.title) {
      document.title = options.title;
    }

    // Update meta description
    if (options.description) {
      let metaDescription = document.querySelector('meta[name="description"]');
      if (!metaDescription) {
        metaDescription = document.createElement('meta');
        metaDescription.setAttribute('name', 'description');
        document.head.appendChild(metaDescription);
      }
      metaDescription.setAttribute('content', options.description);
    }

    // Update canonical link
    const canonicalUrl = `${config.baseUrl}${options.path || ''}`;
    let canonicalLink = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      canonicalLink.setAttribute('id', 'canonical-link');
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.href = canonicalUrl;
  }, [options.title, options.description, options.path]);
}
