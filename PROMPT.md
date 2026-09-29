# Ralph loop prompt (fed to the agent on every iteration)

You are working on the Astro rebuild of audiobookspeedcalculator.org. Read `README.md`, `SOLUTION.md`, `RALPH.md` and `ralphloop.md` first, and follow `ralphloop.md` exactly.

Each iteration:
1. Open `RALPH.md` and find the first unchecked task (`- [ ]`) that is not marked **(human)** and whose earlier tasks are done.
2. Do only that task. Keep the change small.
3. Run `npm run build` and the task's verify step. If either fails, fix it; do not move on.
4. Tick the box, append one dated line to the `Progress log` in `RALPH.md`, then `git add -A` and commit locally (never push, never deploy).
5. Stop the iteration. The loop restarts you with this same prompt.

Rules: never touch the WordPress site, never add redirects from WordPress URLs, never change a URL, title, meta tag or schema unless the task says so, and keep the design identical to the live site. If blocked or unsure, write the question under `Blockers` in `RALPH.md` and stop. At the end of a phase, or when the next task is marked (human), stop for review. When every non-human task is checked, write `LOOP_COMPLETE` on its own line in `RALPH.md`.
