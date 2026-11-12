# Graph Report - CRM  (2026-11-12)

## Corpus Check
- 96 files · ~49,616 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 8 file(s) not represented in the graph (top: (none) 3, .example 1, .prisma 1)

## Summary
- 637 nodes · 1717 edges · 39 communities (21 shown, 18 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `0eb38eb0`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- scopes.ts
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
- @ai-sdk/openai-compatible
- check-env.mjs
- bcryptjs
- next.config.mjs
- install-skills.sh
- sales-engine.ts
- package.json
- clsx
- sw.js
- decimal.js
- date-fns-jalali
- dashboard/page.tsx
- @dnd-kit/sortable@^10.0.0
- prisma@^6.19.3
- react-dom@^19.3.1
- followup.ts
- recharts@^3.10.1
- typescript@5.9
- seed.ts
- cycle.ts
- temperature-form.tsx

## God Nodes (most connected - your core abstractions)
1. `guard()` - 49 edges
2. `cn()` - 48 edges
3. `ok()` - 43 edges
4. `handleError()` - 30 edges
5. `serialize()` - 29 edges
6. `db` - 28 edges
7. `dec()` - 25 edges
8. `Button` - 23 edges
9. `DashboardPage()` - 22 edges
10. `PageHeader()` - 22 edges

## Surprising Connections (you probably didn't know these)
- `seedSalesEngine()` --calls--> `computeCycle()`  [EXTRACTED]
  prisma/seed-engine.ts → src/lib/cycle.ts
- `seedSalesEngine()` --calls--> `evaluateTemperature()`  [EXTRACTED]
  prisma/seed-engine.ts → src/lib/temperature.ts
- `CartableCardData` --references--> `BandKey`  [EXTRACTED]
  src/components/features/cartable.tsx → src/lib/settings.ts
- `CartablePage()` --calls--> `buildCartable()`  [EXTRACTED]
  src/app/(app)/cartable/page.tsx → src/server/sales-engine.ts
- `CustomerPage()` --calls--> `getSettings()`  [EXTRACTED]
  src/app/(app)/companies/[id]/page.tsx → src/server/settings.ts

## Import Cycles
- None detected.

## Communities (39 total, 18 thin omitted)

### Community 0 - "scopes.ts"
Cohesion: 0.21
Nodes (10): maxDuration, POST(), schema, BAND_LABELS, getProvider(), getScope(), SCOPE_SYSTEM_SUFFIX, ScopeDefinition (+2 more)

### Community 1 - "auth.ts"
Cohesion: 0.07
Nodes (32): next, POST(), schema, POST(), AppLayout(), metadata, RootLayout(), vazirmatn (+24 more)

### Community 2 - "guard"
Cohesion: 0.09
Nodes (61): zod, DELETE(), PATCH(), GET(), POST(), DELETE(), PATCH(), GET() (+53 more)

### Community 3 - "settings-editor.tsx"
Cohesion: 0.11
Nodes (23): AppSettings, BAND_KEYS, bandsSchema, BRAND_NAME, channelsSchema, criteriaSchema, criterionOptionSchema, criterionSchema (+15 more)

### Community 4 - "money.ts"
Cohesion: 0.12
Nodes (31): vitest@^5.1.0, vitest, add(), applyDiscount(), compactNumber(), CURRENCY_SCALE, currencyScale(), dec() (+23 more)

### Community 5 - "package.json"
Cohesion: 0.12
Nodes (17): devDependencies, playwright-core@^1.65.0, postcss@^8.5.32, sharp@^0.35.5, tailwindcss@^4.3.5, @tailwindcss/postcss@^4.3.5, @types/node@^26.6.6, @types/react@^19.3.0 (+9 more)

### Community 6 - "dependencies"
Cohesion: 0.14
Nodes (14): dependencies, @ai-sdk/react@^4.0.174, date-fns@^4.4.0, jose@^6.2.17, lucide-react@^1.72.0, motion@^14.12.0, next@^15.5.29, react@^19.3.1 (+6 more)

### Community 7 - "steps"
Cohesion: 0.10
Nodes (19): AUTH_SECRET, DATABASE_URL, jobs, verify, name, on, pull_request, push (+11 more)

### Community 8 - "cn"
Cohesion: 0.06
Nodes (63): lucide-react, motion, react, AiInsightButton(), AiInsightProps, EASE, AssistantChat(), EASE (+55 more)

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

### Community 14 - "check-env.mjs"
Cohesion: 0.33
Nodes (3): addresses, problems, secret

### Community 18 - "sales-engine.ts"
Cohesion: 0.14
Nodes (21): annualValue(), Priority, renderMessage(), isSpacingDue(), pickBucket(), planSpacing(), randomInterval(), SpacingBucket (+13 more)

### Community 21 - "package.json"
Cohesion: 0.20
Nodes (9): @dnd-kit/core@^6.3.1, @dnd-kit/utilities@^3.2.2, name, prisma, seed, private, version, @dnd-kit/core (+1 more)

### Community 29 - "dashboard/page.tsx"
Cohesion: 0.05
Nodes (80): ai@^7.0.170, ai, maxDuration, POST(), AssistantPage(), dynamic, metadata, CartablePage() (+72 more)

### Community 33 - "followup.ts"
Cohesion: 0.33
Nodes (8): daysBetween(), decideFollowUp(), FollowUpDecision, FollowUpRules, rangeFromDays(), Channel, RANGE_LABELS, RangeKey

### Community 36 - "seed.ts"
Cohesion: 0.20
Nodes (11): @prisma/client@^6.19.3, D(), daysFromNow(), db, Context, D(), seedSalesEngine(), main() (+3 more)

### Community 37 - "cycle.ts"
Cohesion: 0.22
Nodes (10): computeCycle(), CycleConfig, CycleResult, CycleStatus, DAY_MS, daysBetween(), mean(), median() (+2 more)

### Community 41 - "temperature-form.tsx"
Cohesion: 0.24
Nodes (11): BAND_TONE, EASE, FollowUpInput, BandKey, BAND_LABEL_FA, bandFor(), evaluateTemperature(), TemperatureBands (+3 more)

## Knowledge Gaps
- **18 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `next` connect `auth.ts` to `guard`, `dependencies`, `cn`, `package.json`, `dashboard/page.tsx`?**
  _High betweenness centrality (0.061) - this node is a cross-community bridge._
- **Should `auth.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.06561085972850679 - nodes in this community are weakly interconnected._
- **Why does `zod` connect `guard` to `scopes.ts`, `auth.ts`, `settings-editor.tsx`, `dependencies`, `package.json`?**
  _High betweenness centrality (0.043) - this node is a cross-community bridge._
- **Should `guard` be split into smaller, more focused modules?**
  _Cohesion score 0.0934761441090555 - nodes in this community are weakly interconnected._
- **Why does `db` connect `guard` to `scopes.ts`, `auth.ts`, `settings-editor.tsx`, `sales-engine.ts`, `dashboard/page.tsx`?**
  _High betweenness centrality (0.038) - this node is a cross-community bridge._
- **Should `settings-editor.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.11384615384615385 - nodes in this community are weakly interconnected._
- **Should `money.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.11746031746031746 - nodes in this community are weakly interconnected._