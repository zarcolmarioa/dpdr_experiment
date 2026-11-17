#!/usr/bin/env bash
# =============================================================================
# sync_to_pavlovia.sh — copy a COMMITTED version of this experiment into
# your local clone of the Pavlovia project, ready to commit and push there.
#
#   usage:  tools/sync_to_pavlovia.sh <pavlovia-folder> [<commit or branch>]
#   e.g.    tools/sync_to_pavlovia.sh ~/pavlovia/dpdr_experiment
#           tools/sync_to_pavlovia.sh ~/pavlovia/dpdr_experiment v4-study-design
#
# Two folders, never mixed (see SETUP.md §7):
#   this folder        the GitHub repository (public). Never put results here.
#   <pavlovia-folder>  a clone of the Pavlovia GitLab project (private).
#                      Pavlovia commits the results into its data/ folder.
#
# What it does:
#   1. checks <pavlovia-folder> is a git clone whose remote is on
#      gitlab.pavlovia.org, and is not this folder;
#   2. pulls the Pavlovia project first (Pavlovia adds result files as
#      commits, so a push without this is rejected);
#   3. exports the chosen commit (default HEAD) of THIS repository — only
#      committed files, nothing untracked — minus the two old stimulus sets
#      (lum_p05, contrast_local; not used, ~160 MB);
#   4. copies it over <pavlovia-folder>, deleting files that no longer
#      exist here, but NEVER touching: .git/, the results (data/*.csv,
#      data/*.log), config.json and lib/ (both Pavlovia's own);
#   5. writes DEPLOYED_COMMIT.txt (which commit is deployed, for the launch
#      checklist) and stages everything. It does NOT commit or push: it
#      prints the two commands for that, so you can check first.
# =============================================================================
set -euo pipefail

if [ $# -lt 1 ]; then
  sed -n '4,8p' "$0"; exit 1
fi

SRC=$(git -C "$(dirname "$0")/.." rev-parse --show-toplevel)
DEST=$(cd "$1" && pwd)
REF=${2:-HEAD}

# --- 1. Safety checks ---------------------------------------------------------
if [ "$DEST" = "$SRC" ] || [[ "$DEST/" == "$SRC/"* ]]; then
  echo "ERROR: $DEST is (inside) this GitHub folder. Use a separate clone of" >&2
  echo "       the Pavlovia project — see SETUP.md §7." >&2
  exit 1
fi
if ! git -C "$DEST" rev-parse --git-dir >/dev/null 2>&1; then
  echo "ERROR: $DEST is not a git clone. Clone the Pavlovia project first:" >&2
  echo "       git clone https://gitlab.pavlovia.org/<user>/<project>.git" >&2
  exit 1
fi
REMOTE=$(git -C "$DEST" remote get-url origin 2>/dev/null || true)
case "$REMOTE" in
  *gitlab.pavlovia.org*) ;;
  *) echo "ERROR: the remote of $DEST is '$REMOTE', not gitlab.pavlovia.org." >&2
     echo "       Refusing to copy into it." >&2
     exit 1 ;;
esac
if ! command -v rsync >/dev/null; then
  echo "ERROR: rsync is not installed (sudo apt install rsync)." >&2; exit 1
fi
COMMIT=$(git -C "$SRC" rev-parse --verify "$REF^{commit}")
if [ -n "$(git -C "$SRC" status --porcelain --untracked-files=no)" ]; then
  echo "NOTE: this folder has uncommitted changes. They are NOT copied —"
  echo "      only commit ${COMMIT:0:7} ($REF) is."
fi

# --- 2. Bring the Pavlovia clone up to date (results arrive as commits) ------
echo "Pulling $REMOTE ..."
git -C "$DEST" pull --ff-only

# --- 3. Export the committed files -------------------------------------------
TMP=$(mktemp -d)
trap 'rm -rf "$TMP"' EXIT
git -C "$SRC" archive "$COMMIT" | tar -x -C "$TMP"
rm -rf "$TMP/data/sets/lum_p05" "$TMP/data/sets/contrast_local"

# --- 4. Copy, protecting Pavlovia's own files and the results -----------------
rsync -a --delete \
  --exclude '/.git/' \
  --exclude '/data/*.csv' \
  --exclude '/data/*.log' \
  --exclude '/config.json' \
  --exclude '/lib/' \
  "$TMP/" "$DEST/"

# --- 5. Record what is deployed, stage --------------------------------------
{
  echo "commit:  $COMMIT"
  echo "ref:     $REF"
  echo "from:    $(git -C "$SRC" remote get-url origin 2>/dev/null || echo "$SRC")"
  echo "synced:  $(date -u +%Y-%m-%dT%H:%M:%SZ)"
} > "$DEST/DEPLOYED_COMMIT.txt"

git -C "$DEST" add -A
echo
echo "Staged in $DEST:"
git -C "$DEST" status --short | head -40
N=$(git -C "$DEST" status --short | wc -l)
[ "$N" -gt 40 ] && echo "  ... ($N changes in all)"
echo
echo "Check the list above, then:"
echo "  cd \"$DEST\""
echo "  git commit -m \"Deploy ${COMMIT:0:7}\""
echo "  git push"
