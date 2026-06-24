// A template re-mounts on every navigation (unlike a layout, which persists).
// Re-mounting re-triggers the CSS `fade-in` animation, so each front-office
// page gently fades in. See workshop step 07.
export default function ShopTemplate({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="animate-fade-in">{children}</div>;
}
