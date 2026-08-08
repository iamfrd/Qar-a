---
description: Show the READY Work OS queue for one Qarğa agent and explain the next valid subtask without bypassing dependencies.
---

Use `qarga-work-os`.

Run:

```bash
npm run work-os -- next $ARGUMENTS
```

Return the queue in priority order. Do not let an agent self-assign work that the coordinator did not assign to it.
