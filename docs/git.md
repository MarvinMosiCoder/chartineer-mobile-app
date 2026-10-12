# Git remotes, merging, and pushing

Run these commands from the project root. Run each command separately and inspect its output before moving to the next one.

## Check the current repository

```powershell
git status
git branch -vv
git remote -v
```

The project uses `main`. Its GitHub repository is `https://github.com/MarvinMosiCoder/chartineer-mobile-app`.

## Configure the remote

If there is no remote named `origin`, add it:

```powershell
git remote add origin https://github.com/MarvinMosiCoder/chartineer-mobile-app.git
```

If `origin` exists but points to the wrong repository, update it:

```powershell
git remote set-url origin https://github.com/MarvinMosiCoder/chartineer-mobile-app.git
```

Check `git remote -v` afterward. Use your own repository URL if working in a fork.

To remove the local remote configuration:

```powershell
git remote remove origin
```

Removing a remote keeps your local files and commits and leaves the GitHub repository in place.

## Push main and set its upstream

After committing your intended changes:

```powershell
git push -u origin main
```

After that first successful push, `git push` uses the configured upstream. Keep `backend/.env` and `.env.local` ignored; commit migration files and the example environment file with placeholders.

`git pull` and `git push` are separate commands. A line such as `git pull git push ...` passes invalid arguments to `pull`.

## Push rejected: fetch first or non-fast-forward

These errors mean GitHub has commits your local branch needs to include. Start with a clean working tree by committing your intended edits or stashing them. Then fetch and merge:

```powershell
git fetch origin
```

```powershell
git merge origin/main -m "Merge GitHub main"
```

If Git reports `refusing to merge unrelated histories`, the local and online repositories were initialized separately. For this project, combine those histories with:

```powershell
git merge origin/main --allow-unrelated-histories -m "Merge GitHub main"
```

That option is for histories with no common ancestor. See [Git merge](https://git-scm.com/docs/git-merge#Documentation/git-merge.txt---allow-unrelated-histories).

When the merge succeeds, run `git push -u origin main`. If it reports conflicts, resolve them first.

## Resolve conflicts and complete the merge

List the conflicting files:

```powershell
git status
git diff --name-only --diff-filter=U
```

Open each conflicted file. Review the local and incoming versions, keep the intended result, and remove the `<<<<<<<`, `=======`, and `>>>>>>>` markers. Stage the reviewed files explicitly:

```powershell
git add -- README.md
```

Replace that example filename with each file you resolved. The current public Home is `src/app/(tabs)/index.tsx`; login and signup are `src/app/login.tsx` and `src/app/signup.tsx`. There is no root `src/app/index.tsx`. Dashboard remains `src/app/(tabs)/dashboard.tsx`, guarded for signed-in accounts. Preserve this structure when resolving conflicts and inspect both sides for new work. See [Routes and tabs](mobile-ui.md#routes-and-tabs).

Run the [project checks](troubleshooting.md#verification-commands), then complete the merge:

```powershell
git commit -m "Merge GitHub main"
```

Verify and push:

```powershell
git status
git push -u origin main
```

A completed merge has no unmerged files or pending merge message in `git status`. Retrying a push while conflicts remain cannot complete the merge.
