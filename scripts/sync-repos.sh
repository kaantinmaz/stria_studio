#!/usr/bin/env bash
#
# Sync the monorepo's two app folders to their standalone GitHub repos:
#   frontend/  ->  remote "site"   (Stria-Studio-Ankara/stria_site)  main
#   backend/   ->  remote "admin"  (Stria-Studio-Ankara/stria-admin) main
#
# History-preserving mirror via `git subtree split`. Run from anywhere in the
# repo, on a committed tree. Usage:
#   ./scripts/sync-repos.sh            # push both
#   ./scripts/sync-repos.sh site       # push only the site (frontend)
#   ./scripts/sync-repos.sh admin      # push only the admin (backend)
#   FORCE=1 ./scripts/sync-repos.sh    # force-push (only if a repo diverged)
#
# ponytail: subtree-split mirror, not a submodule/monorepo-tool — swap for one
# if these repos ever need to push back changes.
set -euo pipefail

cd "$(git rev-parse --show-toplevel)"

# subtree split refuses to run cleanly on a dirty tree — fail early and loud.
if [ -n "$(git status --porcelain)" ]; then
  echo "✗ Working tree is dirty. Commit or stash first, then re-run." >&2
  exit 1
fi

push_flags=""
[ "${FORCE:-0}" = "1" ] && push_flags="--force"

sync() {
  local prefix=$1 remote=$2
  echo "→ splitting ${prefix}/ …"
  local sha
  sha=$(git subtree split --prefix="$prefix")   # progress on stderr, sha on stdout
  echo "→ pushing ${prefix}/ ($sha) to '${remote}' main …"
  git push $push_flags "$remote" "${sha}:main"
  echo "✓ ${remote} updated."
}

target="${1:-both}"
case "$target" in
  site)  sync frontend site ;;
  admin) sync backend admin ;;
  both)  sync frontend site; sync backend admin ;;
  *) echo "usage: $0 [site|admin|both]  (env FORCE=1 to force-push)" >&2; exit 2 ;;
esac

echo "Done."
