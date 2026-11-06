"use client";

import Script from "next/script";
import { useEffect, useState } from "react";
import { captureSource, track, trackingAllowed } from "@/lib/track";
import { META_PIXEL_ID } from "@/lib/config";
import { CONSENT_EVENT } from "@/lib/consent";

const PIXEL_ID = META_PIXEL_ID;

export default function MetaPixel() {
  const [allowed, setAllowed] = useState(false);
  useEffect(() => {
    captureSource();
    const sync = () => setAllowed(trackingAllowed());
    sync();
    window.addEventListener(CONSENT_EVENT, sync);
    return () => window.removeEventListener(CONSENT_EVENT, sync);
  }, []);
  useEffect(() => {
    if (!allowed) return;
    if (!PIXEL_ID) return;
    // O PageView do browser é disparado no script abaixo; aqui espelhamos no servidor com o mesmo event_id.
    let tries = 0;
    const iv = setInterval(() => {
      const id = (window as unknown as { __dxPV?: string }).__dxPV;
      if (id || ++tries > 30) {
        clearInterval(iv);
        if (id) track("PageView", undefined, id, true);
      }
    }, 100);
    return () => clearInterval(iv);
  }, [allowed]);

  if (!PIXEL_ID || !allowed) return null;
  return (
    <Script id="meta-pixel" strategy="afterInteractive">
      {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
document,'script','https://connect.facebook.net/en_US/fbevents.js');
fbq('init','${PIXEL_ID}');
window.__dxPV='pageview-'+Date.now().toString(36)+Math.random().toString(36).slice(2,8);
fbq('track','PageView',{}, {eventID: window.__dxPV});`}
    </Script>
  );
}
