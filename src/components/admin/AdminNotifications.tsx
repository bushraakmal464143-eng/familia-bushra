"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

type NotificationsPayload = {
  pendingCampings: unknown[];
  pendingOffers: unknown[];
  total: number;
  campingCount: number;
  offerCount: number;
};

const AUTO_OPEN_KEY = "admin-notif-auto-opened";

export default function AdminNotifications() {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [total, setTotal] = useState(0);
  const [campingCount, setCampingCount] = useState(0);
  const [offerCount, setOfferCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const panelRef = useRef<HTMLDivElement>(null);

  const detailsHref =
    campingCount > 0
      ? "/admin/campings?status=pending"
      : offerCount > 0
        ? "/admin/offers?filter=pending"
        : "/admin/campings?status=pending";

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/notifications", {
        credentials: "include",
        cache: "no-store",
      });
      if (!res.ok) {
        setTotal(0);
        setCampingCount(0);
        setOfferCount(0);
        return null;
      }
      const json = (await res.json()) as NotificationsPayload;
      const camps = json.pendingCampings?.length ?? 0;
      const offers = json.pendingOffers?.length ?? 0;
      setCampingCount(camps);
      setOfferCount(offers);
      setTotal(json.total ?? camps + offers);
      return { camps, offers, total: json.total ?? camps + offers };
    } catch {
      setTotal(0);
      setCampingCount(0);
      setOfferCount(0);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const counts = await load();
      if (cancelled || !counts || counts.total === 0) return;
      if (typeof window === "undefined") return;
      if (sessionStorage.getItem(AUTO_OPEN_KEY) === "1") return;
      sessionStorage.setItem(AUTO_OPEN_KEY, "1");
      setOpen(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [load]);

  useEffect(() => {
    void load();
  }, [pathname, load]);

  useEffect(() => {
    if (!open) return;

    function onPointerDown(e: MouseEvent) {
      if (!panelRef.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  function goToDetails() {
    setOpen(false);
    router.push(detailsHref);
  }

  return (
    <div className="relative" ref={panelRef}>
      <button
        type="button"
        onClick={() => {
          if (total > 0) {
            goToDetails();
            return;
          }
          setOpen((v) => !v);
        }}
        className="relative inline-flex items-center justify-center rounded-md border border-gray-200 p-2 text-gray-700 transition hover:bg-gray-50"
        aria-label={
          total > 0
            ? `${total} pending requests — open details`
            : "Pending requests"
        }
        title={total > 0 ? `${total} pending requests` : "No pending requests"}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          className="h-5 w-5"
          aria-hidden
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
          />
        </svg>
        {!loading && total > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-accent px-1 text-[10px] font-bold text-white">
            {total > 99 ? "99+" : total}
          </span>
        )}
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Pending requests"
          className="absolute right-0 z-50 mt-2 w-64 overflow-hidden rounded-xl border border-gray-200 bg-white p-4 text-center shadow-lg"
        >
          {loading ? (
            <p className="text-sm text-gray-500">Loading…</p>
          ) : total > 0 ? (
            <>
              <p className="text-base font-semibold text-gray-900">
                {total} pending request{total === 1 ? "" : "s"}
              </p>
              <p className="mt-1 text-xs text-gray-500">
                Click to review who wants to join and approve their content.
              </p>
              <button
                type="button"
                onClick={goToDetails}
                className="mt-4 w-full rounded-lg bg-brand-accent px-4 py-2 text-sm font-semibold text-white hover:bg-orange-700"
              >
                View requests
              </button>
              {campingCount > 0 && offerCount > 0 && (
                <Link
                  href="/admin/offers?filter=pending"
                  onClick={() => setOpen(false)}
                  className="mt-2 block text-xs font-medium text-brand-accent hover:underline"
                >
                  Also {offerCount} pending offer
                  {offerCount === 1 ? "" : "s"} →
                </Link>
              )}
            </>
          ) : (
            <p className="text-sm text-gray-500">No pending requests</p>
          )}
        </div>
      )}
    </div>
  );
}
