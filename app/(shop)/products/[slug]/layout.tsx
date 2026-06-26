// Parallel Routes (workshop step 08, restored). This layout sits at the
// product segment and receives two named slots besides `children`: @similar
// and @sponsored (the `@folder` convention). Each slot loads independently and
// has its own loading.tsx, so the three regions stream in parallel with their
// own loading states.
//
// With cacheComponents enabled, the `children` slot (the product hero/info)
// prerenders into the static shell, while @similar and @sponsored are dynamic
// holes — each wrapped in its own loading.tsx Suspense boundary.
export default function ProductLayout({
  children,
  similar,
  sponsored,
}: {
  children: React.ReactNode;
  similar: React.ReactNode;
  sponsored: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-12">
      {children}
      {similar}
      {sponsored}
    </div>
  );
}
