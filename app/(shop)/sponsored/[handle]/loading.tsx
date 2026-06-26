// Step 09 (Cache Components): the sponsored detail page does an uncached
// GraphQL fetch at the top level. A loading.tsx wraps the page in a Suspense
// boundary, so that dynamic fetch streams behind this skeleton instead of
// triggering a "dynamic work outside Suspense" build error.
export default function Loading() {
  return (
    <div className="flex animate-pulse flex-col gap-8">
      <div className="h-4 w-32 rounded bg-line" />
      <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
        <div className="aspect-square rounded-3xl bg-line" />
        <div className="space-y-4">
          <div className="h-6 w-24 rounded-full bg-line" />
          <div className="h-8 w-2/3 rounded bg-line" />
          <div className="h-6 w-1/3 rounded bg-line" />
          <div className="h-20 w-full rounded bg-line" />
        </div>
      </div>
    </div>
  );
}
