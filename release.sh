#!/bin/bash
set -e

# ─────────────────────────────────────────────────────────────────────────────
# Release Script for mermaid-diagram-enhancements
#
# Automates the release process:
# 1. Display current version
# 2. Prompt for next version (supports: patch, minor, major, or x.y.z)
# 3. Update package.json versions
# 4. Commit and tag in git
# 5. (optional) Push to remote
# ─────────────────────────────────────────────────────────────────────────────

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$SCRIPT_DIR"
SDK_PKG="$ROOT_DIR/mermaid-diagram-pan-zoom/package.json"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# ─────────────────────────────────────────────────────────────────────────────
# Helper Functions
# ─────────────────────────────────────────────────────────────────────────────

log_info() {
  echo -e "${BLUE}ℹ${NC} $*"
}

log_success() {
  echo -e "${GREEN}✓${NC} $*"
}

log_error() {
  echo -e "${RED}✗${NC} $*" >&2
}

log_warning() {
  echo -e "${YELLOW}⚠${NC} $*"
}

# Read version from package.json
get_current_version() {
  grep '"version"' "$SDK_PKG" | head -1 | sed 's/.*"version": "\(.*\)".*/\1/'
}

# Validate semver version
is_valid_semver() {
  [[ $1 =~ ^[0-9]+\.[0-9]+\.[0-9]+(-[\w.]+)?$ ]]
}

# Validate git state (no uncommitted changes)
check_git_state() {
  if ! git -C "$ROOT_DIR" diff-index --quiet HEAD --; then
    log_error "Working directory has uncommitted changes. Please commit or stash first."
    exit 1
  fi
}

# ─────────────────────────────────────────────────────────────────────────────
# Main Release Flow
# ─────────────────────────────────────────────────────────────────────────────

main() {
  echo
  echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}"
  echo -e "${BLUE}  📦 Release: mermaid-diagram-enhancements${NC}"
  echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}"
  echo

  # 1. Display current version
  CURRENT_VERSION=$(get_current_version)
  log_info "Current version: ${YELLOW}v${CURRENT_VERSION}${NC}"
  echo

  # 2. Check git state
  log_info "Checking git state..."
  check_git_state
  log_success "Git state clean"
  echo

  # 3. Get next version (from param or prompt)
  if [[ -n "$1" ]]; then
    VERSION_INPUT="$1"
    log_info "Version input: ${YELLOW}${VERSION_INPUT}${NC} (from argument)"
    echo
  else
    echo -e "Enter next version or bump type:"
    echo -e "  • ${YELLOW}patch${NC}      - Bump patch version (${CURRENT_VERSION:0:-1}x)"
    echo -e "  • ${YELLOW}minor${NC}      - Bump minor version (x.${CURRENT_VERSION:2}.0)"
    echo -e "  • ${YELLOW}major${NC}      - Bump major version (x.0.0)"
    echo -e "  • ${YELLOW}x.y.z${NC}      - Specific version (e.g., 1.2.3)"
    echo

    read -p "Version or bump type: " VERSION_INPUT

    if [[ -z "$VERSION_INPUT" ]]; then
      log_error "Version input cannot be empty"
      exit 1
    fi
    echo
  fi

  # Validate input
  if [[ ! "$VERSION_INPUT" =~ ^(patch|minor|major)$ ]] && ! is_valid_semver "$VERSION_INPUT"; then
    log_error "Invalid version format: $VERSION_INPUT"
    echo "Expected: patch, minor, major, or x.y.z"
    exit 1
  fi

  # Determine new version
  if [[ "$VERSION_INPUT" =~ ^(patch|minor|major)$ ]]; then
    log_info "Bumping version (${YELLOW}$VERSION_INPUT${NC})..."
    NEW_VERSION=$(node "$ROOT_DIR/scripts/prepare-publish.js" "$VERSION_INPUT" 2>&1 | grep "Ready to publish" | sed 's/.*v\(.*\)\./\1/')
  else
    NEW_VERSION="$VERSION_INPUT"
    log_info "Setting version to ${YELLOW}v${NEW_VERSION}${NC}..."
  fi

  # Re-extract new version to be sure
  if [[ "$NEW_VERSION" =~ ^[0-9]+\.[0-9]+\.[0-9]+(-[\w.]+)?$ ]]; then
    NEW_VERSION="$VERSION_INPUT"
  fi

  echo

  # 4. Run prepare-publish.js (handles version bump and dependency replacement)
  log_info "Updating package versions..."
  node "$ROOT_DIR/scripts/prepare-publish.js" "$VERSION_INPUT"
  echo

  NEW_VERSION=$(get_current_version)
  log_success "Packages updated to v${NEW_VERSION}"
  echo

  # 5. Commit changes
  log_info "Staging changes..."
  git -C "$ROOT_DIR" add .
  log_success "Changes staged"
  echo

  log_info "Creating commit..."
  git -C "$ROOT_DIR" commit -m "chore: release v${NEW_VERSION}"
  log_success "Commit created"
  echo

  # 6. Create tag
  log_info "Creating tag..."
  git -C "$ROOT_DIR" tag "v${NEW_VERSION}"
  log_success "Tag created: ${YELLOW}v${NEW_VERSION}${NC}"
  echo

  # 7. Offer to push
  echo -e "${YELLOW}⚠${NC}  Review your changes before pushing!"
  echo
  read -p "Push to remote? (y/n) [n]: " PUSH_CONFIRM
  echo

  if [[ "$PUSH_CONFIRM" =~ ^[Yy]$ ]]; then
    log_info "Pushing to remote..."
    git -C "$ROOT_DIR" push origin main --tags
    log_success "Pushed to remote"
    echo
    log_success "GitHub Actions will publish to npm on tag push"
  else
    log_warning "Skipped remote push"
    echo
    log_info "To push later, run:"
    echo "  git -C \"$ROOT_DIR\" push origin main --tags"
  fi

  echo

  # 8. Remind about restore
  echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}"
  log_success "Release v${NEW_VERSION} complete!"
  echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}"
  echo

  log_info "After npm publish completes, restore workspace dependencies:"
  echo "  node $ROOT_DIR/scripts/prepare-publish.js --restore"
  echo
}

main "$@"
