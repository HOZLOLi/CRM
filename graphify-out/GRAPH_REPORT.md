# Graph Report - CRM  (2026-11-12)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 462 nodes · 1121 edges · 27 communities (15 shown, 12 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `78dec80b`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Community 0
- Community 1
- Community 2
- Community 3
- Community 4
- Community 5
- Community 6
- Community 7
- Community 8
- Community 9
- Community 10
- Community 11
- Community 12
- Community 13
- Community 14
- Community 15
- Community 16
- Community 17
- Community 18
- Community 19
- Community 20
- Community 21
- Community 22
- Community 23

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
- `DashboardPage()` --calls--> `isOverdue()`  [EXTRACTED]
  src/app/(app)/dashboard/page.tsx → src/lib/date.ts
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

## Communities (27 total, 12 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.07
Nodes (60): react, CompaniesPage(), dynamic, metadata, ContactsPage(), dynamic, metadata, ACTIVITY_ICON (+52 more)

### Community 1 - "Community 1"
Cohesion: 0.06
Nodes (38): lucide-react, next, POST(), schema, POST(), dynamic, GET(), AppLayout() (+30 more)

### Community 2 - "Community 2"
Cohesion: 0.15
Nodes (40): DELETE(), PATCH(), GET(), POST(), DELETE(), PATCH(), GET(), POST() (+32 more)

### Community 3 - "Community 3"
Cohesion: 0.09
Nodes (31): motion, dynamic, metadata, TasksPage(), DealsBoard(), moveDeal(), onDragEnd(), EASE (+23 more)

### Community 4 - "Community 4"
Cohesion: 0.15
Nodes (29): StageColumn(), add(), applyDiscount(), compactNumber(), CURRENCY_SCALE, currencyScale(), dec(), div() (+21 more)

### Community 5 - "Community 5"
Cohesion: 0.12
Nodes (22): devDependencies, playwright-core@^1.65.0, postcss@^8.5.32, sharp@^0.35.5, tailwindcss@^4.3.5, @tailwindcss/postcss@^4.3.5, @types/node@^26.6.6, @types/react@^19.3.0 (+14 more)

### Community 6 - "Community 6"
Cohesion: 0.09
Nodes (23): dependencies, @ai-sdk/react@^4.0.174, bcryptjs@^3.0.3, clsx@^2.1.1, date-fns@^4.4.0, @dnd-kit/core@^6.3.1, @dnd-kit/sortable@^10.0.0, lucide-react@^1.72.0 (+15 more)

### Community 7 - "Community 7"
Cohesion: 0.10
Nodes (19): AUTH_SECRET, DATABASE_URL, jobs, verify, name, on, pull_request, push (+11 more)

### Community 8 - "Community 8"
Cohesion: 0.18
Nodes (15): ai@^7.0.170, ai, maxDuration, POST(), AssistantPage(), dynamic, metadata, AssistantChat() (+7 more)

### Community 9 - "Community 9"
Cohesion: 0.11
Nodes (14): @prisma/client@^6.19.3, D(), daysFromNow(), db, main(), @prisma/client, args, BACKUP_DIR (+6 more)

### Community 10 - "Community 10"
Cohesion: 0.11
Nodes (18): build, container_name, env_file, environment, healthcheck, ports, restart, volumes (+10 more)

### Community 11 - "Community 11"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 12 - "Community 12"
Cohesion: 0.15
Nodes (13): scripts, build, db:backup, db:push, db:seed, db:studio, dev, setup (+5 more)

### Community 13 - "Community 13"
Cohesion: 0.20
Nodes (6): @ai-sdk/openai-compatible@^3.0.90, prisma@^6.19.3, prisma, seed, @ai-sdk/openai-compatible, prisma

### Community 14 - "Community 14"
Cohesion: 0.33
Nodes (3): addresses, problems, secret

## Knowledge Gaps
- **12 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `next` connect `Community 1` to `Community 0`, `Community 2`, `Community 3`, `Community 5`, `Community 6`?**
  _High betweenness centrality (0.083) - this node is a cross-community bridge._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.06848425835767608 - nodes in this community are weakly interconnected._
- **Why does `react` connect `Community 0` to `Community 1`, `Community 3`, `Community 5`, `Community 6`, `Community 8`?**
  _High betweenness centrality (0.058) - this node is a cross-community bridge._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.05786090005844535 - nodes in this community are weakly interconnected._
- **Why does `@prisma/client` connect `Community 9` to `Community 2`, `Community 5`?**
  _High betweenness centrality (0.049) - this node is a cross-community bridge._
- **Should `Community 3` be split into smaller, more focused modules?**
  _Cohesion score 0.09090909090909091 - nodes in this community are weakly interconnected._
- **Should `Community 5` be split into smaller, more focused modules?**
  _Cohesion score 0.1225296442687747 - nodes in this community are weakly interconnected._