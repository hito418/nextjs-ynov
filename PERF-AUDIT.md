# Audit performance — My Supa Store (conclusion atelier)

Next.js 16.2.9 (Turbopack) · React 19.2.4 · Cache Components activé.
Mesures faites sur un **build de production** (`next build` + `next start`),
Chromium headless, en local (donc **latence réseau ≈ 0** — les chiffres absolus
sont optimistes, le classement relatif reste valable).

Reproduire :

```bash
node_modules/.bin/next build && node_modules/.bin/next start   # serveur prod
node scripts/measure-vitals.mjs                                # Web Vitals
node_modules/.bin/next experimental-analyze                    # bundles
```

---

## 1. Observabilité — Web Vitals mesurés (étape 01)

Instrumentation : `modules/observability/web-vitals.tsx` (`useReportWebVitals`)
loggue chaque métrique en console **et** l'envoie en beacon à `/api/vitals`
(visible côté serveur). Le script `scripts/measure-vitals.mjs` lit en plus les
`PerformanceObserver` (LCP + élément, layout-shift + source, FCP, TTFB).

| Page | TTFB | FCP | **LCP** | CLS | Élément LCP |
|------|-----:|----:|--------:|----:|-------------|
| `/` (accueil) | 9 ms | 144 ms | **392 ms** | **0** | `img` carte produit (`miel-lavande.svg`) |
| `/products/cafe-aurora` | 14 ms | 156 ms | **472 ms** 🔴 | **0** | `img` **sponsorisé distant** (`ps5-standard.jpg`, via `next/image`) |
| `/env-demo` | 17 ms | 120 ms | **204 ms** | **0** | `p` (texte) |

### Le pire élément
Sur la fiche produit, le **LCP (472 ms) n'est pas l'image héro** (un SVG local
`priority`, qui peint instantanément) mais une **image du slot parallèle
`@sponsored`** : une jpg distante (`graphqlstore…/ps5-standard.jpg`) optimisée
par `next/image`. Comme ce slot est un *dynamic hole* streamé après le shell, sa
grande image raster arrive plus tard et devient l'élément le plus grand peint.

### Points forts
- **CLS = 0 partout.** Les skeletons dimensionnés (fiche produit, sponsorisés,
  nav/footer) et les images `fill` avec `sizes` évitent tout décalage. Le travail
  de PPR/skeletons des jours précédents porte ses fruits.
- **TTFB négligeable** grâce au prerender statique du shell (PPR).

### Reco
1. Donner `priority` (ou `fetchPriority="high"`) à la **première image
   sponsorisée** si elle est au-dessus de la ligne de flottaison, ou au contraire
   la sortir du chemin critique (lazy) pour qu'elle ne dispute pas le LCP.
2. Servir les images sponsorisées distantes en format moderne (déjà `w&q` via
   `next/image` → AVIF/WebP) et vérifier leurs dimensions intrinsèques.
3. Sous throttling réseau réel, refaire la mesure : viser LCP < 2500 ms.

---

## 2. Analyse des bundles (étape 04)

`next experimental-analyze` génère le rapport dans
`.next/diagnostics/analyze/` (treemap par route + modules). Tailles réelles des
chunks client :

| Chunk | Brut | Gzip | Contenu |
|-------|-----:|-----:|---------|
| `09npamjfljqap.js` | 222 KB | **69 KB** | `react-dom` client (`createRoot`) |
| `1td1ottlvrs9n.js` | 150 KB | **41 KB** | runtime client Next (router / RSC client) |
| `0cz1d0mv5g_q7.js` | 110 KB | **39 KB** | `react-server-dom-turbopack-client` + hooks |
| `3pq8119tmuxzz.js` | 65 KB | 14 KB | runtime / navigation |
| autres (17 chunks) | — | ~50 KB | composants client de l'app |
| **Total JS client** | **697 KB** | **≈ 214 KB gz** | |

### Ce qui est « gros »
Presque tout le poids est le **socle framework React 19 + Next 16** (≈ 150 KB gz
à eux trois). C'est un plancher incompressible, pas du code applicatif.

### Ce qui est déjà bon
- **Le code applicatif client est minuscule** (< 20 KB gz cumulés) : l'app est
  majoritairement en **Server Components**. Les seuls `"use client"` sont
  `AddToCartButton`, `CartSummaryPanel`, `LanguageSwitcher`, `ProductTabs`,
  `RefreshSponsoredButton`, `PrefetchLink`, les formulaires, `WebVitals`,
  `ServiceWorkerRegister`, `DebuggerDemo`.
- **Aucune lib lourde côté client** : `drizzle`, `kysely`, `better-sqlite3`,
  `zod`, le fetch GraphQL sponsorisé sont tous **server-only** (aucun n'apparaît
  dans les chunks).
- **Polices auto-hébergées** (`next/font`), **images produit en SVG** (quelques
  KB). Pas de gaspillage.

### Optimisations possibles
1. `WebVitals` + `ServiceWorkerRegister` sont dans le **layout racine** → chargés
   sur **toutes** les pages. Ils sont minuscules, mais on peut les regrouper /
   charger après interaction si besoin de grappiller.
2. `DebuggerDemo` n'est utile que sur `/debug` — il est déjà *route-scoped*, donc
   non embarqué ailleurs. ✅
3. Le socle framework ne se réduit pas ; le vrai levier reste **rester en RSC**
   (déjà le cas) et éviter d'ajouter des libs client.

---

## 3. Rendu & cache (contexte)

D'après `next build` : 26 routes, la plupart en **PPR** (`◐` shell statique +
trous dynamiques streamés). `/manifest.webmanifest` statique. `/api/*` dynamiques.
Les fiches produit sont prérendues (`generateStaticParams`) avec les sections
`@similar`/`@sponsored` streamées — d'où le LCP « sponsorisé » vu plus haut.

---

## 4. Conclusion

L'app est **déjà bien optimisée** : architecture RSC-first, CLS nul, JS client au
plancher framework, TTFB minime grâce au PPR. Les deux seuls axes concrets :

1. **Maîtriser le LCP de la fiche produit** — l'image sponsorisée distante est le
   maillon le plus lent (priorité/lazy + format moderne).
2. **Ne pas alourdir le client** — garder la discipline RSC ; chaque nouveau
   `"use client"` ou lib front pèse directement sur les 214 KB actuels.

Prochaine étape utile : refaire `scripts/measure-vitals.mjs` **avec throttling
réseau** (profil « Slow 4G ») pour des chiffres proches du terrain, et brancher
les beacons `/api/vitals` sur un vrai collecteur (RUM) en production.
