# Graph Report - CRM  (2026-11-12)

## Corpus Check
- 109 files · ~55,726 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 8 file(s) not represented in the graph (top: (none) 3, .example 1, .prisma 1)

## Summary
- 751 nodes · 2020 edges · 34 communities (24 shown, 10 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `50484cf5`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- electron-builder.yml
- auth.ts
- guard
- Badge
- money.ts
- package.json
- dependencies
- steps
- settings-editor.tsx
- orders-view.tsx
- crm
- compilerOptions
- scripts
- cartable.tsx
- main.js
- app/layout.tsx
- next.config.mjs
- install-skills.sh
- sales-engine.ts
- package.json
- vitest
- sw.js
- button.tsx
- deals-board.tsx
- dashboard/page.tsx
- insight/route.ts
- playwright-core@^1.65.0
- build-base-db.mjs
- cn

## God Nodes (most connected - your core abstractions)
1. `cn()` - 52 edges
2. `guard()` - 51 edges
3. `ok()` - 45 edges
4. `handleError()` - 32 edges
5. `db` - 31 edges
6. `Button` - 29 edges
7. `dec()` - 29 edges
8. `serialize()` - 29 edges
9. `PageHeader()` - 28 edges
10. `PageBody()` - 26 edges

## Surprising Connections (you probably didn't know these)
- `seedSalesEngine()` --calls--> `computeCycle()`  [EXTRACTED]
  prisma/seed-engine.ts → src/lib/cycle.ts
- `seedSalesEngine()` --calls--> `evaluateTemperature()`  [EXTRACTED]
  prisma/seed-engine.ts → src/lib/temperature.ts
- `AssistantPage()` --calls--> `AssistantChat()`  [EXTRACTED]
  src/app/(app)/assistant/page.tsx → src/components/features/assistant-chat.tsx
- `CartablePage()` --calls--> `Cartable()`  [EXTRACTED]
  src/app/(app)/cartable/page.tsx → src/components/features/cartable.tsx
- `CartablePage()` --calls--> `buildCartable()`  [EXTRACTED]
  src/app/(app)/cartable/page.tsx → src/server/sales-engine.ts

## Import Cycles
- None detected.

## Communities (34 total, 10 thin omitted)

### Community 0 - "electron-builder.yml"
Cohesion: 0.07
Nodes (26): appId, asar, compression, copyright, directories, app, output, extraResources (+18 more)

### Community 1 - "auth.ts"
Cohesion: 0.07
Nodes (32): next@^15.5.29, next, POST(), schema, POST(), dynamic, GET(), AppLayout() (+24 more)

### Community 2 - "guard"
Cohesion: 0.08
Nodes (71): zod, DELETE(), PATCH(), GET(), POST(), DELETE(), PATCH(), GET() (+63 more)

### Community 3 - "Badge"
Cohesion: 0.19
Nodes (17): react, CompaniesView(), fields, ContactsView(), fields, fields, LeadsView(), SOURCE (+9 more)

### Community 4 - "money.ts"
Cohesion: 0.09
Nodes (40): decimal.js@^10.6.0, decimal.js, computeCycle(), CycleConfig, CycleResult, CycleStatus, DAY_MS, daysBetween() (+32 more)

### Community 5 - "package.json"
Cohesion: 0.09
Nodes (22): { contextBridge, ipcRenderer }, devDependencies, electron@^33.4.11, electron-builder@^26.18.0, postcss@^8.5.32, sharp@^0.35.5, tailwindcss@^4.3.5, @tailwindcss/postcss@^4.3.5 (+14 more)

### Community 6 - "dependencies"
Cohesion: 0.10
Nodes (21): dependencies, @ai-sdk/openai-compatible@^3.0.90, @ai-sdk/react@^4.0.174, date-fns-jalali@^4.4.0-0, @dnd-kit/core@^6.3.1, @dnd-kit/sortable@^10.0.0, lucide-react@^1.72.0, motion@^14.12.0 (+13 more)

### Community 7 - "steps"
Cohesion: 0.10
Nodes (19): AUTH_SECRET, DATABASE_URL, jobs, verify, name, on, pull_request, push (+11 more)

### Community 8 - "settings-editor.tsx"
Cohesion: 0.17
Nodes (18): DEMO_ACCOUNTS, EASE, LoginForm(), CreateDialog(), EASE, NumberBox(), SaveRow(), SettingsEditor() (+10 more)

### Community 9 - "orders-view.tsx"
Cohesion: 0.23
Nodes (10): lucide-react, motion, EASE, Line, newLine(), OrderCustomer, OrderForm(), OrderProduct (+2 more)

### Community 10 - "crm"
Cohesion: 0.11
Nodes (18): build, container_name, env_file, environment, healthcheck, ports, restart, volumes (+10 more)

### Community 11 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowImportingTsExtensions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib (+11 more)

### Community 12 - "scripts"
Cohesion: 0.11
Nodes (19): scripts, build, db:backup, db:push, db:seed, db:studio, desktop:build, desktop:db (+11 more)

### Community 13 - "cartable.tsx"
Cohesion: 0.17
Nodes (12): BAND_STYLE, Card(), Cartable(), CHANNEL, daysLabel(), EASE, formatStock(), INDUSTRY_LABEL (+4 more)

### Community 14 - "main.js"
Cohesion: 0.08
Nodes (21): { app, BrowserWindow, dialog, shell, Menu, ipcMain }, BOOT_LOG, ensureDatabase(), ensureDir(), ensureRuntime(), ensureSecret(), findFreePort(), fs (+13 more)

### Community 15 - "app/layout.tsx"
Cohesion: 0.32
Nodes (5): metadata, RootLayout(), vazirmatn, viewport, ServiceWorkerRegistrar()

### Community 18 - "sales-engine.ts"
Cohesion: 0.06
Nodes (55): CartableCardData, annualValue(), daysBetween(), decideFollowUp(), FollowUpDecision, FollowUpInput, FollowUpRules, Priority (+47 more)

### Community 21 - "package.json"
Cohesion: 0.12
Nodes (15): clsx@^2.1.1, date-fns@^4.4.0, @dnd-kit/utilities@^3.2.2, jose@^6.2.17, react-dom@^19.3.1, name, prisma, seed (+7 more)

### Community 27 - "button.tsx"
Cohesion: 0.17
Nodes (8): AssistantChat(), EASE, SUGGESTIONS, ButtonProps, Size, sizes, Variant, variants

### Community 28 - "deals-board.tsx"
Cohesion: 0.27
Nodes (9): DealCard(), DealsBoard(), moveDeal(), onDragEnd(), EASE, NewDealDialog(), StageColumn(), TONE_BAR (+1 more)

### Community 29 - "dashboard/page.tsx"
Cohesion: 0.06
Nodes (84): maxDuration, POST(), AssistantPage(), dynamic, metadata, CartablePage(), dynamic, metadata (+76 more)

### Community 30 - "insight/route.ts"
Cohesion: 0.29
Nodes (6): ai@^7.0.170, ai, maxDuration, POST(), schema, getScope()

### Community 36 - "build-base-db.mjs"
Cohesion: 0.06
Nodes (34): bcryptjs@^3.0.3, @prisma/client@^6.19.3, D(), daysFromNow(), db, Context, D(), seedSalesEngine() (+26 more)

### Community 41 - "cn"
Cohesion: 0.19
Nodes (7): TasksView(), BAND_TONE, EASE, TemperatureForm(), Skeleton(), Stat(), cn()

## Knowledge Gaps
- **10 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `next` connect `auth.ts` to `guard`, `Badge`, `settings-editor.tsx`, `app/layout.tsx`, `package.json`, `dashboard/page.tsx`?**
  _High betweenness centrality (0.053) - this node is a cross-community bridge._
- **Should `electron-builder.yml` be split into smaller, more focused modules?**
  _Cohesion score 0.07407407407407407 - nodes in this community are weakly interconnected._
- **Why does `scripts` connect `scripts` to `package.json`?**
  _High betweenness centrality (0.041) - this node is a cross-community bridge._
- **Should `auth.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.07020408163265306 - nodes in this community are weakly interconnected._
- **Why does `react` connect `Badge` to `auth.ts`, `dependencies`, `settings-editor.tsx`, `orders-view.tsx`, `cn`, `cartable.tsx`, `app/layout.tsx`, `package.json`, `button.tsx`, `deals-board.tsx`, `dashboard/page.tsx`?**
  _High betweenness centrality (0.037) - this node is a cross-community bridge._
- **Should `guard` be split into smaller, more focused modules?**
  _Cohesion score 0.08014981273408239 - nodes in this community are weakly interconnected._
- **Should `money.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.09408033826638477 - nodes in this community are weakly interconnected._