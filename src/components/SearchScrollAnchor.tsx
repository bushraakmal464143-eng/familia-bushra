"use client";

import { useEffect } from "react";

export default function SearchScrollAnchor() {
  useEffect(() => {
    if (window.location.hash !== "#ofertas") return;
    const el = document.getElementById("ofertas");
    if (!el) return;
    const timer = window.setTimeout(() => {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
    return () => window.clearTimeout(timer);
  }, []);

  return null;
}
