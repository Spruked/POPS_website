import { useLayoutEffect } from "react";
import {useLocation} from 'react-router-dom';

const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID;

declare global {
  interface Window {
    dataLayer: unknown[][];
    gtag: (...args: unknown[]) => void;
  }
}

export default function Analytics() {
  const location=useLocation();
  useLayoutEffect(() => {
    if(!GA_MEASUREMENT_ID)return;
    const privatePage=/^\/(?:account|cart|checkout)(?:\/|$)/.test(location.pathname);
    (window as unknown as Record<string,unknown>)[`ga-disable-${GA_MEASUREMENT_ID}`]=privatePage;
    if(privatePage)return;
    if(document.querySelector(`[src*="${GA_MEASUREMENT_ID}"]`)){
      window.gtag?.('event','page_view',{page_location:window.location.origin+location.pathname,page_path:location.pathname});return;
    }

    const script = document.createElement("script");
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
    document.head.appendChild(script);

    window.dataLayer = window.dataLayer || [];
    window.gtag = function gtag(...args: unknown[]) {
      window.dataLayer.push(args);
    };
    window.gtag("js", new Date());
    window.gtag("config", GA_MEASUREMENT_ID,{send_page_view:false,allow_google_signals:false,allow_ad_personalization_signals:false});
    window.gtag('event','page_view',{page_location:window.location.origin+location.pathname,page_path:location.pathname});
  }, [location.pathname]);

  return null;
}
