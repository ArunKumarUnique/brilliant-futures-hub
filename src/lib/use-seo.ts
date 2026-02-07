import { useEffect } from 'react';
import { TenantConfig } from '@/types/tenant';

const updateMeta = (name: string, content: string, isProperty = false) => {
  const attr = isProperty ? 'property' : 'name';
  let el = document.querySelector(`meta[${attr}="${name}"]`) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, name);
    document.head.appendChild(el);
  }
  el.content = content;
};

export const useSEO = (seo: TenantConfig['seo']) => {
  useEffect(() => {
    document.title = seo.title;
    updateMeta('description', seo.description);
    updateMeta('keywords', seo.keywords);
    updateMeta('og:title', seo.ogTitle, true);
    updateMeta('og:description', seo.ogDescription, true);
    updateMeta('twitter:title', seo.ogTitle);
    updateMeta('twitter:description', seo.ogDescription);

    if (seo.canonical) {
      let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
      if (!link) {
        link = document.createElement('link');
        link.rel = 'canonical';
        document.head.appendChild(link);
      }
      link.href = seo.canonical;
    }
  }, [seo]);
};
