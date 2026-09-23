export default function CuentaLoading() {
  return (
    <div aria-busy>
      <div className="mb-8 space-y-2">
        <div className="skeleton-shimmer h-9 w-56 max-w-full rounded-lg" />
        <div className="skeleton-shimmer h-4 w-72 max-w-full rounded-md" />
      </div>

      <div className="grid gap-8 lg:grid-cols-[320px_minmax(0,1fr)]">
        <aside className="space-y-4">
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="flex flex-col items-center gap-3 bg-brand-cream px-5 py-8">
              <div className="skeleton-shimmer h-20 w-20 rounded-full" />
              <div className="skeleton-shimmer h-5 w-36 rounded-md" />
              <div className="skeleton-shimmer h-3.5 w-44 rounded-md" />
            </div>
            <div className="space-y-4 px-5 py-5">
              <div className="skeleton-shimmer h-4 w-28 rounded-md" />
              <div className="skeleton-shimmer h-10 w-full rounded-lg" />
              <div className="skeleton-shimmer h-4 w-24 rounded-md" />
              <div className="skeleton-shimmer h-10 w-full rounded-lg" />
              <div className="skeleton-shimmer h-10 w-full rounded-xl" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="skeleton-shimmer h-[4.5rem] rounded-xl"
              />
            ))}
          </div>
        </aside>

        <section className="min-w-0 space-y-8">
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-100 px-5 py-4 space-y-2">
              <div className="skeleton-shimmer h-6 w-40 rounded-md" />
              <div className="skeleton-shimmer h-3.5 w-64 max-w-full rounded-md" />
            </div>
            <div className="grid gap-0 lg:grid-cols-[minmax(0,1fr)_260px]">
              <div className="space-y-3 p-5">
                <div className="flex gap-4">
                  <div className="skeleton-shimmer h-4 w-28 rounded-md" />
                  <div className="skeleton-shimmer h-4 w-28 rounded-md" />
                </div>
                <div className="skeleton-shimmer h-64 w-full rounded-xl" />
              </div>
              <div className="border-t border-gray-100 bg-gray-50/60 p-5 lg:border-l lg:border-t-0">
                <div className="skeleton-shimmer h-4 w-full rounded-md" />
                <div className="skeleton-shimmer mt-3 h-4 w-3/4 rounded-md" />
                <div className="skeleton-shimmer mt-6 h-24 w-full rounded-lg" />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="skeleton-shimmer h-6 w-44 rounded-md" />
            {Array.from({ length: 2 }).map((_, i) => (
              <div
                key={i}
                className="skeleton-shimmer h-40 w-full rounded-2xl"
              />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
