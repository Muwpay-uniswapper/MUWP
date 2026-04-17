# Migration MUWP → monorepo Turborepo + Bun

## Contexte

Tu migres le repo MUWP d'une structure "Next.js à la racine + workspaces mélangés" vers un **monorepo Turborepo standard** avec **Bun comme unique package manager**.

**Versions cibles :**
- Bun `1.3.10` (épinglé via `packageManager`)
- Next.js `16` (déjà upgradé côté app)
- Turborepo `latest` (v2.x)
- Lockfile texte `bun.lock` (format natif depuis bun 1.2)

**Stack existante à préserver :** Next.js App Router, viem/wagmi, RainbowKit, Foundry (Solidity + submodules forge-std/openzeppelin), Cloudflare Worker (wrangler), VitePress, Playwright e2e, Inngest, SST, Vercel KV, SDK `@muwp/sdk` (tsup + vitest + biome).

## Structure cible finale

```
muwp/
├── apps/
│   ├── web/                      # Next.js 16 (ex-racine)
│   │   ├── app/
│   │   ├── components/
│   │   ├── lib/                  # ex lib/core, lib/allbridge, lib/hashport,
│   │   │                         #    lib/layerzero, lib/inngest, lib/kv, lib/li.fi
│   │   ├── public/
│   │   ├── e2e/                  # ex tests/ Playwright
│   │   ├── next.config.js
│   │   ├── playwright.config.ts
│   │   ├── tailwind.config.js
│   │   ├── postcss.config.js
│   │   ├── eslint.config.mjs
│   │   ├── tsconfig.json
│   │   ├── components.json
│   │   ├── next-env.d.ts
│   │   ├── sst-env.d.ts
│   │   ├── certificates/
│   │   └── package.json
│   └── docs/                     # VitePress (ex-docs/)
├── packages/
│   ├── sdk/                      # @muwp/sdk (ex-sdk/)
│   ├── kv/                       # Cloudflare Worker (ex-kv/)
│   └── lifi-client/              # ex lib/li.fi-ts (OpenAPI client vendored)
├── contracts/                    # Foundry — HORS workspaces npm
│   ├── src/MUWPTransfer.sol
│   ├── script/
│   ├── test/
│   ├── lib/forge-std/            # submodule (path à màj)
│   ├── lib/openzeppelin-contracts/ # submodule (path à màj)
│   ├── foundry.toml
│   ├── remappings.txt
│   └── deploy.sh
├── .github/
├── turbo.json
├── package.json                  # root, scripts turbo only, packageManager bun
├── bun.lock                      # lockfile texte unique
├── sst.config.ts                 # reste racine (SST gère l'ensemble)
├── vercel.json
├── README.md
└── CLAUDE.md
```

---

## Règles strictes — à respecter pendant toute la migration

