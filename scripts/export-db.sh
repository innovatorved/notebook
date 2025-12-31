#!/bin/bash
# MongoDB Database Export Script
# This script exports all collections from the Prenotebook database

# Load environment variables from .env file
if [ -f "../.env" ]; then
    export $(grep -v '^#' ../.env | xargs)
fi

# Get MongoDB URI from environment
MONGO_URI="${MONGO_API}"

if [ -z "$MONGO_URI" ]; then
    echo "Error: MONGO_API environment variable not set"
    echo "Please set it in .env file or export it manually"
    exit 1
fi

# Create backup directory with timestamp
BACKUP_DIR="./backups/$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"

echo "=== MongoDB Database Export ==="
echo "Exporting to: $BACKUP_DIR"
echo ""

# Export users collection
echo "Exporting 'users' collection..."
mongoexport --uri="$MONGO_URI" --collection=user --out="$BACKUP_DIR/users.json" --jsonArray 2>/dev/null || \
mongoexport --uri="$MONGO_URI" --collection=users --out="$BACKUP_DIR/users.json" --jsonArray 2>/dev/null

# Export notes collection  
echo "Exporting 'notes' collection..."
mongoexport --uri="$MONGO_URI" --collection=notes --out="$BACKUP_DIR/notes.json" --jsonArray 2>/dev/null

echo ""
echo "=== Export Complete ==="
echo "Backup saved to: $BACKUP_DIR"
ls -la "$BACKUP_DIR"
