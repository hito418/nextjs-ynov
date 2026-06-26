"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

// Step 07 — A/B variant "B" link behaviour. We turn OFF Link's automatic
// (viewport) prefetch and instead warm the route only when the user hovers,
// signalling intent. This is the minimal client island, so the cards that use
// it (ProductCard, SponsoredCard) can stay Server Components.
export function PrefetchLink({
  href,
  className,
  children,
}: {
  href: string;
  className?: string;
  children: React.ReactNode;
}) {
  const router = useRouter();

  return (
    <Link
      href={href}
      prefetch={false}
      className={className}
      onMouseEnter={() => router.prefetch(href)}
    >
      {children}
    </Link>
  );
}
