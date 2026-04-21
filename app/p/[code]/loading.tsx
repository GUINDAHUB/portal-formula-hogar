export default function PortalLoading() {
  return (
    <div className="app-shell px-4 py-16">
      <div className="mx-auto max-w-6xl space-y-8">
        <div className="h-12 w-64 animate-pulse rounded-xl bg-white/70" />
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="surface-card overflow-hidden">
              <div className="aspect-[16/9] animate-pulse bg-[#e8eed7]" />
              <div className="space-y-3 p-6">
                <div className="h-5 w-2/3 animate-pulse rounded bg-[#e8eed7]" />
                <div className="h-4 w-1/2 animate-pulse rounded bg-[#e8eed7]" />
                <div className="grid grid-cols-2 gap-3">
                  <div className="h-16 animate-pulse rounded-lg bg-[#f6f9ee]" />
                  <div className="h-16 animate-pulse rounded-lg bg-[#f6f9ee]" />
                  <div className="h-16 animate-pulse rounded-lg bg-[#f6f9ee]" />
                  <div className="h-16 animate-pulse rounded-lg bg-[#f6f9ee]" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
