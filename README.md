# My Supa Store — atelier Next.js

Boutique e-commerce de démonstration (Next.js 16 App Router, React 19, Tailwind v4,
SQLite via Drizzle Kit pour les migrations + Kysely pour les requêtes). Construite
étape par étape pour l'atelier « les fondations d'un site e-commerce ».

## Démarrage

```bash
pnpm install        # installe les deps
pnpm db:migrate     # applique les migrations Drizzle → crée dev.db
pnpm db:seed        # remplit le catalogue depuis modules/catalog/data/products.json
pnpm dev            # http://localhost:3000
```

Scripts utiles : `pnpm db:generate` (génère une migration SQL depuis `db/schema.ts`),
`pnpm db:push` (applique le schéma sans fichier de migration), `pnpm db:studio`
(Drizzle Studio).

## Structure

```
app/
  layout.tsx                 Root layout : police locale (Dancing Script), métadonnées
  not-found.tsx              404 personnalisée
  login/                     Connexion (hors gate) : page RSC + form client (useActionState)
  actions/auth.ts            Server Actions signIn / signOut
  actions/products.ts        Server Action updateProductAction (staff-only)
  actions/cart.ts            Server Actions panier (add / remove / merge)
  (shop)/                    Route group front-office (URL sans préfixe)
    layout.tsx               Header (nav + panier) + footer, <CartProvider>
    template.tsx             Fade-in à chaque navigation
    page.tsx                 Accueil : Coups de cœur + tous les produits (RSC)
    products/[slug]/page.tsx Fiche produit (RSC, PageProps, next/image, onglets via ?tab)
    test/                    page + loading.tsx + error.tsx (démo des conventions)
  (admin)/                   Route group back-office (UI différente)
    layout.tsx               Sidebar + gate auth (getCurrentUser → redirect /login)
    admin/products/page.tsx  Liste de tous les produits (RSC) + lien Éditer
    admin/products/[id]/edit Édition produit + specs (form client + Server Action)
    admin/users/page.tsx     Liste des utilisateurs (RSC)

modules/
  catalog/                   Domaine catalogue (DDD)
    domain/product.ts        Types métier + formatPrice
    data/products.json       Données mock = source du seed
    repository.ts            Requêtes Kysely → mappées vers le type métier
    components/              ProductCard (badge ★), ProductTabs (server components)
  account/                   Domaine comptes (DDD)
    domain/user.ts           Type User + roleLabel
    data/users.json          Utilisateurs seed (mdp pour admin/manager)
    repository.ts            getAllUsers / getUserByEmail (Kysely)
    auth.ts                  Sessions : createSession / getCurrentUser / destroySession
  cart/                      Panier
    types.ts                 Types partagés (client + serveur)
    cart-context.tsx         State client : localStorage (invité) / DB (connecté) + merge
    repository.ts            Panier en base (Kysely) : getCart / addItem / removeItem / mergeItems
    cart-summary.tsx, add-to-cart-button.tsx

db/
  schema.ts                  Schéma Drizzle (products, specifications, users, sessions)
  types.ts                   Interface Kysely (colonnes SQLite brutes)
  seed.ts                    Seed (Kysely) depuis les .json
drizzle/                     Migrations SQL générées par drizzle-kit
lib/db.ts                    Singleton Kysely (SqliteDialect + better-sqlite3)
lib/password.ts              Hash/verify scrypt (Node crypto, sans dépendance)
drizzle.config.ts            Config drizzle-kit (dialect sqlite, dev.db)
```

## Authentification

La section `/admin` est protégée par une auth session maison (pas de lib externe) :
mot de passe haché avec `scrypt`, session en base (`sessions`) + cookie httpOnly.
Le gate est dans `app/(admin)/layout.tsx` (RSC) ; le login utilise des Server Actions.

Tout le monde peut se connecter depuis le header de la boutique. Le rôle décide
de la suite : les **staff** (admin/manager) atterrissent sur `/admin`, les
**clients** sur la boutique (et sont bloqués sur `/admin`).

Comptes de démo (mot de passe `supastore`) :
- Staff : `camille@supastore.test` (admin), `noah@supastore.test` (manager)
- Client : `lea@example.com`, `marco@example.com`, `yasmine@example.com`

## Panier

- **Invité** : panier en `localStorage` (survit au rechargement, propre au navigateur).
- **Connecté** : panier en base (table `cart_items`), donc conservé entre sessions
  et appareils, via des Server Actions (`app/actions/cart.ts`).
- **À la connexion**, le panier invité est fusionné dans le panier en base puis le
  `localStorage` est vidé. La couche serveur (`lib/db.ts`) reste la source de vérité.

## Notes sur cette version

- **Migrations vs requêtes** : Drizzle Kit gère le schéma et les migrations
  (`db/schema.ts` → `drizzle/`), Kysely exécute les requêtes au runtime
  (`lib/db.ts`), les deux partageant le driver `better-sqlite3`. Les colonnes
  SQLite sont en `snake_case` et les booléens stockés en `0 | 1`.
- **`params` / `searchParams` sont des `Promise`** : il faut les `await`.
- Les types `PageProps<'/route'>` / `LayoutProps<'/route'>` sont des helpers **globaux**
  (générés par `next typegen`, pas d'import).
- `error.tsx` reçoit `unstable_retry` (en plus de `reset`).
- **Server Actions** (`'use server'`) pour le login/logout ; `cookies()` est **async**
  (`await cookies()`) ; `getCurrentUser()` est mis en cache par requête via `cache()`.
