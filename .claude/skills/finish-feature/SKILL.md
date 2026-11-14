---
name: finish-feature
description: Wrap up a feature branch in this repo. Use when the user says a feature is done, "finish", "open a PR" or "merge it". Verifies the build, updates docs/PLAN.md, pushes the branch and opens a pull request.
---

# Finish a feature

1. **Confirm the branch.** `git branch --show-current` must not be `main`. If it is, stop and use `start-feature` instead.
2. **Verify.** Once the Vite project exists, run `npm run build` and fix any errors. For visual work, run `npm run dev` and check the result in the browser at desktop and phone width. If a check cannot be run, say so rather than claiming success.
3. **Update `docs/PLAN.md`.**
   - Tick the milestone checkbox only if its "done when" condition is fully met.
   - Add new decisions under "Decisions" and new questions under "Open questions".
   - If the content changed, keep `src/cv-data.json` and the plan consistent with the content rules in `CLAUDE.md` (no employer names, phone or email).
4. **Commit.** Stage the relevant files by name (not `git add -A` blindly), check `git status`, and commit with an imperative message.
5. **Push.** `git push -u origin <branch>`.
6. **Open a PR.** `gh pr create --base main` with a short title and a description that covers what changed, how it was checked, and the milestone it advances.
7. **Merge only when the user asks.** After they confirm, squash-merge, then return to `main`, pull, and delete the local branch.

Report the PR link and the one next step (usually the next milestone item in the plan).
