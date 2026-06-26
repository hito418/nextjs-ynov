// Independent loading state for the @sponsored slot.
export default function SponsoredLoading() {
  return (
    <section className="animate-pulse">
      <div className="mb-5 h-8 w-60 rounded bg-line" />
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="rounded-2xl border border-line bg-paper">
            <div className="aspect-square rounded-t-2xl bg-line" />
            <div className="space-y-2 p-4">
              <div className="h-4 w-2/3 rounded bg-line" />
              <div className="h-4 w-1/3 rounded bg-line" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
