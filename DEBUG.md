# Debugging — atelier jour, étape 06

## 1. Point d'arrêt côté front (navigateur)

1. `pnpm dev` puis ouvrez `/debug`.
2. Ouvrez les DevTools (F12) → onglet **Sources**.
3. Cliquez sur le bouton « Incrémenter ». L'exécution s'arrête sur la ligne
   `debugger;` de `modules/debug/debugger-demo.tsx`.
4. Dans le panneau de droite : inspectez **Scope** (`count`, `next`), la **Call
   Stack**, ajoutez des **Watch**, survolez les variables, éditez en live via la
   console (`next = 99`) puis _Resume_ (F8).

> Astuce : au lieu de `debugger;`, on peut cliquer dans la gouttière (numéro de
> ligne) dans l'onglet Sources pour poser/enlever un breakpoint sans toucher au
> code.

## 2. Point d'arrêt côté back (serveur Node)

Le rendu RSC / les Route Handlers / le proxy tournent dans **Node**, pas dans le
navigateur. On attache donc l'inspecteur Node.

```bash
pnpm dev:inspect          # = NODE_OPTIONS='--inspect' next dev
```

Puis, au choix :

- **Via chrome://inspect** : ouvrez `chrome://inspect`, cliquez _Configure_ et
  ajoutez la cible `localhost:<port>` (le port `--inspect` par défaut est
  `9229`, affiché dans la console au démarrage). La cible apparaît sous « Remote
  Target » → _inspect_.
- **Via l'URL directe** : ouvrez `http://localhost:9229/json/list`, copiez le
  champ `devtoolsFrontendUrl` et collez-le dans Chrome.

Ensuite, dans l'onglet **Sources** de cet inspecteur Node :

- posez un breakpoint (ou un `debugger;`) dans `app/(shop)/debug/page.tsx`
  (variable `renderedAt`), dans `proxy.ts`, ou dans un repository ;
- rechargez la page côté navigateur → le **serveur** s'arrête sur le breakpoint ;
- explorez `process.env`, les variables globales serveur, `globalThis`, la stack
  RSC. C'est le même protocole DevTools, mais branché sur le process Node.

> `--inspect-brk` (au lieu de `--inspect`) casse au tout premier ligne, pratique
> pour déboguer le démarrage.
