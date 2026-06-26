// Independent loading state for the @similar slot. Shown while the slot streams
// in, sized to match the final grid to avoid layout shift.
export default function SimilarLoading() {
  return (
    <section className="animate-pulse">
      <div className="mb-5 h-8 w-56 rounded bg-line" />
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="rounded-2xl border border-line bg-paper">
            <div className="aspect-square rounded-t-2xl bg-line" />
            <div className="space-y-2 p-4">
              <div className="h-3 w-1/3 rounded bg-line" />
              <div className="h-4 w-2/3 rounded bg-line" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
