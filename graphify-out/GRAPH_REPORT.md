# Graph Report - CRM  (2026-11-12)

## Corpus Check
- 84 files · ~40,692 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 8 file(s) not represented in the graph (top: (none) 3, .example 1, .prisma 1)

## Summary
- 558 nodes · 1346 edges · 30 communities (16 shown, 14 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `faae59c7`
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
- engine.test.ts
- decimal.js
- prisma@^6.19.3
- sw.js
- tailwind-merge
- @dnd-kit/core
- react-dom@^19.3.1

## God Nodes (most connected - your core abstractions)
1. `cn()` - 41 edges
2. `guard()` - 39 edges
3. `ok()` - 35 edges
4. `serialize()` - 26 edges
5. `handleError()` - 24 edges
6. `db` - 23 edges
7. `dec()` - 22 edges
8. `DashboardPage()` - 19 edges
9. `react` - 19 edges
10. `PageHeader()` - 18 edges

## Surprising Connections (you probably didn't know these)
- `FollowUpInput` --references--> `BandKey`  [EXTRACTED]
  src/lib/followup.ts → src/lib/settings.ts
- `TemperatureResult` --references--> `BandKey`  [EXTRACTED]
  src/lib/temperature.ts → src/lib/settings.ts
- `CompaniesPage()` --calls--> `CompaniesView()`  [EXTRACTED]
  src/app/(app)/companies/page.tsx → src/components/features/companies-view.tsx
- `ContactsPage()` --calls--> `ContactsView()`  [EXTRACTED]
  src/app/(app)/contacts/page.tsx → src/components/features/contacts-view.tsx
- `DashboardPage()` --calls--> `Badge()`  [EXTRACTED]
  src/app/(app)/dashboard/page.tsx → src/components/ui/badge.tsx

## Import Cycles
- None detected.

## Communities (30 total, 14 thin omitted)

### Community 0 - "cn"
Cohesion: 0.07
Nodes (57): lucide-react, motion, react, AssistantChat(), EASE, SUGGESTIONS, CompaniesView(), fields (+49 more)

### Community 1 - "auth.ts"
Cohesion: 0.06
Nodes (38): next@^15.5.29, next, POST(), schema, POST(), dynamic, GET(), AppLayout() (+30 more)

### Community 2 - "guard"
Cohesion: 0.13
Nodes (46): zod, DELETE(), PATCH(), GET(), POST(), DELETE(), PATCH(), GET() (+38 more)

### Community 3 - "settings-editor.tsx"
Cohesion: 0.09
Nodes (33): D(), daysFromNow(), db, main(), AppSettings, BAND_KEYS, BAND_LABELS, bandsSchema (+25 more)

### Community 4 - "money.ts"
Cohesion: 0.13
Nodes (33): maxDuration, POST(), add(), applyDiscount(), compactNumber(), CURRENCY_SCALE, currencyScale(), dec() (+25 more)

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
Cohesion: 0.07
Nodes (49): AssistantPage(), dynamic, metadata, CompaniesPage(), dynamic, metadata, ContactsPage(), dynamic (+41 more)

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

### Community 18 - "engine.test.ts"
Cohesion: 0.08
Nodes (37): computeCycle(), CycleConfig, CycleResult, CycleStatus, DAY_MS, daysBetween(), mean(), median() (+29 more)

### Community 21 - "decimal.js"
Cohesion: 0.20
Nodes (6): decimal.js@^10.6.0, recharts@^3.10.1, prisma, seed, decimal.js, recharts

## Knowledge Gaps
- **14 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `next` connect `auth.ts` to `dashboard/page.tsx`, `cn`, `guard`, `package.json`?**
  _High betweenness centrality (0.062) - this node is a cross-community bridge._
- **Should `cn` be split into smaller, more focused modules?**
  _Cohesion score 0.07222222222222222 - nodes in this community are weakly interconnected._
- **Why does `react` connect `cn` to `dashboard/page.tsx`, `auth.ts`, `package.json`, `dependencies`?**
  _High betweenness centrality (0.046) - this node is a cross-community bridge._
- **Should `auth.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.05593220338983051 - nodes in this community are weakly interconnected._
- **Why does `zod` connect `guard` to `auth.ts`, `settings-editor.tsx`, `package.json`, `dependencies`?**
  _High betweenness centrality (0.046) - this node is a cross-community bridge._
- **Should `guard` be split into smaller, more focused modules?**
  _Cohesion score 0.12937853107344632 - nodes in this community are weakly interconnected._
- **Should `settings-editor.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.08558558558558559 - nodes in this community are weakly interconnected._