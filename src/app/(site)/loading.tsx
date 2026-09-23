function OfferCardSkeleton({ featured = false }: { featured?: boolean }) {
  return (
    <div
      className={`overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm ${
        featured ? "lg:flex lg:min-h-[280px]" : ""
      }`}
    >
      <div
        className={`skeleton-shimmer shrink-0 ${
          featured
            ? "aspect-[16/10] min-h-[200px] lg:aspect-auto lg:min-h-[280px] lg:w-[42%]"
            : "aspect-[16/10]"
        }`}
      />
      <div className="flex flex-1 flex-col gap-3 p-4 sm:p-5">
        <div className="skeleton-shimmer h-5 w-4/5 max-w-xs rounded-md" />
        <div className="skeleton-shimmer h-4 w-2/5 max-w-[10rem] rounded-md" />
        <div className="mt-1 space-y-2">
          <div className="skeleton-shimmer h-3.5 w-full rounded-md" />
          <div className="skeleton-shimmer h-3.5 w-5/6 rounded-md" />
          <div className="skeleton-shimmer h-3.5 w-3/4 rounded-md" />
        </div>
        <div className="mt-auto flex items-end justify-between gap-4 border-t border-gray-100 pt-4">
          <div className="skeleton-shimmer h-4 w-24 rounded-md" />
          <div className="skeleton-shimmer h-16 w-28 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

export default function Loading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8" aria-busy>
      <div className="mb-6 space-y-2">
        <div className="skeleton-shimmer h-8 w-72 max-w-full rounded-lg" />
        <div className="skeleton-shimmer h-4 w-48 rounded-md" />
      </div>
      <div className="mb-4 flex flex-wrap gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="skeleton-shimmer h-9 w-24 rounded-full" />
        ))}
      </div>
      <div className="space-y-6">
        <OfferCardSkeleton featured />
        <div className="grid gap-6 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <OfferCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
