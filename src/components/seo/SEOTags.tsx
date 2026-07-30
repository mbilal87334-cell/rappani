import React, { useEffect } from 'react';

interface SEOTagsProps {
  title: string;
  description: string;
  image?: string;
  url?: string;
}

export const SEOTags: React.FC<SEOTagsProps> = ({ title, description, image, url }) => {
  useEffect(() => {
    document.title = title;

    const setMetaTag = (name: string, content: string, isProperty = false) => {
      const attribute = isProperty ? 'property' : 'name';
      let element = document.querySelector(`meta[${attribute}="${name}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attribute, name);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    setMetaTag('description', description);
    setMetaTag('og:title', title, true);
    setMetaTag('og:description', description, true);
    
    if (image) setMetaTag('og:image', image, true);
    if (url) setMetaTag('og:url', url, true);

  }, [title, description, image, url]);

  return null;
};
