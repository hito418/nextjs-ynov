import Link from "next/link";
import { getCurrentUser } from "./auth";
import { isStaff } from "./domain/user";
import { signOutAction } from "@/app/actions/auth";

// Per-user header chrome as a Server Component. It reads the session itself
// (rather than receiving it from the layout) so that, come step 09 (PPR), the
// layout can stay a static shell and just wrap this in <Suspense> — the cookie
// read becomes a self-contained dynamic hole. For steps 04–08 there's no
// boundary yet, so this read keeps the route dynamic.
export async function AccountNav() {
  const user = await getCurrentUser();

  if (!user) {
    return (
      <Link href="/login" className="text-ink/80 transition hover:text-ink">
        Se connecter
      </Link>
    );
  }

  const firstName = user.name.split(" ")[0];

  return (
    <>
      {isStaff(user.role) && (
        <Link
          href="/admin/products"
          className="text-muted transition hover:text-ink"
        >
          Admin
        </Link>
      )}
      <span className="flex items-center gap-3">
        <span className="text-ink/80">Bonjour {firstName}</span>
        <form action={signOutAction}>
          <button
            type="submit"
            className="text-muted underline-offset-2 transition hover:text-ink hover:underline"
          >
            Déconnexion
          </button>
        </form>
      </span>
    </>
  );
}
