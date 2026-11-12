# Graph Report - CRM  (2026-11-12)

## Corpus Check
- 79 files · ~37,350 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 8 file(s) not represented in the graph (top: (none) 3, .example 1, .prisma 1)

## Summary
- 516 nodes · 1263 edges · 32 communities (15 shown, 17 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `ace88666`
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
- provider.ts
- backup.mjs
- crm
- compilerOptions
- scripts
- @dnd-kit/utilities@^3.2.2
- check-env.mjs
- vitest
- next.config.mjs
- install-skills.sh
- date-fns@^4.4.0
- package.json
- jose
- sw.js
- @dnd-kit/sortable@^10.0.0
- bcryptjs
- recharts@^3.10.1
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
8. `react` - 19 edges
9. `DashboardPage()` - 19 edges
10. `PageHeader()` - 18 edges

## Surprising Connections (you probably didn't know these)
- `AssistantPage()` --calls--> `PageHeader()`  [EXTRACTED]
  src/app/(app)/assistant/page.tsx → src/components/layout/page-header.tsx
- `DashboardPage()` --calls--> `dec()`  [EXTRACTED]
  src/app/(app)/dashboard/page.tsx → src/lib/money.ts
- `DashboardPage()` --calls--> `formatMoney()`  [EXTRACTED]
  src/app/(app)/dashboard/page.tsx → src/lib/money.ts
- `DashboardPage()` --calls--> `sum()`  [EXTRACTED]
  src/app/(app)/dashboard/page.tsx → src/lib/money.ts
- `DashboardPage()` --calls--> `weightedValue()`  [EXTRACTED]
  src/app/(app)/dashboard/page.tsx → src/lib/money.ts

## Import Cycles
- None detected.

## Communities (32 total, 17 thin omitted)

### Community 0 - "cn"
Cohesion: 0.05
Nodes (81): react, CompaniesPage(), dynamic, metadata, ContactsPage(), dynamic, metadata, ACTIVITY_ICON (+73 more)

### Community 1 - "auth.ts"
Cohesion: 0.06
Nodes (34): next@^15.5.29, lucide-react, next, POST(), schema, POST(), AppLayout(), metadata (+26 more)

### Community 2 - "guard"
Cohesion: 0.12
Nodes (50): zod, DELETE(), PATCH(), GET(), POST(), DELETE(), PATCH(), GET() (+42 more)

### Community 3 - "settings-editor.tsx"
Cohesion: 0.07
Nodes (40): D(), daysFromNow(), db, main(), EASE, SaveRow(), Status, useSaver() (+32 more)

### Community 4 - "money.ts"
Cohesion: 0.10
Nodes (40): DealsPage(), dynamic, metadata, BoardDeal, BoardStage, DealCard(), DealsBoard(), moveDeal() (+32 more)

### Community 5 - "package.json"
Cohesion: 0.11
Nodes (19): devDependencies, playwright-core@^1.65.0, postcss@^8.5.32, sharp@^0.35.5, tailwindcss@^4.3.5, @tailwindcss/postcss@^4.3.5, @types/node@^26.6.6, @types/react@^19.3.0 (+11 more)

### Community 6 - "dependencies"
Cohesion: 0.12
Nodes (16): dependencies, @ai-sdk/openai-compatible@^3.0.90, clsx@^2.1.1, date-fns-jalali@^4.4.0-0, lucide-react@^1.72.0, motion@^14.12.0, prisma@^6.19.3, react@^19.3.1 (+8 more)

### Community 7 - "steps"
Cohesion: 0.10
Nodes (19): AUTH_SECRET, DATABASE_URL, jobs, verify, name, on, pull_request, push (+11 more)

### Community 8 - "provider.ts"
Cohesion: 0.18
Nodes (15): ai@^7.0.170, ai, maxDuration, POST(), AssistantPage(), dynamic, metadata, AssistantChat() (+7 more)

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

### Community 21 - "package.json"
Cohesion: 0.20
Nodes (9): @ai-sdk/react@^4.0.174, decimal.js@^10.6.0, name, prisma, seed, private, version, @ai-sdk/react (+1 more)

## Knowledge Gaps
- **17 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `next` connect `auth.ts` to `cn`, `guard`, `package.json`?**
  _High betweenness centrality (0.068) - this node is a cross-community bridge._
- **Should `cn` be split into smaller, more focused modules?**
  _Cohesion score 0.053562653562653564 - nodes in this community are weakly interconnected._
- **Why does `react` connect `cn` to `auth.ts`, `settings-editor.tsx`, `money.ts`, `dependencies`, `provider.ts`, `package.json`?**
  _High betweenness centrality (0.052) - this node is a cross-community bridge._
- **Should `auth.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.06359189378057302 - nodes in this community are weakly interconnected._
- **Why does `zod` connect `guard` to `auth.ts`, `settings-editor.tsx`, `package.json`, `dependencies`?**
  _High betweenness centrality (0.045) - this node is a cross-community bridge._
- **Should `guard` be split into smaller, more focused modules?**
  _Cohesion score 0.11538461538461539 - nodes in this community are weakly interconnected._
- **Should `settings-editor.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.07272727272727272 - nodes in this community are weakly interconnected._