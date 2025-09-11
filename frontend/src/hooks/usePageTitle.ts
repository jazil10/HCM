import { useEffect } from 'react';

export function usePageTitle(title: string) {
  useEffect(() => {
    const previousTitle = document.title;
    document.title = title ? `${title} - HCM` : 'HCM - Human Capital Management';
    
    return () => {
      document.title = previousTitle;
    };
  }, [title]);
}
