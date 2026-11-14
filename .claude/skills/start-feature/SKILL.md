---
name: start-feature
description: Start any new feature, milestone step or fix in this repo. Use before writing code, whenever the user says "new feature", "let's start M2", "add X" or "fix Y". Creates a fresh branch from an up-to-date main and links the work to docs/PLAN.md.
---

# Start a new feature

Every piece of work starts on its own branch. Never work directly on `main`.

1. **Check the state.** Run `git status -sb` and `git branch --show-current`. If there are uncommitted changes, stop and ask whether to commit, stash or discard them. Do not discard anything without asking.
2. **Update main.** `git checkout main`, then `git pull --ff-only` (skip the pull if there is no remote main yet or the repo has no commits). If the repo has no commits at all, tell the user the first commit on `main` is needed before branching, and offer to make it.
3. **Read `docs/PLAN.md`.** Find the milestone the work belongs to (M1-M5) and any decisions or open questions that affect it.
4. **Name the branch.** `feature/<short-slug>` for new work, `fix/<short-slug>` for bug fixes, `docs/<short-slug>` for docs only. Lowercase, hyphens, 2-4 words (e.g. `feature/m1-skeleton`, `feature/character-low-poly`). Confirm the name with the user if it is not obvious.
5. **Create it.** `git checkout -b <branch-name>`.
6. **State the scope.** Say in two or three lines what this branch will do and what "done" means, using the milestone's wording from the plan. For work with more than three steps, make a task list.
7. **Work in small commits** with imperative messages. Run `npm run build` (once the project exists) before the feature is declared done.

When the work is complete, use the `finish-feature` skill.
