# Graph Report - CRM  (2026-11-12)

## Corpus Check
- 73 files · ~32,175 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 9 file(s) not represented in the graph (top: (none) 3, .woff2 2, .example 1)

## Summary
- 466 nodes · 1124 edges · 29 communities (16 shown, 13 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `5e6afcf4`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- cn
- auth.ts
- guard
- next
- money.ts
- package.json
- dependencies
- steps
- provider.ts
- backup.mjs
- crm
- compilerOptions
- scripts
- @dnd-kit/core
- check-env.mjs
- vitest
- next.config.mjs
- install-skills.sh
- app/layout.tsx
- decimal.js
- jose
- clsx
- sw.js
- @dnd-kit/sortable@^10.0.0
- recharts@^3.10.1

## God Nodes (most connected - your core abstractions)
1. `cn()` - 38 edges
2. `guard()` - 35 edges
3. `ok()` - 31 edges
4. `serialize()` - 26 edges
5. `dec()` - 22 edges
6. `handleError()` - 22 edges
7. `db` - 22 edges
8. `DashboardPage()` - 19 edges
9. `react` - 18 edges
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

## Communities (29 total, 13 thin omitted)

### Community 0 - "cn"
Cohesion: 0.06
Nodes (65): react, CompaniesPage(), dynamic, metadata, ContactsPage(), dynamic, metadata, ACTIVITY_ICON (+57 more)

### Community 1 - "auth.ts"
Cohesion: 0.10
Nodes (25): lucide-react, POST(), schema, POST(), AppLayout(), metadata, AppShell(), Brand() (+17 more)

### Community 2 - "guard"
Cohesion: 0.13
Nodes (44): DELETE(), PATCH(), GET(), POST(), DELETE(), PATCH(), GET(), POST() (+36 more)

### Community 3 - "next"
Cohesion: 0.11
Nodes (19): next, LoginPage(), metadata, NewDealDialog(), DEMO_ACCOUNTS, EASE, LoginForm(), CreateDialog() (+11 more)

### Community 4 - "money.ts"
Cohesion: 0.11
Nodes (38): dynamic, metadata, BoardDeal, BoardStage, DealsBoard(), moveDeal(), onDragEnd(), EASE (+30 more)

### Community 5 - "package.json"
Cohesion: 0.12
Nodes (22): devDependencies, playwright-core@^1.65.0, postcss@^8.5.32, sharp@^0.35.5, tailwindcss@^4.3.5, @tailwindcss/postcss@^4.3.5, @types/node@^26.6.6, @types/react@^19.3.0 (+14 more)

### Community 6 - "dependencies"
Cohesion: 0.08
Nodes (24): dependencies, @ai-sdk/openai-compatible@^3.0.90, @ai-sdk/react@^4.0.174, bcryptjs@^3.0.3, date-fns@^4.4.0, date-fns-jalali@^4.4.0-0, @dnd-kit/utilities@^3.2.2, lucide-react@^1.72.0 (+16 more)

### Community 7 - "steps"
Cohesion: 0.10
Nodes (19): AUTH_SECRET, DATABASE_URL, jobs, verify, name, on, pull_request, push (+11 more)

### Community 8 - "provider.ts"
Cohesion: 0.18
Nodes (15): ai@^7.0.170, ai, maxDuration, POST(), AssistantPage(), dynamic, metadata, AssistantChat() (+7 more)

### Community 9 - "backup.mjs"
Cohesion: 0.11
Nodes (14): @prisma/client@^6.19.3, D(), daysFromNow(), db, main(), @prisma/client, args, BACKUP_DIR (+6 more)

### Community 10 - "crm"
Cohesion: 0.11
Nodes (18): build, container_name, env_file, environment, healthcheck, ports, restart, volumes (+10 more)

### Community 11 - "compilerOptions"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 12 - "scripts"
Cohesion: 0.13
Nodes (15): scripts, build, db:backup, db:push, db:seed, db:studio, dev, hooks:install (+7 more)

### Community 13 - "@dnd-kit/core"
Cohesion: 0.20
Nodes (6): @dnd-kit/core@^6.3.1, tailwind-merge@^3.7.0, prisma, seed, @dnd-kit/core, tailwind-merge

### Community 14 - "check-env.mjs"
Cohesion: 0.33
Nodes (3): addresses, problems, secret

### Community 18 - "app/layout.tsx"
Cohesion: 0.28
Nodes (6): estedad, metadata, RootLayout(), vazirmatn, viewport, ServiceWorkerRegistrar()

## Knowledge Gaps
- **13 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `next` connect `next` to `cn`, `auth.ts`, `guard`, `package.json`, `dependencies`, `app/layout.tsx`?**
  _High betweenness centrality (0.083) - this node is a cross-community bridge._
- **Should `cn` be split into smaller, more focused modules?**
  _Cohesion score 0.06478578892371996 - nodes in this community are weakly interconnected._
- **Why does `react` connect `cn` to `auth.ts`, `next`, `money.ts`, `package.json`, `dependencies`, `provider.ts`, `app/layout.tsx`?**
  _High betweenness centrality (0.058) - this node is a cross-community bridge._
- **Should `auth.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.0960960960960961 - nodes in this community are weakly interconnected._
- **Why does `scripts` connect `scripts` to `package.json`?**
  _High betweenness centrality (0.049) - this node is a cross-community bridge._
- **Should `guard` be split into smaller, more focused modules?**
  _Cohesion score 0.132486388384755 - nodes in this community are weakly interconnected._
- **Should `next` be split into smaller, more focused modules?**
  _Cohesion score 0.10752688172043011 - nodes in this community are weakly interconnected._