#!/bin/bash

# Function to output error messages
error() {
    echo "ERROR: $1" >&2
    exit 1
}

# Function to output information messages
info() {
    echo "INFO: $1"
}

# Ensure a version type is provided
if [ $# -eq 0 ]; then
    error "No version type provided. Use: $0 <patch|minor|major>"
fi

# Validate the version type
VERSION_TYPE=$1
if [[ ! $VERSION_TYPE =~ ^(patch|minor|major)$ ]]; then
    error "Invalid version type. Use: patch, minor, or major"
fi

# Ensure we're on the main branch
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
if [ "$CURRENT_BRANCH" != "main" ]; then
    error "Not on main branch. Please checkout main before publishing."
fi

# Ensure the working directory is clean
if [ -n "$(git status --porcelain)" ]; then
    error "Working directory is not clean. Please commit all changes before publishing."
fi

# Pull latest changes
info "Pulling latest changes from remote..."
git pull origin main || error "Failed to pull latest changes"

# Run tests
info "Running tests..."
npm test || error "Tests failed. Aborting publish."

# Bump version
info "Bumping $VERSION_TYPE version..."
npm version $VERSION_TYPE -m "Bump %s" || error "Failed to bump version"

# Get the new version number
NEW_VERSION=$(node -p "require('./package.json').version")
info "New version: $NEW_VERSION"

# Push changes and tags
info "Pushing changes and tags to remote..."
git push && git push --tags || error "Failed to push changes to remote"

# Publish to npm
info "Publishing to npm..."
npm publish || error "Failed to publish to npm"

info "Successfully published version $NEW_VERSION to npm!"
