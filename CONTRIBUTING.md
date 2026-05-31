# Contributing

Thanks for your interest in contributing to react-slot-scheduler!

## Getting Started

```bash
git clone https://github.com/omidrahmati2000/react-slot-scheduler
cd react-slot-scheduler
npm install
npm run build
```

## Development

```bash
# Build the library
npm run build

# Type check
npm run typecheck

# Run tests
npm run test
npm run test:coverage

# Run the demo app
cd example && npm install && npm run dev
```

## Project Structure

```
src/
  components/BookingCalendar.tsx  — main component
  components/GanttScheduler.tsx   — task/resource timeline engine
  styles/calendar.css             — CSS variables & layout
  styles/gantt.css                — gantt/timeline styles
  styles/defaultTheme.ts          — default theme tokens
  types.ts                        — all exported types
  adapters.ts                     — task/resource adapter helpers
  utils/date.ts                   — date/time helpers
  index.ts                        — public exports

example/                          — demo app (Vite + React)
  src/demos/                      — Appointment, Meeting Room, Task Timeline, Resource Planner, Theme Playground
  src/data/                       — sample schedule data

media/                            — screenshots for README
```

## Pull Requests

1. Fork the repo and create a branch: `git checkout -b feat/my-feature`
2. Make your changes
3. Ensure `npm run typecheck` and `npm run test` pass
4. Update `CHANGELOG.md` for user-facing changes
5. Submit a PR with a clear description

## Reporting Issues

Please include:
- Package version (`npm list @omidrahmati/react-slot-scheduler`)
- React version
- Minimal reproduction (CodeSandbox preferred)
- Expected vs actual behavior

## AI-Assisted Contributions

- AI tools are allowed for drafting, but every change must be reviewed and verified by the contributor.
- Do not paste secrets, private data, or proprietary code into external AI tools.
- Keep final wording and technical claims accurate; remove hallucinated APIs/behaviors before submitting PRs.
- Contributors are responsible for license compatibility and originality of submitted code/content.

## Release Process

Use this process for stable releases (for example `1.0.0`):

1. Ensure the branch is clean and synced
2. Run quality gates:
   - `npm run typecheck`
   - `npm run test`
   - `npm run build`
   - `npm run pack:check`
3. Update release notes in `CHANGELOG.md`
4. Bump version:
   - `npm version 1.0.0 --no-git-tag-version` (or next semver target)
5. Commit:
   - `git add .`
   - `git commit -m "release: v1.0.0"`
6. Tag and push:
   - `git tag -a v1.0.0 -m "v1.0.0"`
   - `git push origin main --follow-tags`
