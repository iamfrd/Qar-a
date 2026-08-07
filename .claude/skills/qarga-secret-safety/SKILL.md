---
name: qarga-secret-safety
description: Prevent secrets, credentials, private keys, database URLs, and sensitive environment files from entering Qarğa prompts, commits, logs, project memory, telemetry, or generated artifacts.
---

# Qarğa Secret Safety

Never request, read, print, log, copy, summarize, or store real secrets unless a narrowly scoped approved operation explicitly requires a secure secret mechanism. `.env*`, private keys, credential files, tokens, and secret directories are protected surfaces.

Before commit, the staged-secret hook scans file names and staged text without printing secret values. If a possible secret is detected, block the commit and report only type, file, and line. Use environment variables or a managed secret store instead of hardcoding.

Project memory, telemetry, learning, performance, task contracts, and system-evolution ledgers must never contain secrets or personal data.
