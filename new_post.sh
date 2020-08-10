#!/bin/bash

# Usage: ./new_post.sh My blog post title

DATE=$(date +%Y-%0m-%0d)
TIME=$(date +%H:%M:%S)
TITLE="$@"

SAFE_TITLE=$(tr -s '[:blank:]' <<< "$TITLE" \
  | tr '[:upper:]' '[:lower:]' \
  | sed -e 's/[^-A-Za-z0-9.[[:space:]]]/./g;s/[[:space:]]/-/g')
if [[ "$SAFE_TITLE" == "" ]]; then SAFE_TITLE="Untitled"; fi
FILE="$DATE-$SAFE_TITLE.md"
DIR="./src/posts/"
PATH="$DIR/$FILE"

if [[ -f "$PATH" ]]; then
  1>&2 echo "File '$PATH' exists! Aborting"
  exit 1
fi

echo "Creating post for $DATE"
echo "Title: $TITLE"
echo "File: $FILE"

echo "---
title: $TITLE
description: 
date: $DATE $TIME
---
" > $PATH

echo "Done!"
