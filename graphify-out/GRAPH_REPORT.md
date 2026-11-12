# Graph Report - CRM  (2026-11-12)

## Corpus Check
- 74 files · ~33,601 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 8 file(s) not represented in the graph (top: (none) 3, .example 1, .prisma 1)

## Summary
- 467 nodes · 1124 edges · 34 communities (17 shown, 17 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `f002c79e`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- tasks-view.tsx
- auth.ts
- guard
- PageHeader
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
- app/layout.tsx
- package.json
- cn
- sw.js
- @dnd-kit/sortable@^10.0.0
- bcryptjs
- date-fns-jalali
- @dnd-kit/core
- prisma@^6.19.3
- react-dom@^19.3.1
- tailwind-merge

## God Nodes (most connected - your core abstractions)
1. `cn()` - 38 edges
2. `guard()` - 35 edges
3. `ok()` - 31 edges
4. `serialize()` - 26 edges
5. `handleError()` - 22 edges
6. `dec()` - 22 edges
7. `db` - 22 edges
8. `DashboardPage()` - 19 edges
9. `PageHeader()` - 18 edges
10. `react` - 18 edges

## Surprising Connections (you probably didn't know these)
- `DashboardPage()` --calls--> `PageBody()`  [EXTRACTED]
  src/app/(app)/dashboard/page.tsx → src/components/layout/page-header.tsx
- `DashboardPage()` --calls--> `PageHeader()`  [EXTRACTED]
  src/app/(app)/dashboard/page.tsx → src/components/layout/page-header.tsx
- `DashboardPage()` --calls--> `Avatar()`  [EXTRACTED]
  src/app/(app)/dashboard/page.tsx → src/components/ui/avatar.tsx
- `DashboardPage()` --calls--> `Badge()`  [EXTRACTED]
  src/app/(app)/dashboard/page.tsx → src/components/ui/badge.tsx
- `DashboardPage()` --calls--> `EmptyState()`  [EXTRACTED]
  src/app/(app)/dashboard/page.tsx → src/components/ui/panel.tsx

## Import Cycles
- None detected.

## Communities (34 total, 17 thin omitted)

### Community 0 - "tasks-view.tsx"
Cohesion: 0.09
Nodes (34): lucide-react@^1.72.0, motion@^14.12.0, lucide-react, motion, react, dynamic, metadata, TasksPage() (+26 more)

### Community 1 - "auth.ts"
Cohesion: 0.11
Nodes (16): next@^15.5.29, next, POST(), schema, POST(), LoginPage(), metadata, metadata (+8 more)

### Community 2 - "guard"
Cohesion: 0.13
Nodes (44): DELETE(), PATCH(), GET(), POST(), DELETE(), PATCH(), GET(), POST() (+36 more)

### Community 3 - "PageHeader"
Cohesion: 0.11
Nodes (29): CompaniesPage(), dynamic, metadata, ContactsPage(), dynamic, metadata, DealsPage(), dynamic (+21 more)

### Community 4 - "money.ts"
Cohesion: 0.08
Nodes (50): ACTIVITY_ICON, DashboardPage(), dynamic, metadata, PRIORITY_LABEL, PRIORITY_TONE, dynamic, metadata (+42 more)

### Community 5 - "package.json"
Cohesion: 0.11
Nodes (19): devDependencies, playwright-core@^1.65.0, postcss@^8.5.32, sharp@^0.35.5, tailwindcss@^4.3.5, @tailwindcss/postcss@^4.3.5, @types/node@^26.6.6, @types/react@^19.3.0 (+11 more)

### Community 6 - "dependencies"
Cohesion: 0.12
Nodes (16): dependencies, ai@^7.0.170, @ai-sdk/openai-compatible@^3.0.90, @ai-sdk/react@^4.0.174, clsx@^2.1.1, date-fns@^4.4.0, react@^19.3.1, recharts@^3.10.1 (+8 more)

### Community 7 - "steps"
Cohesion: 0.10
Nodes (19): AUTH_SECRET, DATABASE_URL, jobs, verify, name, on, pull_request, push (+11 more)

### Community 8 - "provider.ts"
Cohesion: 0.27
Nodes (11): maxDuration, POST(), AssistantPage(), dynamic, metadata, AssistantChat(), buildCrmContext(), getModelId() (+3 more)

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

### Community 14 - "check-env.mjs"
Cohesion: 0.33
Nodes (3): addresses, problems, secret

### Community 18 - "app/layout.tsx"
Cohesion: 0.32
Nodes (5): metadata, RootLayout(), vazirmatn, viewport, ServiceWorkerRegistrar()

### Community 21 - "package.json"
Cohesion: 0.20
Nodes (9): decimal.js@^10.6.0, jose@^6.2.17, name, prisma, seed, private, version, decimal.js (+1 more)

### Community 22 - "cn"
Cohesion: 0.12
Nodes (24): AppLayout(), dynamic, metadata, ROLE_LABEL, Row(), SettingsPage(), AppShell(), Brand() (+16 more)

## Knowledge Gaps
- **17 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `next` connect `auth.ts` to `tasks-view.tsx`, `guard`, `money.ts`, `app/layout.tsx`, `package.json`, `cn`?**
  _High betweenness centrality (0.080) - this node is a cross-community bridge._
- **Should `tasks-view.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.09468599033816426 - nodes in this community are weakly interconnected._
- **Why does `react` connect `tasks-view.tsx` to `PageHeader`, `money.ts`, `dependencies`, `app/layout.tsx`, `package.json`, `cn`?**
  _High betweenness centrality (0.058) - this node is a cross-community bridge._
- **Should `auth.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.11330049261083744 - nodes in this community are weakly interconnected._
- **Why does `scripts` connect `scripts` to `package.json`?**
  _High betweenness centrality (0.049) - this node is a cross-community bridge._
- **Should `guard` be split into smaller, more focused modules?**
  _Cohesion score 0.132486388384755 - nodes in this community are weakly interconnected._
- **Should `PageHeader` be split into smaller, more focused modules?**
  _Cohesion score 0.11261261261261261 - nodes in this community are weakly interconnected._