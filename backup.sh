#!/bin/bash
DATE=$(date +%Y%m%d-%H%M%S)
BACKUP_DIR="$HOME/Desktop/backups"
PROJECT_DIR="/Users/js/Dev/my-first-reactor"

echo "Creating backup: $DATE"
mkdir -p "$BACKUP_DIR"

tar -czf "$BACKUP_DIR/my-first-reactor-$DATE.tar.gz" \
  --exclude='node_modules' \
  --exclude='build' \
  --exclude='.git' \
  "$PROJECT_DIR"

echo "Backup created: $BACKUP_DIR/my-first-reactor-$DATE.tar.gz"

# Keep only last 5 backups
cd "$BACKUP_DIR"
ls -t | tail -n +6 | xargs rm -f
