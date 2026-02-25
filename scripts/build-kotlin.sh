#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
WORKFLOW_ENGINE_DIR="${PROJECT_DIR}/../formbuilder/WorkflowEngine"

if [ ! -d "$WORKFLOW_ENGINE_DIR" ]; then
  echo "Error: WorkflowEngine not found at $WORKFLOW_ENGINE_DIR"
  exit 1
fi

echo "Building builder module..."
cd "$WORKFLOW_ENGINE_DIR"
./gradlew :builder:jsBrowserProductionWebpack -Pplatform=js --no-daemon

echo "Copying builder.js..."
mkdir -p "$PROJECT_DIR/public/lib"
find "$WORKFLOW_ENGINE_DIR/builder/build/distributions" -name "builder.js" | head -1 | xargs -I{} cp {} "$PROJECT_DIR/public/lib/builder.js"

echo "Building web module..."
./gradlew :web:jsBrowserProductionWebpack -Pplatform=js --no-daemon

echo "Copying web preview files..."
mkdir -p "$PROJECT_DIR/public/preview"
WEB_DIST="$WORKFLOW_ENGINE_DIR/web/build/distributions"
if [ -d "$WEB_DIST" ]; then
  cp -r "$WEB_DIST"/* "$PROJECT_DIR/public/preview/"
fi

echo "Done! Builder and preview files copied to public/"
