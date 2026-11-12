# Graph Report - CRM  (2026-11-12)

## Corpus Check
- 93 files · ~47,109 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 8 file(s) not represented in the graph (top: (none) 3, .example 1, .prisma 1)

## Summary
- 620 nodes · 1631 edges · 35 communities (21 shown, 14 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `d7733087`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- spacing.ts
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
- ai
- check-env.mjs
- vitest
- next.config.mjs
- install-skills.sh
- sales-engine.ts
- bcryptjs
- clsx
- sw.js
- decimal.js
- PageHeader
- @dnd-kit/core
- react-dom@^19.3.1
- followup.ts
- seed.ts
- cycle.ts
- temperature.ts

## God Nodes (most connected - your core abstractions)
1. `guard()` - 47 edges
2. `cn()` - 46 edges
3. `ok()` - 43 edges
4. `handleError()` - 30 edges
5. `serialize()` - 29 edges
6. `db` - 27 edges
7. `dec()` - 25 edges
8. `PageHeader()` - 22 edges
9. `Badge()` - 22 edges
10. `Button` - 21 edges

## Surprising Connections (you probably didn't know these)
- `seedSalesEngine()` --calls--> `computeCycle()`  [EXTRACTED]
  prisma/seed-engine.ts → src/lib/cycle.ts
- `seedSalesEngine()` --calls--> `evaluateTemperature()`  [EXTRACTED]
  prisma/seed-engine.ts → src/lib/temperature.ts
- `CustomerPage()` --calls--> `PageBody()`  [EXTRACTED]
  src/app/(app)/companies/[id]/page.tsx → src/components/layout/page-header.tsx
- `CustomerPage()` --calls--> `PageHeader()`  [EXTRACTED]
  src/app/(app)/companies/[id]/page.tsx → src/components/layout/page-header.tsx
- `CustomerPage()` --calls--> `formatMoney()`  [EXTRACTED]
  src/app/(app)/companies/[id]/page.tsx → src/lib/money.ts

## Import Cycles
- None detected.

## Communities (35 total, 14 thin omitted)

### Community 0 - "spacing.ts"
Cohesion: 0.38
Nodes (6): pickBucket(), planSpacing(), randomInterval(), SpacingBucket, SpacingConfig, SpacingPlan

### Community 1 - "auth.ts"
Cohesion: 0.06
Nodes (36): next, POST(), schema, POST(), dynamic, GET(), AppLayout(), metadata (+28 more)

### Community 2 - "guard"
Cohesion: 0.10
Nodes (57): zod, DELETE(), PATCH(), GET(), POST(), DELETE(), PATCH(), GET() (+49 more)

### Community 3 - "settings-editor.tsx"
Cohesion: 0.12
Nodes (22): AppSettings, BAND_KEYS, bandsSchema, BRAND_NAME, channelsSchema, criteriaSchema, criterionOptionSchema, criterionSchema (+14 more)

### Community 4 - "money.ts"
Cohesion: 0.10
Nodes (43): maxDuration, POST(), AssistantPage(), dynamic, metadata, AssistantChat(), StageColumn(), add() (+35 more)

### Community 5 - "package.json"
Cohesion: 0.12
Nodes (22): devDependencies, playwright-core@^1.65.0, postcss@^8.5.32, sharp@^0.35.5, tailwindcss@^4.3.5, @tailwindcss/postcss@^4.3.5, @types/node@^26.6.6, @types/react@^19.3.0 (+14 more)

### Community 6 - "dependencies"
Cohesion: 0.08
Nodes (24): dependencies, @ai-sdk/openai-compatible@^3.0.90, @ai-sdk/react@^4.0.174, date-fns@^4.4.0, date-fns-jalali@^4.4.0-0, @dnd-kit/sortable@^10.0.0, @dnd-kit/utilities@^3.2.2, lucide-react@^1.72.0 (+16 more)

### Community 7 - "steps"
Cohesion: 0.10
Nodes (19): AUTH_SECRET, DATABASE_URL, jobs, verify, name, on, pull_request, push (+11 more)

### Community 8 - "cn"
Cohesion: 0.05
Nodes (87): lucide-react, motion, react, CustomerPage(), ACTIVITY_ICON, DashboardPage(), dynamic, metadata (+79 more)

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
Cohesion: 0.20
Nodes (14): annualValue(), renderMessage(), isSpacingDue(), isMaxAnswer(), buildCartable(), CartableOptions, CreateOrderInput, generateSpacingTasks() (+6 more)

### Community 21 - "bcryptjs"
Cohesion: 0.20
Nodes (6): bcryptjs@^3.0.3, jose@^6.2.17, prisma, seed, bcryptjs, jose

### Community 29 - "PageHeader"
Cohesion: 0.09
Nodes (31): CartablePage(), dynamic, metadata, CompaniesPage(), dynamic, metadata, ContactsPage(), dynamic (+23 more)

### Community 33 - "followup.ts"
Cohesion: 0.18
Nodes (15): CartableCardData, daysBetween(), decideFollowUp(), FollowUpDecision, FollowUpInput, FollowUpRules, Priority, rangeFromDays() (+7 more)

### Community 36 - "seed.ts"
Cohesion: 0.31
Nodes (8): D(), daysFromNow(), db, Context, D(), seedSalesEngine(), main(), SETTING_GROUPS

### Community 37 - "cycle.ts"
Cohesion: 0.22
Nodes (10): computeCycle(), CycleConfig, CycleResult, CycleStatus, DAY_MS, daysBetween(), mean(), median() (+2 more)

### Community 41 - "temperature.ts"
Cohesion: 0.15
Nodes (13): BAND_TONE, Dots(), dynamic, INDUSTRY_LABEL, Row(), STAGE_LABELS, BAND_LABEL_FA, bandFor() (+5 more)

## Knowledge Gaps
- **14 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `next` connect `auth.ts` to `guard`, `package.json`, `dependencies`, `cn`, `temperature.ts`?**
  _High betweenness centrality (0.062) - this node is a cross-community bridge._
- **Should `auth.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.05952380952380952 - nodes in this community are weakly interconnected._
- **Why does `zod` connect `guard` to `auth.ts`, `settings-editor.tsx`, `package.json`, `dependencies`?**
  _High betweenness centrality (0.043) - this node is a cross-community bridge._
- **Should `guard` be split into smaller, more focused modules?**
  _Cohesion score 0.10255460940392447 - nodes in this community are weakly interconnected._
- **Why does `db` connect `guard` to `auth.ts`, `settings-editor.tsx`, `money.ts`, `cn`, `temperature.ts`, `sales-engine.ts`, `PageHeader`?**
  _High betweenness centrality (0.041) - this node is a cross-community bridge._
- **Should `settings-editor.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.12 - nodes in this community are weakly interconnected._
- **Should `money.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.0963265306122449 - nodes in this community are weakly interconnected._