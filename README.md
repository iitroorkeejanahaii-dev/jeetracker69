# JEETracker69 - A Complete JEE Exam Preparation Operating System

> The app remembers everything. The student remembers nothing.

## What is JEETracker69?

JEETracker69 (formerly JEE OS) is a production-grade, privacy-first JEE preparation platform that automatically tracks your progress so you can focus on learning. Every interaction reduces friction—from logging mistakes to scheduling revisions.

## Philosophy

- **Everything is automatic**: Progress updates, streak tracking, revision scheduling
- **Nothing is manual**: No manual entry of hours, completion %, or readiness scores
- **Minimal logging**: Get to studying in <30 seconds
- **Zero feature bloat**: Every feature directly improves JEE prep
- **Gamification when it matters**: Streak counter, readiness scores, not arbitrary points

## Key Features

### Dynamic Chapter Management
- Create chapters with one dialog (subject, name, lecture count, sheets, DPPs, PYQs)
- Auto-generates all resources (no manual creation)
- Full chapter lifecycle: create, track, delete
- First-time migration from seed data

### Revision Engine
- Automatic scheduling after each revision
- Configurable intervals (1d → 3d → 7d → 14d → ...)
- Dashboard shows today's revisions, overdue count
- Track revision consistency across chapters

### Mistake Vault
- Log mistakes with concept, error type, difficulty, importance (1-5)
- Filter by: status (pending/revised/mastered), type, difficulty, chapter
- Sort by: recent, importance, revision count
- Mark starred for quick access
- Detailed tracking: image, solution, correction notes

### 4-Widget Dashboard
1. **Today's Mission** — Questions solved, hours studied
2. **Revisions Due** — Today + overdue count
3. **Pending Mistakes** — Awaiting revision
4. **Current Streak** — Days studied

Everything else is secondary.

### Auto-Progress Updates
- Toggle a lecture/sheet/DPP → automatic chapter refresh
- Marks activity (hours, questions) → streak update
- No extra clicks, no manual tracking

### Analytics
- 30-day study trends (hours, questions)
- Subject readiness breakdown
- Chapter rankings (strongest, weakest, most ignored)
- Mistake distribution by type

## Tech Stack

- **Runtime**: TanStack Start (React 19 + Vite)
- **State**: Zustand with persistence
- **UI**: Radix UI + Tailwind CSS + Lucide Icons
- **Forms**: React Hook Form + Zod
- **Charts**: Recharts
- **Database**: LocalStorage (first-party, no backend)

## Getting Started

### Install
```bash
npm install
```

### Development
```bash
npm run dev
```

### Build
```bash
npm run build
```

### Format & Lint
```bash
npm run format
npm run lint
```

## Project Structure

```
src/
├── lib/jee/
│   ├── types.ts              # Type definitions
│   ├── store.ts              # Zustand state management
│   ├── migration.ts           # Seed to dynamic migration
│   ├── readiness.ts           # Scoring algorithm
│   ├── revisionScheduler.ts   # Revision scheduling
│   ├── chapterQueries.ts      # Chapter utilities
│   └── seed.ts               # Seed data (Physics, Chemistry, Math)
├── routes/
│   ├── index.tsx             # Dashboard (4 widgets)
│   ├── c/$cid.tsx            # Chapter detail (tabs)
│   ├── s/$sid.tsx            # Subject overview
│   ├── mistakes.tsx          # Mistake vault
│   ├── analytics.tsx         # Analytics
│   ├── revision.tsx          # Revision engine
│   ├── goals.tsx             # Goals tracking
│   └── settings.tsx          # User settings
├── components/jee/
│   ├── AppShell.tsx          # Main layout
│   ├── CreateChapterDialog.tsx # Chapter creation
│   ├── QuickAdd.tsx          # Quick add dialog
│   └── ...                   # UI components
└── styles.css                # Tailwind + custom CSS
```

## Core Concepts

### ChapterState
Each chapter stores:
- Metadata (name, subject, created date)
- Resources (auto-generated lectures, sheets, DPPs, PYQs)
- Progress (completed items, confidence level)
- Revisions (scheduled, with auto-advancement)
- Concepts (custom topic tracking)

### Mistake
Comprehensive mistake tracking:
- Question metadata (subject, chapter, resource, number)
- Error classification (type, difficulty, importance)
- Corrections (wrong approach, correct method)
- Media (question image, solution image)
- Scheduling (next revision date, revision count)

### Revision Scheduling
Automatic advancement:
1. User completes revision #1 → schedules #2 in 3 days
2. User completes revision #2 → schedules #3 in 7 days
3. User completes revision #3 → long-term scheduling (14+ days)

## Data Storage

- **Storage Key**: `jee-os-v2` (Zustand persist)
- **Scope**: Browser LocalStorage (no backend required)
- **Export**: `useJeeStore.getState().exportData()`
- **Import**: `useJeeStore.getState().importData(data)`

## Performance Considerations

- ✅ Memoized readiness calculations
- ✅ Query utilities avoid O(n²) lookups
- ✅ Batch state updates in Zustand
- ✅ Lazy routes with TanStack Router
- ✅ Responsive grid layouts (no deep nesting)

## Browser Support

- Chrome/Edge 120+
- Firefox 120+
- Safari 17+
- Mobile browsers (iOS Safari, Chrome Android)

## Privacy

- ✅ All data stored locally (no server)
- ✅ No tracking, no analytics
- ✅ No third-party scripts
- ✅ HTTPS ready

## Contributing

See [REFACTOR_SUMMARY.md](./REFACTOR_SUMMARY.md) for architecture details.

## License

MIT

---

**Mission**: Build the most efficient, frictionless JEE progress tracker.

**Mantra**: The app remembers everything. The student remembers nothing.
