# Graph Report - CRM  (2026-11-12)

## Corpus Check
- 103 files · ~53,204 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 8 file(s) not represented in the graph (top: (none) 3, .example 1, .prisma 1)

## Summary
- 674 nodes · 1918 edges · 35 communities (22 shown, 13 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `203a8fe6`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- server/settings.ts
- auth.ts
- guard
- settings-editor.tsx
- money.ts
- package.json
- dependencies
- steps
- cn
- backup.mjs
- crm
- compilerOptions
- scripts
- cartable.tsx
- check-env.mjs
- app/layout.tsx
- next.config.mjs
- install-skills.sh
- sales-engine.ts
- decimal.js
- vitest
- sw.js
- date-fns@^4.4.0
- @dnd-kit/core
- dashboard/page.tsx
- @dnd-kit/sortable@^10.0.0
- jose
- followup.ts
- seed.ts
- [id]/page.tsx

## God Nodes (most connected - your core abstractions)
1. `cn()` - 52 edges
2. `guard()` - 51 edges
3. `ok()` - 45 edges
4. `handleError()` - 32 edges
5. `db` - 31 edges
6. `serialize()` - 29 edges
7. `dec()` - 29 edges
8. `Button` - 29 edges
9. `PageHeader()` - 28 edges
10. `PageBody()` - 26 edges

## Surprising Connections (you probably didn't know these)
- `seedSalesEngine()` --calls--> `computeCycle()`  [EXTRACTED]
  prisma/seed-engine.ts → src/lib/cycle.ts
- `seedSalesEngine()` --calls--> `evaluateTemperature()`  [EXTRACTED]
  prisma/seed-engine.ts → src/lib/temperature.ts
- `CartableCardData` --references--> `BandKey`  [EXTRACTED]
  src/components/features/cartable.tsx → src/lib/settings.ts
- `TemperatureResult` --references--> `BandKey`  [EXTRACTED]
  src/lib/temperature.ts → src/lib/settings.ts
- `CartablePage()` --calls--> `AiInsight()`  [EXTRACTED]
  src/app/(app)/cartable/page.tsx → src/components/features/ai-insight.tsx

## Import Cycles
- None detected.

## Communities (35 total, 13 thin omitted)

### Community 0 - "server/settings.ts"
Cohesion: 0.23
Nodes (13): dynamic, patchSchema, SETTING_SCHEMAS, SettingsKey, Cache, emptyCache(), getSetting(), getSettings() (+5 more)

### Community 1 - "auth.ts"
Cohesion: 0.07
Nodes (31): next, POST(), schema, POST(), dynamic, GET(), AppLayout(), LoginPage() (+23 more)

### Community 2 - "guard"
Cohesion: 0.10
Nodes (58): zod, DELETE(), PATCH(), GET(), POST(), DELETE(), PATCH(), GET() (+50 more)

### Community 3 - "settings-editor.tsx"
Cohesion: 0.11
Nodes (21): AppSettings, BAND_KEYS, BAND_LABELS, bandsSchema, BRAND_NAME, channelsSchema, criteriaSchema, criterionOptionSchema (+13 more)

### Community 4 - "money.ts"
Cohesion: 0.10
Nodes (42): ACTIVITY_ICON, DashboardPage(), dynamic, metadata, PRIORITY_LABEL, PRIORITY_TONE, ReportsPage(), DealCard() (+34 more)

### Community 5 - "package.json"
Cohesion: 0.12
Nodes (22): devDependencies, playwright-core@^1.65.0, postcss@^8.5.32, sharp@^0.35.5, tailwindcss@^4.3.5, @tailwindcss/postcss@^4.3.5, @types/node@^26.6.6, @types/react@^19.3.0 (+14 more)

### Community 6 - "dependencies"
Cohesion: 0.08
Nodes (25): dependencies, @ai-sdk/openai-compatible@^3.0.90, @ai-sdk/react@^4.0.174, bcryptjs@^3.0.3, date-fns-jalali@^4.4.0-0, @dnd-kit/utilities@^3.2.2, lucide-react@^1.72.0, motion@^14.12.0 (+17 more)

### Community 7 - "steps"
Cohesion: 0.10
Nodes (19): AUTH_SECRET, DATABASE_URL, jobs, verify, name, on, pull_request, push (+11 more)

### Community 8 - "cn"
Cohesion: 0.06
Nodes (77): lucide-react, motion, react, Dots(), dynamic, INDUSTRY_LABEL, metadata, OBJECTION_LABEL (+69 more)

### Community 9 - "backup.mjs"
Cohesion: 0.20
Nodes (7): args, BACKUP_DIR, db, files, keepIndex, stamp, target

### Community 10 - "crm"
Cohesion: 0.11
Nodes (18): build, container_name, env_file, environment, healthcheck, ports, restart, volumes (+10 more)

### Community 11 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowImportingTsExtensions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib (+11 more)

### Community 12 - "scripts"
Cohesion: 0.13
Nodes (15): scripts, build, db:backup, db:push, db:seed, db:studio, dev, hooks:install (+7 more)

### Community 13 - "cartable.tsx"
Cohesion: 0.18
Nodes (12): BAND_STYLE, Card(), CartableCardData, CHANNEL, daysLabel(), EASE, formatStock(), INDUSTRY_LABEL (+4 more)

### Community 14 - "check-env.mjs"
Cohesion: 0.33
Nodes (3): addresses, problems, secret

### Community 15 - "app/layout.tsx"
Cohesion: 0.32
Nodes (5): metadata, RootLayout(), vazirmatn, viewport, ServiceWorkerRegistrar()

### Community 18 - "sales-engine.ts"
Cohesion: 0.10
Nodes (32): computeCycle(), CycleConfig, CycleResult, CycleStatus, DAY_MS, daysBetween(), mean(), median() (+24 more)

### Community 21 - "decimal.js"
Cohesion: 0.20
Nodes (6): clsx@^2.1.1, decimal.js@^10.6.0, prisma, seed, clsx, decimal.js

### Community 29 - "dashboard/page.tsx"
Cohesion: 0.05
Nodes (58): ai@^7.0.170, ai, maxDuration, POST(), maxDuration, POST(), schema, AssistantPage() (+50 more)

### Community 33 - "followup.ts"
Cohesion: 0.36
Nodes (8): FollowUpDecision, FollowUpInput, FollowUpRules, Priority, BandKey, Channel, RangeKey, CartableCard

### Community 36 - "seed.ts"
Cohesion: 0.18
Nodes (12): D(), daysFromNow(), db, Context, D(), seedSalesEngine(), main(), @prisma/client (+4 more)

### Community 41 - "[id]/page.tsx"
Cohesion: 0.17
Nodes (14): BAND_TONE, CustomerPage(), Dots(), dynamic, INDUSTRY_LABEL, Row(), BAND_TONE, EASE (+6 more)

## Knowledge Gaps
- **13 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `next` connect `auth.ts` to `guard`, `money.ts`, `package.json`, `dependencies`, `cn`, `[id]/page.tsx`, `app/layout.tsx`, `dashboard/page.tsx`?**
  _High betweenness centrality (0.059) - this node is a cross-community bridge._
- **Should `auth.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.07227891156462585 - nodes in this community are weakly interconnected._
- **Why does `zod` connect `guard` to `server/settings.ts`, `auth.ts`, `settings-editor.tsx`, `package.json`, `dependencies`, `dashboard/page.tsx`?**
  _High betweenness centrality (0.039) - this node is a cross-community bridge._
- **Should `guard` be split into smaller, more focused modules?**
  _Cohesion score 0.10054054054054054 - nodes in this community are weakly interconnected._
- **Why does `db` connect `guard` to `server/settings.ts`, `auth.ts`, `settings-editor.tsx`, `money.ts`, `cn`, `[id]/page.tsx`, `sales-engine.ts`, `dashboard/page.tsx`?**
  _High betweenness centrality (0.039) - this node is a cross-community bridge._
- **Should `settings-editor.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.10507246376811594 - nodes in this community are weakly interconnected._
- **Should `money.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.10119047619047619 - nodes in this community are weakly interconnected._