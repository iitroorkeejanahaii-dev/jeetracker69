# JEE OS v2 — "Operating System" Refactor

Every screen answers: *"What should I do next to get closer to my dream college?"*

This is a large restructure. I'll ship it in one pass, keeping all existing data (chapters, mistakes, revisions) intact and extending the store additively.

---

## 1. Data model additions (`src/lib/jee/store.ts` + `types.ts`)

Additive fields — no breaking changes to persisted data:

- `destination`: `{ college, targetRank, targetPercentile, targetMarksJan, targetMarksApr, examDate, quote? }`
- `dreamColleges[]`: `{ id, name, targetRank, requiredMarks, rating }`
- `currentMission`: `{ weekStart, chapterIds[], completed }` — the week's chosen chapters
- `ChapterState` extensions:
  - `priority: 'normal' | 'focus' | 'priority' | 'critical'`
  - `concepts[]`: `{ id, title, done }` (mastery)
  - `lastActivity`: `{ type: 'lecture'|'exercise'|'pyq'|'revision'|'concept', id, label, at }` (for Continue)
- `hallOfFocus[]`: exactly 3 chapter ids (auto-derived if unset from priority + due revisions)

Concept seeds live in `src/lib/jee/concepts.ts` (a lookup by chapter id → default concept list; fallback empty array for unseeded chapters).

Dependency graph in `src/lib/jee/dependencies.ts` → `Record<chapterId, chapterId[]>` (seed common chains: Electrostatics → Current → Magnetism; Limits → Derivatives → Integrals; GOC → Isomerism → Reaction Mechanisms; etc.).

## 2. Dashboard rebuild (`src/routes/index.tsx`)

New vertical order, nothing else:

1. **DestinationCard** — college, target rank/percentile/marks, days remaining (big countdown), overall progress bar, quote.
2. **CurrentMissionCard** — the week's picked chapters with progress bars, Continue buttons, "Complete Mission" at week end. Empty state → "Pick this week's chapters" CTA opening a modal chapter picker.
3. **HallOfFocus** — exactly 3 chapter tiles with soft gold glow, Continue buttons.
4. **TodayStrip** — 4 compact tiles: Questions today · Revisions due · Study time · Quick Continue (resumes `lastActivity` globally).
5. **Heatmap** kept, moved to bottom.

Old MissionControl bits (subject rings, mission list) removed from dashboard — subject overviews still live on subject pages.

## 3. Progress bars replace rings

New component `src/components/jee/ProgressBar.tsx` (thin, rounded, animated fill, optional label + %). Replace `ProgressRing` usages on Dashboard, Subject pages, Mission cards, Chapter header. Keep `ProgressRing` file for now (unused, easy to remove later) so no import breaks.

## 4. Priority system

Chapter header gets a priority picker (Normal / Focus / Priority / Critical). Visual:
- Normal — no accent
- Focus — soft ring
- Priority — gold border
- Critical — gold border + subtle pulse glow

Priority chapters float to top of subject list and inform Hall of Focus auto-selection.

## 5. Mastery tab (`src/routes/c.$cid.tsx`)

Add a "Mastery" tab alongside existing tabs. Renders `concepts[]` with checkboxes. Seed defaults from `concepts.ts`; user can add/remove. Mastery % feeds into readiness (replaces or supplements Lectures weight — see §11).

## 6. Dependency tree

Inside chapter workspace, a "Flow" panel renders a vertical arrow-connected list: prerequisites above, current chapter highlighted, next chapters below. Clean CSS-only (no graph lib).

## 7. Organic Chemistry Hub (`src/routes/organic.tsx`)

New route. Two sections:
- **Named Reactions** — expandable cards (Aldol, Cannizzaro, Sandmeyer, Hoffmann, Wurtz, Reimer-Tiemann, Friedel-Crafts, etc.). Each: mechanism note, done toggle, PYQ count field.
- **Reagent Vault** — expandable reagents (LiAlH4, NaBH4, KMnO4, PCC, SOCl2, DIBAL, O3, mCPBA, etc.). Each expands: Uses, Exceptions, Conversions, PYQ notes.

Seed data in `src/lib/jee/organic.ts`. State stored under `store.organic`.

## 8. Auto-lectures for standard resources

`src/lib/jee/lectureTemplates.ts` maps `(subject, standardResource) → lectureCount`. On chapter open, if `lectures[]` empty and a default template exists, auto-populate "Lecture 1..N". Custom resources still manual.

## 9. Dream Colleges page (`src/routes/colleges.tsx`)

CRUD list of dream colleges with rank/marks/rating. On mock test entries, compute badge per college: Reach / Safe / Dream / Impossible using thresholds against `marks`.

## 10. Continue button

- Every chapter card shows `Continue →` linking to `lastActivity` deep link (defaults to chapter root).
- Global **Quick Continue** on dashboard resumes the newest `lastActivity` across all chapters.
- Store: update `lastActivity` on every toggle (lecture/pyq/concept/revision).

## 11. Readiness weight tweak (`src/lib/jee/readiness.ts`)

Add Mastery signal. New weights: Lectures 15 · Notes 10 · Sheets 20 · Resources 10 · PYQs 15 · Revisions 15 · Mastery 10 · Mistakes 5. Empty-chapter guarantee (0% when nothing done) preserved.

## 12. Premium polish

- Motion: micro-fade/slide on cards (`animate-fade-in`, staggered).
- Gold accent token `--gold: oklch(0.82 0.14 85)` for priority.
- Glass utility class `.glass` in `styles.css` (bg-white/[0.03] + backdrop-blur-xl + border-white/8).
- Tighter type scale, consistent 24px section rhythm.
- Route transitions: `animate-fade-in` on `<Outlet />`.

## 13. Navigation updates (`AppShell.tsx`)

Add nav entries: Colleges, Organic. Reorder: Dashboard · Physics · Chemistry · Maths · Organic · Mistakes · Revision · Analytics · Colleges · Calendar · Goals · Settings.

---

## Files touched

New: `ProgressBar.tsx`, `DestinationCard.tsx`, `CurrentMissionCard.tsx`, `HallOfFocus.tsx`, `PriorityBadge.tsx`, `DependencyTree.tsx`, `MasteryPanel.tsx`, `routes/organic.tsx`, `routes/colleges.tsx`, `lib/jee/concepts.ts`, `lib/jee/dependencies.ts`, `lib/jee/organic.ts`, `lib/jee/lectureTemplates.ts`.

Modified: `store.ts`, `types.ts`, `readiness.ts`, `routes/index.tsx`, `routes/c.$cid.tsx`, `routes/s.$sid.tsx`, `components/jee/AppShell.tsx`, `styles.css`.

## Out of scope (say the word and I'll add)

- Supabase sync (still local-first)
- Timer overhaul / Pomodoro
- AI-generated concept lists per chapter
- Real Notion-style rich editor for notes

Approve and I'll build it end-to-end in one pass.
