"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ev, evOnce, flush } from "@/lib/analytics";
import { CONSENT_EVENT, getConsent } from "@/lib/consent";
import { getSource } from "@/lib/track";

const CLARITY_ID = process.env.NEXT_PUBLIC_CLARITY_ID || "w054c2dshv";

/** Nome legível de um clique: data-ev, aria-label ou o texto do botão/link */
function labelOf(el: HTMLElement) {
  const raw = el.dataset.ev || el.getAttribute("aria-label") || el.textContent || "";
  return raw.replace(/\s+/g, " ").trim().slice(0, 60);
}

export default function Analytics() {
  const path = usePathname();
  const [clarity, setClarity] = useState(false);

  // Clarity (gravações de sessão e mapas de calor): só com consentimento de cookies
  useEffect(() => {
    const sync = () => setClarity(getConsent() === "granted" && !location.pathname.startsWith("/leads") && !/^(localhost|127\.)/.test(location.hostname));
    sync();
    window.addEventListener(CONSENT_EVENT, sync);
    return () => window.removeEventListener(CONSENT_EVENT, sync);
  }, []);

  useEffect(() => {
    if (!path || path.startsWith("/leads")) return;
    const src = getSource();
    ev("view", path, undefined, {
      device: window.matchMedia("(max-width: 1023px)").matches ? "telemóvel" : "computador",
      source: src.utm_source || (src.fbclid ? "facebook" : src.referrer ? new URL(src.referrer).hostname.replace(/^www\./, "") : "direto"),
      campaign: src.utm_campaign || "",
    });
    flush(); // a visita conta logo, mesmo que a pessoa saia em segundos

    // Tempo visível na página e scroll máximo
    let visibleSince = document.visibilityState === "visible" ? Date.now() : 0;
    let active = 0;
    let maxScroll = 0;
    const onVis = () => {
      if (document.visibilityState === "visible") visibleSince = Date.now();
      else if (visibleSince) {
        active += Date.now() - visibleSince;
        visibleSince = 0;
      }
    };
    const onScroll = () => {
      const h = document.documentElement.scrollHeight - innerHeight;
      if (h > 0) maxScroll = Math.max(maxScroll, Math.round((scrollY / h) * 100));
    };
    const report = () => {
      if (visibleSince) {
        active += Date.now() - visibleSince;
        visibleSince = Date.now();
      }
      ev("time", path, Math.round(active / 1000), undefined, path);
      ev("scroll", path, Math.min(100, maxScroll), undefined, path);
      active = 0;
      flush(true);
    };
    const onHide = () => document.visibilityState === "hidden" && report();

    // Cliques em botões e links
    const onClick = (e: MouseEvent) => {
      const el = (e.target as HTMLElement | null)?.closest<HTMLElement>("a,button,summary,[data-ev]");
      if (!el) return;
      const name = labelOf(el);
      if (name) ev("click", name);
    };

    // Secções vistas (landing e capítulos do guia)
    const io = new IntersectionObserver(
      (entries) => entries.forEach((en) => en.isIntersecting && evOnce(`${path}#${en.target.id}`, "section", en.target.id)),
      { threshold: 0.3 },
    );
    const t = setTimeout(() => document.querySelectorAll("section[id]").forEach((s) => io.observe(s)), 600);

    const iv = setInterval(() => flush(), 8000);
    window.addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("visibilitychange", onVis);
    document.addEventListener("visibilitychange", onHide);
    window.addEventListener("pagehide", report);
    document.addEventListener("click", onClick, true);
    return () => {
      report();
      clearTimeout(t);
      clearInterval(iv);
      io.disconnect();
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("visibilitychange", onVis);
      document.removeEventListener("visibilitychange", onHide);
      window.removeEventListener("pagehide", report);
      document.removeEventListener("click", onClick, true);
    };
  }, [path]);

  if (!clarity) return null;
  return (
    <Script id="ms-clarity" strategy="afterInteractive">
      {`(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);})(window,document,"clarity","script","${CLARITY_ID}");`}
    </Script>
  );
}
