# Graph Report - CRM  (2026-11-12)

## Corpus Check
- 74 files · ~32,609 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 9 file(s) not represented in the graph (top: (none) 3, .woff2 2, .example 1)

## Summary
- 468 nodes · 1125 edges · 30 communities (16 shown, 14 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `801b33f8`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- cn
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
- tailwind-merge
- check-env.mjs
- vitest
- next.config.mjs
- install-skills.sh
- app/layout.tsx
- jose
- ai
- sw.js
- @dnd-kit/sortable@^10.0.0
- recharts@^3.10.1
- date-fns@^4.4.0

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
- `ContactsPage()` --calls--> `ContactsView()`  [EXTRACTED]
  src/app/(app)/contacts/page.tsx → src/components/features/contacts-view.tsx
- `DashboardPage()` --calls--> `PageBody()`  [EXTRACTED]
  src/app/(app)/dashboard/page.tsx → src/components/layout/page-header.tsx
- `DashboardPage()` --calls--> `PageHeader()`  [EXTRACTED]
  src/app/(app)/dashboard/page.tsx → src/components/layout/page-header.tsx
- `DashboardPage()` --calls--> `dec()`  [EXTRACTED]
  src/app/(app)/dashboard/page.tsx → src/lib/money.ts
- `DashboardPage()` --calls--> `formatMoney()`  [EXTRACTED]
  src/app/(app)/dashboard/page.tsx → src/lib/money.ts

## Import Cycles
- None detected.

## Communities (30 total, 14 thin omitted)

### Community 0 - "cn"
Cohesion: 0.06
Nodes (65): lucide-react, motion, react, ACTIVITY_ICON, DashboardPage(), dynamic, metadata, PRIORITY_LABEL (+57 more)

### Community 1 - "auth.ts"
Cohesion: 0.11
Nodes (17): next, POST(), schema, POST(), AppLayout(), LoginPage(), metadata, metadata (+9 more)

### Community 2 - "guard"
Cohesion: 0.13
Nodes (44): DELETE(), PATCH(), GET(), POST(), DELETE(), PATCH(), GET(), POST() (+36 more)

### Community 3 - "PageHeader"
Cohesion: 0.10
Nodes (28): CompaniesPage(), dynamic, metadata, ContactsPage(), dynamic, metadata, DealsPage(), dynamic (+20 more)

### Community 4 - "money.ts"
Cohesion: 0.15
Nodes (29): StageColumn(), add(), applyDiscount(), compactNumber(), CURRENCY_SCALE, currencyScale(), dec(), div() (+21 more)

### Community 5 - "package.json"
Cohesion: 0.11
Nodes (24): devDependencies, playwright-core@^1.65.0, postcss@^8.5.32, sharp@^0.35.5, tailwindcss@^4.3.5, @tailwindcss/postcss@^4.3.5, @types/node@^26.6.6, @types/react@^19.3.0 (+16 more)

### Community 6 - "dependencies"
Cohesion: 0.08
Nodes (25): dependencies, @ai-sdk/openai-compatible@^3.0.90, @ai-sdk/react@^4.0.174, bcryptjs@^3.0.3, clsx@^2.1.1, date-fns-jalali@^4.4.0-0, decimal.js@^10.6.0, @dnd-kit/core@^6.3.1 (+17 more)

### Community 7 - "steps"
Cohesion: 0.10
Nodes (19): AUTH_SECRET, DATABASE_URL, jobs, verify, name, on, pull_request, push (+11 more)

### Community 8 - "provider.ts"
Cohesion: 0.13
Nodes (22): maxDuration, POST(), AssistantPage(), dynamic, metadata, dynamic, metadata, ROLE_LABEL (+14 more)

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

### Community 13 - "tailwind-merge"
Cohesion: 0.33
Nodes (4): @dnd-kit/utilities@^3.2.2, tailwind-merge@^3.7.0, @dnd-kit/utilities, tailwind-merge

### Community 14 - "check-env.mjs"
Cohesion: 0.33
Nodes (3): addresses, problems, secret

### Community 18 - "app/layout.tsx"
Cohesion: 0.28
Nodes (6): estedad, metadata, RootLayout(), vazirmatn, viewport, ServiceWorkerRegistrar()

## Knowledge Gaps
- **14 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `next` connect `auth.ts` to `cn`, `guard`, `package.json`, `dependencies`, `app/layout.tsx`?**
  _High betweenness centrality (0.082) - this node is a cross-community bridge._
- **Should `cn` be split into smaller, more focused modules?**
  _Cohesion score 0.06349206349206349 - nodes in this community are weakly interconnected._
- **Why does `react` connect `cn` to `app/layout.tsx`, `PageHeader`, `package.json`, `dependencies`?**
  _High betweenness centrality (0.058) - this node is a cross-community bridge._
- **Should `auth.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.10685483870967742 - nodes in this community are weakly interconnected._
- **Why does `scripts` connect `scripts` to `package.json`?**
  _High betweenness centrality (0.049) - this node is a cross-community bridge._
- **Should `guard` be split into smaller, more focused modules?**
  _Cohesion score 0.132486388384755 - nodes in this community are weakly interconnected._
- **Should `PageHeader` be split into smaller, more focused modules?**
  _Cohesion score 0.09682539682539683 - nodes in this community are weakly interconnected._