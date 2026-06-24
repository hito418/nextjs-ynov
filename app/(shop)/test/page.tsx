import Link from "next/link";

// Test playground for the file conventions in workshop step 07:
//  - this page sleeps 1.5s so `loading.tsx` is visible (streaming fallback)
//  - visiting /test?crash=1 throws, so `error.tsx` catches it
export default async function TestPage(props: PageProps<"/test">) {
  const { crash } = await props.searchParams;

  await new Promise((resolve) => setTimeout(resolve, 1500));

  if (crash === "1") {
    throw new Error("Boom 💥 — erreur de démonstration déclenchée par ?crash=1");
  }

  return (
    <div className="flex flex-col items-start gap-4">
      <h1 className="font-script text-4xl text-ink">Page de test</h1>
      <p className="text-muted">
        Cette page attend 1,5&nbsp;s avant de s&apos;afficher — le temps de voir{" "}
        <code className="rounded bg-paper px-1.5 py-0.5">loading.tsx</code>.
      </p>
      <Link
        href="/test?crash=1"
        className="rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-cream transition hover:bg-gold-dark"
      >
        Déclencher une erreur (error.tsx)
      </Link>
    </div>
  );
}
