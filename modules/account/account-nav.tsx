import Link from "next/link";
import { getCurrentUser } from "./auth";
import { isStaff, trigram } from "./domain/user";
import { signOutAction } from "@/app/actions/auth";
import { getTranslations } from "@/modules/i18n/dictionary";

// Per-user header chrome as a Server Component. It reads the session itself
// (rather than receiving it from the layout) so that, come step 09 (PPR), the
// layout can stay a static shell and just wrap this in <Suspense> — the cookie
// read becomes a self-contained dynamic hole. For steps 04–08 there's no
// boundary yet, so this read keeps the route dynamic.
export async function AccountNav() {
  const [user, { dict }] = await Promise.all([
    getCurrentUser(),
    getTranslations(),
  ]);

  if (!user) {
    return (
      <Link href="/login" className="text-ink/80 transition hover:text-ink">
        {dict.nav.login}
      </Link>
    );
  }

  return (
    <>
      {isStaff(user.role) && (
        <Link
          href="/admin/products"
          className="text-muted transition hover:text-ink"
        >
          {dict.nav.admin}
        </Link>
      )}
      <span className="flex items-center gap-3">
        <span
          className="grid h-8 w-8 place-items-center rounded-full bg-ink text-xs font-semibold text-cream"
          title={user.name}
          aria-label={user.name}
        >
          {trigram(user.name)}
        </span>
        <form action={signOutAction}>
          <button
            type="submit"
            className="text-muted underline-offset-2 transition hover:text-ink hover:underline"
          >
            {dict.nav.logout}
          </button>
        </form>
      </span>
    </>
  );
}
