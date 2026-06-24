// Shown as the Suspense fallback while the test page's async work resolves.
export default function TestLoading() {
  return (
    <div className="flex items-center gap-3 text-muted">
      <span
        className="h-5 w-5 animate-spin rounded-full border-2 border-line border-t-gold-dark"
        aria-hidden
      />
      <span>Chargement de la page de test…</span>
    </div>
  );
}
