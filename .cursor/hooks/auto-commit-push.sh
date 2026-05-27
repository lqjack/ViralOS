#!/usr/bin/env bash
# Cursor stop hook — auto commit + push when an agent run completes with local changes.
# See .cursor/hooks/README.md

set -u

log() {
  local msg="$1"
  local logfile="${CURSOR_HOOK_LOG:-.cursor/hooks/auto-commit.log}"
  mkdir -p "$(dirname "$logfile")"
  printf '%s %s\n' "$(date -u +"%Y-%m-%dT%H:%M:%SZ")" "$msg" >>"$logfile"
}

json_field() {
  local field="$1"
  if command -v jq >/dev/null 2>&1; then
    jq -r "$field // empty" 2>/dev/null || true
  fi
}

should_skip_secrets() {
  local path="$1"
  case "$path" in
    .env|.env.*|*.pem|*.key|credentials.json|secrets.json|id_rsa|id_ed25519)
      return 0
      ;;
  esac
  return 1
}

infer_commit_type() {
  local branch="$1"
  local transcript="$2"

  if [[ "$branch" =~ ^(fix|bugfix|hotfix)/ ]] || [[ "$branch" =~ /fix- ]] || [[ "$branch" =~ -fix$ ]]; then
    echo fix
    return
  fi

  if [[ -n "$transcript" && -f "$transcript" ]]; then
    if tail -n 80 "$transcript" 2>/dev/null | grep -Eiq 'bug fix|fix bug|hotfix|修复|修 bug|fix:|bug:'; then
      echo fix
      return
    fi
    if tail -n 80 "$transcript" 2>/dev/null | grep -Eiq 'feat:|feature|新功能|新增'; then
      echo feat
      return
    fi
  fi

  local changed
  changed=$(git diff --name-only HEAD 2>/dev/null; git diff --name-only --cached 2>/dev/null; git ls-files --others --exclude-standard 2>/dev/null)
  if [[ -n "$changed" ]]; then
    local non_docs
    non_docs=$(echo "$changed" | grep -Ev '^docs/' || true)
    if [[ -z "$non_docs" ]]; then
      echo docs
      return
    fi
    if echo "$changed" | grep -Eq 'test|spec|__tests__' && ! echo "$changed" | grep -Ev 'test|spec|__tests__' | grep -q .; then
      echo test
      return
    fi
  fi

  echo feat
}

build_subject() {
  local type="$1"
  local changed="$2"
  local scope
  scope=$(echo "$changed" | awk -F/ '{print $1}' | sort -u | head -3 | paste -sd, -)
  if [[ -z "$scope" ]]; then
    scope="workspace"
  fi
  case "$type" in
    fix) printf 'fix(%s): resolve agent session changes' "$scope" ;;
    docs) printf 'docs(%s): update documentation' "$scope" ;;
    test) printf 'test(%s): update tests' "$scope" ;;
    *) printf 'feat(%s): ship agent session changes' "$scope" ;;
  esac
}

process_repo() {
  local root="$1"
  local status="$2"
  local transcript="$3"

  if [[ "$status" != "completed" ]]; then
    log "skip $root: status=$status"
    return 0
  fi

  if [[ "${CURSOR_AUTO_COMMIT:-1}" == "0" ]]; then
    log "skip $root: CURSOR_AUTO_COMMIT=0"
    return 0
  fi

  if [[ ! -d "$root" ]]; then
    return 0
  fi

  cd "$root" || return 0
  git rev-parse --git-dir >/dev/null 2>&1 || return 0

  if [[ -f .cursor/no-auto-commit ]]; then
    log "skip $root: .cursor/no-auto-commit present"
    return 0
  fi

  if [[ -n "$(git status --porcelain --untracked-files=no 2>/dev/null)" ]] || [[ -n "$(git ls-files --others --exclude-standard 2>/dev/null)" ]]; then
    :
  else
    log "skip $root: clean working tree"
    return 0
  fi

  # Stage all, then unstage sensitive paths
  git add -A 2>/dev/null || true
  while IFS= read -r path; do
    [[ -z "$path" ]] && continue
    if should_skip_secrets "$path"; then
      git reset HEAD -- "$path" 2>/dev/null || true
      log "unstaged secret-like path: $path"
    fi
  done < <(git diff --cached --name-only 2>/dev/null)

  if git diff --cached --quiet 2>/dev/null; then
    log "skip $root: nothing staged after secret filter"
    return 0
  fi

  local branch type subject body changed
  branch=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo unknown)
  changed=$(git diff --cached --name-only 2>/dev/null || true)
  type=$(infer_commit_type "$branch" "$transcript")
  subject=$(build_subject "$type" "$changed")

  body="Automated commit via Cursor stop hook after completed agent run.

Do not amend unless you explicitly requested it."

  if ! git commit -m "$(cat <<EOF
$subject

$body
EOF
)"; then
    log "commit failed in $root on branch $branch"
    return 0
  fi

  log "committed in $root: $subject"

  mkdir -p "$root/.cursor/hooks"
  printf 'root=%s\nsha=%s\nts=%s\n' "$root" "$(git rev-parse HEAD 2>/dev/null || echo unknown)" "$(date +%s)" \
    >"$root/.cursor/hooks/.session-committed"

  if [[ "${CURSOR_AUTO_PUSH:-1}" == "0" ]]; then
    log "skip push $root: CURSOR_AUTO_PUSH=0"
    return 0
  fi

  if git rev-parse --abbrev-ref '@{u}' >/dev/null 2>&1; then
    if git push 2>>"${CURSOR_HOOK_LOG:-.cursor/hooks/auto-commit.log}"; then
      log "pushed $root ($branch)"
    else
      log "push failed $root ($branch) — fix remote/auth manually"
    fi
  else
    if git push -u origin HEAD 2>>"${CURSOR_HOOK_LOG:-.cursor/hooks/auto-commit.log}"; then
      log "pushed $root with -u origin HEAD"
    else
      log "push -u failed $root — set upstream manually"
    fi
  fi

  return 0
}

main() {
  local input
  input=$(cat)
  local status transcript
  status=$(printf '%s' "$input" | json_field '.status')
  transcript=$(printf '%s' "$input" | json_field '.transcript_path')

  local roots
  if command -v jq >/dev/null 2>&1; then
    roots=$(printf '%s' "$input" | jq -r '.workspace_roots[]? // empty' 2>/dev/null || true)
  fi

  if [[ -z "$roots" ]]; then
    roots="$(pwd)"
  fi

  while IFS= read -r root; do
    [[ -z "$root" ]] && continue
    process_repo "$root" "$status" "$transcript" || true
  done <<< "$roots"

  exit 0
}

main "$@"