1. **Utilise `git mv`** pour tous les déplacements de fichiers/dossiers (préserver `git blame`). Jamais `mv` seul suivi de `git add`.
2. **Commits atomiques par phase** — un commit par phase numérotée ci-dessous, message préfixé `chore(monorepo): <phase>`. Ne regroupe pas.
3. **Ne skip AUCUN hook git** (`--no-verify` interdit).
4. **Lance les vérifications à chaque fin de phase** — `bun install`, `bun run typecheck`, `bun run lint`, `forge build`, `forge test` — et corrige avant de passer à la phase suivante.
5. **N'inclus PAS `contracts/` dans les workspaces Bun** (Foundry est indépendant, `contracts/` n'a pas de `package.json`).
6. **Backend folder (`backend/uniswap/`)** → fusionné dans `apps/web/lib/uniswap/` (pas un workspace).
7. **Fichiers orphelins à supprimer** : `index.ts` racine (Bun.serve hello-world), `fetch-shim.js` (vérifier s'il est référencé avant suppression), `Cargo.toml` racine + `src/main.rs` Rust (2 lignes mortes). Confirme par grep avant de supprimer.
8. **Dédoublonnage PM** : supprimer `pnpm-lock.yaml` et `pnpm-workspace.yaml` dès la phase 1.
9. **TypeScript strict inchangé** — ne modifie aucune config TS au-delà du `paths` alias.
10. **Alias `@/*`** doit continuer de pointer vers le root de `apps/web/` (pas du monorepo).

---

## Phases de migration

### Phase 0 — Préparation & safety net

```bash
# 0.1 — Vérifier working tree propre
git status
# Attend : nothing to commit

# 0.2 — Créer la branche de migration
git checkout -b chore/monorepo-migration

# 0.3 — Baseline : lancer build + tests pour s'assurer que l'existant passe
bun install
bun run build       # next build
forge build
forge test
# Si un test échoue DÉJÀ sur main, note-le et continue (ce n'est pas ta régression)
```

### Phase 1 — Nettoyage PM + fichiers orphelins

Objectif : passer à bun-only avant toute réorg structurelle.

```bash
# 1.1 — Supprimer les artefacts pnpm
rm -f pnpm-lock.yaml pnpm-workspace.yaml

# 1.2 — Vérifier et supprimer orphelins
# Vérifie qu'aucun import ne référence ces fichiers avant suppression
grep -r "fetch-shim" --include="*.ts" --include="*.js" --include="*.json"
grep -r "main.rs\|Cargo.toml" --include="*.ts" --include="*.js" --include="*.json"
# Si aucun résultat :
git rm index.ts fetch-shim.js Cargo.toml src/main.rs

# 1.3 — Forcer lockfile texte bun
rm -f bun.lockb
bun install --save-text-lockfile
# Vérifie qu'un fichier `bun.lock` (texte) est créé
```

Mettre à jour `package.json` racine :
```json
{
  "packageManager": "bun@1.3.10",
  "engines": { "bun": ">=1.3" }
}
```

Retire aussi `ts-node` des `devDependencies` racine s'il n'est plus référencé (vérifier avec grep).

Commit : `chore(monorepo): phase 1 — switch to bun-only, remove orphan files`

### Phase 2 — Création de la structure cible (vide)

```bash
mkdir -p apps/web apps/docs packages/sdk packages/kv packages/lifi-client contracts
```

Ne déplace encore rien. Commit vide non nécessaire, passe à la phase 3.

### Phase 3 — Déplacement Foundry vers `contracts/`

```bash
# 3.1 — Solidity sources + scripts + tests
git mv src/MUWPTransfer.sol contracts/src/MUWPTransfer.sol
git mv script contracts/script
git mv test/MUWPTransfer.t.sol contracts/test/MUWPTransfer.t.sol
git mv foundry.toml contracts/foundry.toml
git mv remappings.txt contracts/remappings.txt
git mv deploy.sh contracts/deploy.sh
git mv broadcast contracts/broadcast   # si présent

# 3.2 — Submodules forge-std + openzeppelin
# ATTENTION : les submodules nécessitent update de .gitmodules
git mv lib/forge-std contracts/lib/forge-std
git mv lib/openzeppelin-contracts contracts/lib/openzeppelin-contracts
```

Édite `.gitmodules` pour mettre à jour les paths :
```ini
[submodule "contracts/lib/forge-std"]
    path = contracts/lib/forge-std
    url = https://github.com/foundry-rs/forge-std
[submodule "contracts/lib/openzeppelin-contracts"]
    path = contracts/lib/openzeppelin-contracts
    url = https://github.com/OpenZeppelin/openzeppelin-contracts
```

Puis :
```bash
git submodule sync
git submodule update --init --recursive
```

Vérifie que `contracts/remappings.txt` reste valide (il référence `lib/openzeppelin-contracts/...` en relatif, donc OK depuis `contracts/`).

Vérification :
```bash
cd contracts && forge build && forge test && cd ..
```

Commit : `chore(monorepo): phase 3 — move Foundry to contracts/`

### Phase 4 — Déplacement workspaces (sdk, kv, docs, li.fi-ts)

```bash
git mv sdk packages/sdk
git mv kv packages/kv
git mv docs apps/docs
git mv lib/li.fi-ts packages/lifi-client

# Vérifie que lib/li.fi (Rust orphelin) est supprimé OU déplacé si utilisé
grep -r "lib/li.fi" --include="*.ts" --include="*.json" --exclude-dir=node_modules
# Si aucun consumer → git rm -rf lib/li.fi
```

Vérification :
```bash
cd packages/sdk && bun install && bun run build && bun test && cd ../..
cd apps/docs && bun install && cd ../..
```

Commit : `chore(monorepo): phase 4 — move workspaces to apps/ and packages/`

### Phase 5 — Déplacement Next.js app vers `apps/web/`

Le plus gros move. Tout ce qui reste à la racine et appartient à l'app part dans `apps/web/`.

```bash
# 5.1 — Dossiers applicatifs
git mv app apps/web/app
git mv components apps/web/components
git mv public apps/web/public
git mv certificates apps/web/certificates
git mv tests apps/web/e2e                    # Playwright e2e — renommé au passage
git mv test/back apps/web/test-back          # tests TS backend (collocate plus tard si souhaité)

# 5.2 — lib/ applicatif TS (tout sauf ce qu'on a déjà bougé)
mkdir -p apps/web/lib
git mv lib/core apps/web/lib/core
git mv lib/allbridge apps/web/lib/allbridge
git mv lib/hashport apps/web/lib/hashport
git mv lib/layerzero apps/web/lib/layerzero
git mv lib/inngest apps/web/lib/inngest
git mv lib/kv apps/web/lib/kv

# 5.3 — backend/ fusionné dans apps/web/lib/uniswap/
git mv backend/uniswap apps/web/lib/uniswap
rmdir backend 2>/dev/null || git rm -rf backend

# 5.4 — Configs Next / Tailwind / ESLint / TS / shadcn
git mv next.config.js apps/web/next.config.js
git mv next-env.d.ts apps/web/next-env.d.ts
git mv sst-env.d.ts apps/web/sst-env.d.ts
git mv tailwind.config.js apps/web/tailwind.config.js
git mv postcss.config.js apps/web/postcss.config.js
git mv eslint.config.mjs apps/web/eslint.config.mjs
git mv tsconfig.json apps/web/tsconfig.json
git mv components.json apps/web/components.json
git mv playwright.config.ts apps/web/playwright.config.ts
git mv muwp.ts apps/web/muwp.ts              # chain registry

# 5.5 — Le dossier test/ vide doit disparaître
rmdir test 2>/dev/null

# 5.6 — Vider lib/ résiduel (doit être vide à ce stade)
rmdir lib 2>/dev/null
# Si erreur → il reste un truc à déplacer, investigue

# 5.7 — Vider src/ résiduel (Solidity déjà déplacé)
rmdir src 2>/dev/null
```

### Phase 6 — Création du `package.json` de `apps/web/`

Extrais de `package.json` racine **toutes** les deps/devDeps utilisées par l'app Next et crée `apps/web/package.json`. Le `package.json` racine ne doit garder que les outils monorepo.

**`apps/web/package.json`** :
```json
{
  "name": "@muwp/web",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev --experimental-https",
    "build": "next build",
    "start": "next start",
    "lint": "eslint .",
    "typecheck": "tsc --noEmit",
    "test": "bun test test-back lib/allbridge lib/hashport",
    "test:e2e": "playwright test"
  },
  "dependencies": { /* toutes les deps runtime : next, react, viem, wagmi, rainbowkit, allbridge, hashport, aptos wallets, radix, tailwind runtime, zustand, swr, react-query, reactflow, zod, hono, inngest, @vercel/kv, sst, etc. */ },
  "devDependencies": { /* @playwright/test, @types/*, eslint, eslint-config-next, prettier, etc. */ }
}
```

**Règle de split** : si une dep est importée dans `apps/web/**` → elle va dans `apps/web/package.json`. Si elle est utilisée uniquement dans `packages/sdk` → déjà dans `packages/sdk/package.json`.

**`package.json` racine** (minimal) :
```json
{
  "name": "muwp",
  "version": "0.1.0",
  "private": true,
  "packageManager": "bun@1.3.10",
  "engines": { "bun": ">=1.3" },
  "workspaces": ["apps/*", "packages/*"],
  "scripts": {
    "dev": "turbo run dev",
    "build": "turbo run build",
    "lint": "turbo run lint",
    "test": "turbo run test",
    "typecheck": "turbo run typecheck",
    "clean": "turbo run clean && rm -rf node_modules"
  },
  "devDependencies": {
    "turbo": "^2.0.0",
    "prettier": "^3.3.3"
  }
}
```

### Phase 7 — Mise à jour `tsconfig.json` de `apps/web/`

Le path alias `@/*` pointait vers le root du repo. Il doit maintenant pointer vers `apps/web/`.

Dans `apps/web/tsconfig.json`, vérifie que `"baseUrl"` et `"paths"` sont :
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

### Phase 8 — Turborepo

Installe à la racine :
```bash
bun add -D -w turbo
```

Crée `turbo.json` racine :
```json
{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", ".next/**", "!.next/cache/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "lint": {},
    "test": {
      "dependsOn": ["^build"]
    },
    "typecheck": {
      "dependsOn": ["^build"]
    },
    "clean": {
      "cache": false
    }
  }
}
```

### Phase 9 — Vercel

Mets à jour `vercel.json` racine :
```json
{
  "installCommand": "bun install --frozen-lockfile",
  "buildCommand": "bun run build --filter=@muwp/web",
  "outputDirectory": "apps/web/.next"
}
```

Côté dashboard Vercel : définis **Root Directory = `apps/web`** ou garde la racine + `buildCommand` filtré comme ci-dessus. Une seule des deux approches, pas les deux.

### Phase 10 — CI GitHub Actions

Mets à jour tous les workflows dans `.github/workflows/*.yml` :

```yaml
- uses: oven-sh/setup-bun@v2
  with:
    bun-version: 1.3.10

- run: bun install --frozen-lockfile

- run: bun run build            # via turbo
- run: bun run test             # via turbo
- run: bun run lint             # via turbo

# Pour Foundry (job séparé) :
- uses: foundry-rs/foundry-toolchain@v1
- run: cd contracts && forge build && forge test
```

Retire toute référence à `npm ci`, `pnpm install`, `actions/setup-node` non nécessaire.

### Phase 11 — Documentation (CLAUDE.md + README.md)

Mets à jour `CLAUDE.md` racine avec la nouvelle arborescence et les nouvelles commandes :
- Toutes les commandes `cd MUWP/` → racine du monorepo
- Ajouter les `turbo run <task> --filter=<workspace>` utiles
- Mettre à jour la table des alias de path
- Retirer la mention "pnpm migration in progress" (terminée)

Mets à jour `README.md` avec :
- prérequis (bun 1.3.10, foundry)
- setup (`bun install`, `cd contracts && forge install`)
- schéma arbo
- commandes principales

### Phase 12 — Vérifications finales

```bash
# Depuis la racine
bun install --frozen-lockfile
bun run typecheck
bun run lint
bun run build
bun run test

cd contracts && forge build && forge test && cd ..

# Lance l'app en dev pour smoke test
bun run dev --filter=@muwp/web
# Check que http://localhost:3000 répond

# Lance la doc
bun run dev --filter=@muwp/docs
```

Ensuite ouvre une PR depuis `chore/monorepo-migration` avec un résumé clair des changements et le lien vers ce document de migration.

---

## Critères de succès

- [ ] `bun install` à la racine installe tous les workspaces sans erreur
- [ ] `bun run build` compile `apps/web`, `apps/docs`, `packages/sdk` via Turbo
- [ ] `bun run test` passe (inclut sdk vitest + tests backend bun test)
- [ ] `bun run lint` passe
- [ ] `cd contracts && forge test` passe
- [ ] `bun run dev --filter=@muwp/web` démarre Next 16 en HTTPS local
- [ ] Aucun fichier `pnpm-lock.yaml`, `bun.lockb`, `index.ts` racine, `Cargo.toml`, `src/main.rs`, `fetch-shim.js`
- [ ] `git log --follow apps/web/app/page.tsx` montre l'historique complet (preuve du `git mv`)
- [ ] `.gitmodules` contient les nouveaux paths `contracts/lib/*`
- [ ] Le preview Vercel construit et déploie correctement

## En cas de blocage

- **Un import `@/...` cassé** → vérifie le `tsconfig.json` de `apps/web/` + lance `bun run typecheck` pour les localiser.
- **Un import cross-workspace cassé** (ex: app qui importait un util de `lib/li.fi-ts`) → ajoute la dep dans le `package.json` du consumer : `"@muwp/lifi-client": "workspace:*"`.
- **Un package natif fail sur bun** → fallback ponctuel `bun install --backend=npm <pkg>`.
- **Foundry ne trouve plus ses libs** → vérifie `contracts/foundry.toml` a bien `libs = ["lib"]` et que `contracts/remappings.txt` est correct.
- **SST config racine** : laisse `sst.config.ts` à la racine mais mets à jour les paths internes (`apps/web/*` au lieu de `app/*`).

Commence par la Phase 0 et va jusqu'à la Phase 12 de façon séquentielle. Commit après chaque phase. Demande-moi uniquement si un blocage bloquant survient.
