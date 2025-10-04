#!/bin/bash

# BubbleUp Story Creator - Slash Command
# Usage: /bubble

cd "$(dirname "$0")/../.." || exit 1

node bubble-story-creator.js
