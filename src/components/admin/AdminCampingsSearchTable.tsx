"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { CampingStatus } from "@/lib/types";

export type AdminCampingRow = {
  id: string;
  name: string;
  email: string;
  location: string;
  region: string;
  status: CampingStatus;
  profileComplete: boolean;
  offerCount: number;
  activeOffers: number;
  paidSales: number;
  revenue: number;
};

type SortKey = "name" | "status" | "offers" | "sales" | "revenue";

type AdminCampingsSearchTableProps = {
  campings: AdminCampingRow[];
  showEmail?: boolean;
  emptyLabel?: string;
};

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "name", label: "Name A–Z" },
  { value: "status", label: "Status" },
  { value: "offers", label: "Offers" },
  { value: "sales", label: "Sales" },
  { value: "revenue", label: "Revenue" },
];

const statusOrder: Record<string, number> = {
  pending: 0,
  active: 1,
  suspended: 2,
};

export default function AdminCampingsSearchTable({
  campings,
  showEmail = false,
  emptyLabel = "No campsites match your search.",
}: AdminCampingsSearchTableProps) {
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortAsc, setSortAsc] = useState(true);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = !q
      ? [...campings]
      : campings.filter((c) => {
          const haystack = [
            c.name,
            c.location,
            c.region,
            c.email,
            c.status,
            c.id,
          ]
            .join(" ")
            .toLowerCase();
          return haystack.includes(q);
        });

    filtered.sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case "name":
          cmp = a.name.localeCompare(b.name);
          break;
        case "status":
          cmp =
            (statusOrder[a.status] ?? 99) - (statusOrder[b.status] ?? 99) ||
            a.name.localeCompare(b.name);
          break;
        case "offers":
          cmp = a.offerCount - b.offerCount;
          break;
        case "sales":
          cmp = a.paidSales - b.paidSales;
          break;
        case "revenue":
          cmp = a.revenue - b.revenue;
          break;
      }
      return sortAsc ? cmp : -cmp;
    });

    return filtered;
  }, [campings, query, sortKey, sortAsc]);

  function toggleSortDirection() {
    setSortAsc((v) => !v);
  }

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="flex flex-col gap-3 border-b border-gray-100 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row sm:items-center">
          <label htmlFor="camping-search" className="sr-only">
            Search campsites
          </label>
          <div className="relative min-w-0 flex-1 sm:max-w-sm">
            <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-gray-400">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="h-4 w-4"
                aria-hidden
              >
                <path
                  fillRule="evenodd"
                  d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z"
                  clipRule="evenodd"
                />
              </svg>
            </span>
            <input
              id="camping-search"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search campsites…"
              className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2 pl-9 pr-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-brand-forest focus:bg-white focus:outline-none focus:ring-1 focus:ring-brand-forest"
            />
          </div>

          <div className="flex items-center gap-2">
            <label htmlFor="camping-sort" className="sr-only">
              Sort campsites
            </label>
            <div className="relative">
              <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-brand-forest">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="h-4 w-4"
                  aria-hidden
                >
                  <path d="M2.25 6.75a.75.75 0 01.75-.75h14a.75.75 0 010 1.5h-14a.75.75 0 01-.75-.75zM5 10a.75.75 0 01.75-.75h8.5a.75.75 0 010 1.5h-8.5A.75.75 0 015 10zm3 3.25a.75.75 0 01.75-.75h2.5a.75.75 0 010 1.5h-2.5a.75.75 0 01-.75-.75z" />
                </svg>
              </span>
              <select
                id="camping-sort"
                value={sortKey}
                onChange={(e) => setSortKey(e.target.value as SortKey)}
                className="appearance-none rounded-lg border border-brand-forest/20 bg-white py-2 pl-9 pr-9 text-sm font-medium text-brand-forest shadow-sm transition hover:border-brand-forest/40 hover:bg-emerald-50/40 focus:border-brand-forest focus:outline-none focus:ring-2 focus:ring-brand-forest/20"
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    Sort: {opt.label}
                  </option>
                ))}
              </select>
              <span className="pointer-events-none absolute inset-y-0 right-2.5 flex items-center text-brand-forest/70">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="h-4 w-4"
                  aria-hidden
                >
                  <path
                    fillRule="evenodd"
                    d="M5.22 8.22a.75.75 0 011.06 0L10 11.94l3.72-3.72a.75.75 0 111.06 1.06l-4.25 4.25a.75.75 0 01-1.06 0L5.22 9.28a.75.75 0 010-1.06z"
                    clipRule="evenodd"
                  />
                </svg>
              </span>
            </div>
            <button
              type="button"
              onClick={toggleSortDirection}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold shadow-sm transition ${
                sortAsc
                  ? "bg-brand-forest text-white hover:bg-brand-forest/90"
                  : "bg-brand-accent text-white hover:bg-orange-700"
              }`}
              aria-label={sortAsc ? "Sort ascending" : "Sort descending"}
              title={sortAsc ? "Ascending" : "Descending"}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="h-4 w-4"
                aria-hidden
              >
                {sortAsc ? (
                  <path
                    fillRule="evenodd"
                    d="M10 3a.75.75 0 01.75.75v10.69l2.72-2.72a.75.75 0 111.06 1.06l-4 4a.75.75 0 01-1.06 0l-4-4a.75.75 0 111.06-1.06l2.72 2.72V3.75A.75.75 0 0110 3z"
                    clipRule="evenodd"
                  />
                ) : (
                  <path
                    fillRule="evenodd"
                    d="M10 17a.75.75 0 01-.75-.75V5.56L6.53 8.28a.75.75 0 01-1.06-1.06l4-4a.75.75 0 011.06 0l4 4a.75.75 0 11-1.06 1.06l-2.72-2.72v10.69A.75.75 0 0110 17z"
                    clipRule="evenodd"
                  />
                )}
              </svg>
              {sortAsc ? "A→Z" : "Z→A"}
            </button>
          </div>
        </div>

        <p className="shrink-0 text-xs text-gray-500">
          {rows.length}
          {query.trim() ? ` of ${campings.length}` : ""} campsite
          {rows.length === 1 ? "" : "s"}
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead>
            <tr className="border-b border-gray-100 text-xs font-medium uppercase tracking-wide text-gray-400">
              <th className="px-4 py-3">Camping</th>
              {showEmail && <th className="px-4 py-3">Email</th>}
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Offers</th>
              <th className="px-4 py-3">Sales</th>
              <th className="px-4 py-3">Income</th>
              {showEmail && <th className="px-4 py-3" />}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {rows.map((c) => (
              <tr key={c.id} className="transition hover:bg-gray-50/70">
                <td className="px-4 py-3">
                  <Link
                    href={`/admin/campings/${c.id}`}
                    className="font-medium text-brand-forest hover:underline"
                  >
                    {c.name}
                  </Link>
                  <p className="mt-0.5 text-xs text-gray-500">
                    {[c.location, c.region].filter(Boolean).join(" · ")}
                  </p>
                </td>
                {showEmail && (
                  <td className="px-4 py-3 text-gray-600">{c.email}</td>
                )}
                <td className="px-4 py-3">
                  <StatusBadge status={c.status} />
                  {!c.profileComplete && (
                    <p className="mt-1 text-[11px] text-amber-700">
                      Incomplete profile
                    </p>
                  )}
                </td>
                <td className="px-4 py-3 tabular-nums text-gray-700">
                  {c.activeOffers}/{c.offerCount}
                </td>
                <td className="px-4 py-3 tabular-nums font-medium text-gray-900">
                  {c.paidSales}
                </td>
                <td className="px-4 py-3 tabular-nums text-gray-700">
                  {c.revenue} €
                </td>
                {showEmail && (
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/admin/campings/${c.id}`}
                      className="text-sm font-medium text-brand-accent hover:underline"
                    >
                      Details →
                    </Link>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {rows.length === 0 && (
        <p className="border-t border-gray-100 px-4 py-10 text-center text-sm text-gray-500">
          {emptyLabel}
        </p>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    active: "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/15",
    pending: "bg-orange-50 text-brand-accent ring-1 ring-inset ring-orange-600/15",
    suspended: "bg-gray-50 text-gray-600 ring-1 ring-inset ring-gray-500/15",
  };
  const labels: Record<string, string> = {
    active: "Active",
    pending: "Pending",
    suspended: "Suspended",
  };
  return (
    <span
      className={`inline-flex rounded-md px-2 py-0.5 text-xs font-medium ${styles[status] ?? "bg-gray-50 text-gray-600"}`}
    >
      {labels[status] ?? status}
    </span>
  );
}
