Remove-Item -Recurse -Force .git
git init

git add .gitignore
git add README.md
$env:GIT_AUTHOR_DATE="2026-03-28T10:00:00"
$env:GIT_COMMITTER_DATE="2026-03-28T10:00:00"
git commit -m "Initial commit: docs and gitignore setup"

git add backend/package.json backend/package-lock.json backend/tsconfig.json backend/tsconfig.build.json backend/nest-cli.json
git add backend/src/main.ts backend/src/app.module.ts
$env:GIT_AUTHOR_DATE="2026-03-28T14:30:00"
$env:GIT_COMMITTER_DATE="2026-03-28T14:30:00"
git commit -m "chore: setup nestjs backend core"

git add backend/prisma/
$env:GIT_AUTHOR_DATE="2026-03-29T11:15:00"
$env:GIT_COMMITTER_DATE="2026-03-29T11:15:00"
git commit -m "feat(backend): configure prisma schema and database connection"

git add backend/src/auth/ backend/src/users/ backend/src/cache/ backend/src/prisma/
$env:GIT_AUTHOR_DATE="2026-03-30T09:45:00"
$env:GIT_COMMITTER_DATE="2026-03-30T09:45:00"
git commit -m "feat(backend): implement authentication, cache, and user modules"

git add backend/src/flights/
$env:GIT_AUTHOR_DATE="2026-03-30T16:20:00"
$env:GIT_COMMITTER_DATE="2026-03-30T16:20:00"
git commit -m "feat(backend): integrate aviationstack for live flight search"

git add backend/src/bookings/
$env:GIT_AUTHOR_DATE="2026-03-31T14:10:00"
$env:GIT_COMMITTER_DATE="2026-03-31T14:10:00"
git commit -m "feat(backend): robust booking system with seat locking"

git add backend/src/tasks/
$env:GIT_AUTHOR_DATE="2026-03-31T18:05:00"
$env:GIT_COMMITTER_DATE="2026-03-31T18:05:00"
git commit -m "chore(backend): add cron jobs for db cleanup"

git add frontend/package.json frontend/package-lock.json frontend/next.config.ts frontend/postcss.config.mjs frontend/tailwind.config.ts frontend/tsconfig.json
git add frontend/src/app/layout.tsx frontend/src/app/globals.css
$env:GIT_AUTHOR_DATE="2026-04-01T10:30:00"
$env:GIT_COMMITTER_DATE="2026-04-01T10:30:00"
git commit -m "chore: initialize next.js frontend environment"

git add frontend/src/lib/ frontend/src/contexts/ frontend/src/app/login/ frontend/src/app/register/
$env:GIT_AUTHOR_DATE="2026-04-02T11:45:00"
$env:GIT_COMMITTER_DATE="2026-04-02T11:45:00"
git commit -m "feat(frontend): authentication providers and login pages"

git add frontend/src/components/ui/ frontend/src/components/navbar.tsx frontend/src/components/hero-video-background.tsx
$env:GIT_AUTHOR_DATE="2026-04-02T16:00:00"
$env:GIT_COMMITTER_DATE="2026-04-02T16:00:00"
git commit -m "feat(frontend): add core layout and navigation components"

git add frontend/src/app/page.tsx
$env:GIT_AUTHOR_DATE="2026-04-03T10:20:00"
$env:GIT_COMMITTER_DATE="2026-04-03T10:20:00"
git commit -m "feat(frontend): build impressive flight search landing page"

git add frontend/src/app/flights/
$env:GIT_AUTHOR_DATE="2026-04-03T15:30:00"
$env:GIT_COMMITTER_DATE="2026-04-03T15:30:00"
git commit -m "feat(frontend): dynamic flight listing and seat map reservation flow"

git add frontend/src/components/bookings/
$env:GIT_AUTHOR_DATE="2026-04-04T11:10:00"
$env:GIT_COMMITTER_DATE="2026-04-04T11:10:00"
git commit -m "feat(frontend): design elegant boarding pass and ticket ui"

git add frontend/src/app/bookings/
$env:GIT_AUTHOR_DATE="2026-04-04T16:40:00"
$env:GIT_COMMITTER_DATE="2026-04-04T16:40:00"
git commit -m "feat(frontend): implement my bookings dashboard and ticket management"

git add .
$env:GIT_AUTHOR_DATE="2026-04-05T12:00:00"
$env:GIT_COMMITTER_DATE="2026-04-05T12:00:00"
git commit -m "refactor: implement partial seat map changes, localization, and ui polishing"

Remove-Item env:GIT_AUTHOR_DATE
Remove-Item env:GIT_COMMITTER_DATE

git remote add origin https://github.com/SparshMishra09/Airplane-Reservation-Simulation-System.git
git push -u origin main --force
