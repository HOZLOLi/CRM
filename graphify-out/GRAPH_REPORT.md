# Graph Report - CRM  (2026-11-12)

## Corpus Check
- 91 files · ~45,354 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 8 file(s) not represented in the graph (top: (none) 3, .example 1, .prisma 1)

## Summary
- 608 nodes · 1549 edges · 42 communities (28 shown, 14 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `faa7cb59`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- cn
- auth.ts
- guard
- settings-editor.tsx
- money.ts
- package.json
- dependencies
- steps
- dashboard/page.tsx
- backup.mjs
- crm
- compilerOptions
- scripts
- @dnd-kit/utilities@^3.2.2
- check-env.mjs
- vitest
- next.config.mjs
- install-skills.sh
- sales-engine.ts
- decimal.js
- prisma@^6.19.3
- sw.js
- tailwind-merge
- resource-table.tsx
- PageHeader
- @dnd-kit/core
- cartable.tsx
- react-dom@^19.3.1
- followup.ts
- deals-board.tsx
- date.ts
- seed.ts
- cycle.ts
- button.tsx
- server/settings.ts
- app/layout.tsx
- temperature.ts

## God Nodes (most connected - your core abstractions)
1. `guard()` - 47 edges
2. `cn()` - 44 edges
3. `ok()` - 43 edges
4. `handleError()` - 30 edges
5. `serialize()` - 29 edges
6. `db` - 26 edges
7. `dec()` - 25 edges
8. `PageHeader()` - 20 edges
9. `react` - 20 edges
10. `fail()` - 19 edges

## Surprising Connections (you probably didn't know these)
- `seedSalesEngine()` --calls--> `computeCycle()`  [EXTRACTED]
  prisma/seed-engine.ts → src/lib/cycle.ts
- `seedSalesEngine()` --calls--> `evaluateTemperature()`  [EXTRACTED]
  prisma/seed-engine.ts → src/lib/temperature.ts
- `CartablePage()` --calls--> `Cartable()`  [EXTRACTED]
  src/app/(app)/cartable/page.tsx → src/components/features/cartable.tsx
- `CartablePage()` --calls--> `requireUser()`  [EXTRACTED]
  src/app/(app)/cartable/page.tsx → src/server/auth.ts
- `CartablePage()` --calls--> `buildCartable()`  [EXTRACTED]
  src/app/(app)/cartable/page.tsx → src/server/sales-engine.ts

## Import Cycles
- None detected.

## Communities (42 total, 14 thin omitted)

### Community 0 - "cn"
Cohesion: 0.16
Nodes (19): LoginPage(), metadata, NewDealDialog(), DEMO_ACCOUNTS, EASE, LoginForm(), CreateDialog(), ResourceTable() (+11 more)

### Community 1 - "auth.ts"
Cohesion: 0.08
Nodes (26): next@^15.5.29, next, POST(), schema, POST(), AppLayout(), metadata, AppShell() (+18 more)

### Community 2 - "guard"
Cohesion: 0.09
Nodes (61): zod, DELETE(), PATCH(), GET(), POST(), DELETE(), PATCH(), GET() (+53 more)

### Community 3 - "settings-editor.tsx"
Cohesion: 0.12
Nodes (22): EASE, SaveRow(), Status, useSaver(), AppSettings, BAND_KEYS, BAND_LABELS, bandsSchema (+14 more)

### Community 4 - "money.ts"
Cohesion: 0.10
Nodes (43): maxDuration, POST(), AssistantPage(), dynamic, metadata, DealsPage(), AssistantChat(), add() (+35 more)

### Community 5 - "package.json"
Cohesion: 0.12
Nodes (22): devDependencies, playwright-core@^1.65.0, postcss@^8.5.32, sharp@^0.35.5, tailwindcss@^4.3.5, @tailwindcss/postcss@^4.3.5, @types/node@^26.6.6, @types/react@^19.3.0 (+14 more)

### Community 6 - "dependencies"
Cohesion: 0.09
Nodes (23): dependencies, ai@^7.0.170, @ai-sdk/openai-compatible@^3.0.90, @ai-sdk/react@^4.0.174, bcryptjs@^3.0.3, clsx@^2.1.1, date-fns@^4.4.0, date-fns-jalali@^4.4.0-0 (+15 more)

### Community 7 - "steps"
Cohesion: 0.10
Nodes (19): AUTH_SECRET, DATABASE_URL, jobs, verify, name, on, pull_request, push (+11 more)

### Community 8 - "dashboard/page.tsx"
Cohesion: 0.15
Nodes (21): lucide-react, ACTIVITY_ICON, DashboardPage(), dynamic, metadata, PRIORITY_LABEL, PRIORITY_TONE, dynamic (+13 more)

### Community 9 - "backup.mjs"
Cohesion: 0.13
Nodes (10): @prisma/client@^6.19.3, @prisma/client, args, BACKUP_DIR, db, files, keepIndex, stamp (+2 more)

### Community 10 - "crm"
Cohesion: 0.11
Nodes (18): build, container_name, env_file, environment, healthcheck, ports, restart, volumes (+10 more)

### Community 11 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowImportingTsExtensions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib (+11 more)

### Community 12 - "scripts"
Cohesion: 0.13
Nodes (15): scripts, build, db:backup, db:push, db:seed, db:studio, dev, hooks:install (+7 more)

### Community 14 - "check-env.mjs"
Cohesion: 0.33
Nodes (3): addresses, problems, secret

### Community 18 - "sales-engine.ts"
Cohesion: 0.16
Nodes (17): annualValue(), renderMessage(), isSpacingDue(), pickBucket(), planSpacing(), randomInterval(), SpacingBucket, SpacingConfig (+9 more)

### Community 21 - "decimal.js"
Cohesion: 0.20
Nodes (6): decimal.js@^10.6.0, recharts@^3.10.1, prisma, seed, decimal.js, recharts

### Community 28 - "resource-table.tsx"
Cohesion: 0.14
Nodes (18): react, CompaniesPage(), dynamic, metadata, CompaniesView(), CompanyRow, fields, fields (+10 more)

### Community 29 - "PageHeader"
Cohesion: 0.20
Nodes (14): CartablePage(), dynamic, metadata, ContactsPage(), dynamic, metadata, dynamic, LeadsPage() (+6 more)

### Community 31 - "cartable.tsx"
Cohesion: 0.18
Nodes (12): BAND_STYLE, Card(), Cartable(), CHANNEL, daysLabel(), EASE, formatStock(), INDUSTRY_LABEL (+4 more)

### Community 33 - "followup.ts"
Cohesion: 0.22
Nodes (13): CartableCardData, daysBetween(), decideFollowUp(), FollowUpDecision, FollowUpInput, FollowUpRules, Priority, rangeFromDays() (+5 more)

### Community 34 - "deals-board.tsx"
Cohesion: 0.22
Nodes (11): dynamic, metadata, BoardDeal, BoardStage, DealCard(), DealsBoard(), moveDeal(), onDragEnd() (+3 more)

### Community 35 - "date.ts"
Cohesion: 0.23
Nodes (9): dynamic, metadata, TasksPage(), TaskRow, TasksView(), formatDate(), formatDateTime(), formatRelative() (+1 more)

### Community 36 - "seed.ts"
Cohesion: 0.29
Nodes (9): D(), daysFromNow(), db, Context, D(), seedSalesEngine(), main(), DEFAULT_SETTINGS (+1 more)

### Community 37 - "cycle.ts"
Cohesion: 0.24
Nodes (10): computeCycle(), CycleConfig, CycleResult, CycleStatus, DAY_MS, daysBetween(), mean(), median() (+2 more)

### Community 38 - "button.tsx"
Cohesion: 0.20
Nodes (8): motion, EASE, SUGGESTIONS, ButtonProps, Size, sizes, Variant, variants

### Community 39 - "server/settings.ts"
Cohesion: 0.31
Nodes (9): Cache, emptyCache(), getSetting(), getSettings(), globalCache, invalidateSettingsCache(), resetSetting(), saveSetting() (+1 more)

### Community 40 - "app/layout.tsx"
Cohesion: 0.32
Nodes (5): metadata, RootLayout(), vazirmatn, viewport, ServiceWorkerRegistrar()

### Community 41 - "temperature.ts"
Cohesion: 0.29
Nodes (7): BAND_LABEL_FA, bandFor(), evaluateTemperature(), TemperatureBands, TemperatureCriterion, TemperatureInput, saveTemperatureEvaluation()

## Knowledge Gaps
- **14 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `next` connect `auth.ts` to `cn`, `guard`, `package.json`, `dashboard/page.tsx`, `app/layout.tsx`?**
  _High betweenness centrality (0.055) - this node is a cross-community bridge._
- **Should `auth.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.08362369337979095 - nodes in this community are weakly interconnected._
- **Why does `zod` connect `guard` to `auth.ts`, `settings-editor.tsx`, `package.json`, `dependencies`?**
  _High betweenness centrality (0.048) - this node is a cross-community bridge._
- **Should `guard` be split into smaller, more focused modules?**
  _Cohesion score 0.0934761441090555 - nodes in this community are weakly interconnected._
- **Why does `react` connect `resource-table.tsx` to `cn`, `auth.ts`, `deals-board.tsx`, `settings-editor.tsx`, `package.json`, `button.tsx`, `dependencies`, `app/layout.tsx`, `dashboard/page.tsx`, `PageHeader`, `cartable.tsx`?**
  _High betweenness centrality (0.043) - this node is a cross-community bridge._
- **Should `settings-editor.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.12 - nodes in this community are weakly interconnected._
- **Should `money.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.0963265306122449 - nodes in this community are weakly interconnected._