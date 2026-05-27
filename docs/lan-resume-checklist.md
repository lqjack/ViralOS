# LAN resume checklist (Ubuntu ops deferred off-LAN)

> Use when you are on the **same LAN** as Ubuntu (`192.168.1.4`) or have **console** access.  
> Until then, use **`npm run verify:local-design`** on macOS — no remote Ubuntu required.

## Why deferred

Cross-public-network SSH/tunnel to Ubuntu is unreliable (OPS-3). Application design for the shipped product is **already implemented** — see [SHIPPED.md](./SHIPPED.md).

## Quick commands

```bash
# Mac — now (off-LAN)
npm run verify:local-design

# Mac — print LAN steps
npm run verify:lan-resume

# Mac — on LAN, after deploy
LAN_RESUME_RUN=1 VIRALOS_URL=http://192.168.1.4:3010 npm run verify:lan-resume
```

## Full sign-off (on LAN)

| Step | Where | Command |
|------|-------|---------|
| 1 | Ubuntu | `cd ~/dataproaiset/dataproaiset && ./scripts/ubuntu/start-core-gateway.sh` |
| 2 | Mac | `REMOTE=ubuntu@192.168.1.4 npm run deploy:ubuntu:sync` |
| 3 | Ubuntu | `cd ~/ViralOS && npm run verify:ubuntu:all` |
| 4 | Ubuntu | `API_PROXY_BASE_URL=http://127.0.0.1:8001 npm run verify:cross-repo-live` |
| 5 | Mac | `VIRALOS_URL=http://192.168.1.4:3010 npm run verify:ubuntu:real` |

Track checklist items in [todo.md § P3](./todo.md#p3--operator-verification-open--lan-deferred).

## Related

- [deploy-ubuntu.md](./deploy-ubuntu.md)  
- [issue.md § Part G](./issue.md#part-g--open-issues--operator-backlog-2026-05-27)  
- invest-ai [ubuntu-production-deploy.md](https://github.com/lqjack/dataproaiset/blob/main/docs/operations/ubuntu-production-deploy.md)
