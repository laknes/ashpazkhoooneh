
import React, { useEffect } from 'react';
import { db } from '../services/db';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'product';
  jsonLd?: object;
}

const SEO: React.FC<SEOProps> = ({ 
  title, 
  description, 
  keywords, 
  image, 
  url, 
  type = 'website',
  jsonLd 
}) => {
  const settings = db.settings.get().seo;

  // Construct Final Title
  const siteTitle = title 
    ? settings.titleTemplate.replace('%s', title) 
    : settings.defaultTitle;

  const metaDescription = description || settings.defaultDescription;
  const metaKeywords = keywords || settings.defaultKeywords;
  const siteUrl = settings.siteUrl || window.location.origin;
  const currentUrl = url ? `${siteUrl}${url}` : window.location.href;
  const metaImage = image || `${siteUrl}/logo.png`; // Fallback image if available

  useEffect(() => {
    // Update Title
    document.title = siteTitle;

    // Helper to update meta tags
    const updateMeta = (name: string, content: string, attribute = 'name') => {
      let element = document.querySelector(`meta[${attribute}="${name}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attribute, name);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    // Standard Meta
    updateMeta('description', metaDescription);
    updateMeta('keywords', metaKeywords);

    // Open Graph
    updateMeta('og:title', siteTitle, 'property');
    updateMeta('og:description', metaDescription, 'property');
    updateMeta('og:image', metaImage, 'property');
    updateMeta('og:url', currentUrl, 'property');
    updateMeta('og:type', type, 'property');
    updateMeta('og:site_name', 'آشپزخونه', 'property');

    // Twitter Card
    updateMeta('twitter:card', 'summary_large_image', 'name');
    updateMeta('twitter:title', siteTitle, 'name');
    updateMeta('twitter:description', metaDescription, 'name');
    updateMeta('twitter:image', metaImage, 'name');

    // JSON-LD Injection
    const scriptId = 'json-ld-data';
    let scriptElement = document.getElementById(scriptId);
    
    if (jsonLd) {
        if (!scriptElement) {
            scriptElement = document.createElement('script');
            scriptElement.id = scriptId;
            scriptElement.setAttribute('type', 'application/ld+json');
            document.head.appendChild(scriptElement);
        }
        scriptElement.textContent = JSON.stringify(jsonLd);
    } else {
        // Cleanup if no JSON-LD provided for this page
        if (scriptElement) {
            scriptElement.textContent = '';
        }
    }

  }, [siteTitle, metaDescription, metaKeywords, metaImage, currentUrl, type, jsonLd]);

  return null; // This component doesn't render anything visible
};

export default SEO;
