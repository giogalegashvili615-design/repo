# AGENTS.md — archlinuxcn/repo

## What this repo is
This is the **archlinuxcn** community packaging repository. It is NOT a web
application — it holds ~2500 Arch Linux package recipes (`PKGBUILD` files)
under `archlinuxcn/` (and a smaller `alarmcn/` set), plus `lilac.yaml`/`lilac.py`
build automation configs. Packages are auto-updated by the [lilac](https://github.com/archlinuxcn/lilac)
bot; each commit is typically `pkgname: auto updated to <ver>-<rel>`.

## The "build" / CI
The only build/CI in this repo is `.github/workflows/test.yml`, which runs:

```
./pre-commit --all
```

`pre-commit` is a Python script that validates every package directory:
- `lilac.yaml` has a `maintainers` field and matches `lilac-yaml-schema.yaml`
- each package has `update_on` or `managed: false` in lilac.py/yaml
- no `repo_depends` in lilac.py; repo_depends targets exist
- PKGBUILDs with `replaces`/`groups` don't collide with official repos (data
  downloaded from `https://build.archlinuxcn.org/~farseerfc/dump-groups.gz`)
- no embedded git commit objects

Dependencies: `jsonschema==4.26.0`, `pyyaml==6.0.3` (CI uses Python 3.14; 3.12
also works). No `pyalpm`/`pycman` needed — the script falls back to the
downloaded dump when not on Arch.

## Why it "failed to start" in Base44
There is no web server, `package.json`, or `Dockerfile` — only packaging
recipes. Base44's preview needs something on port 3000, so the import failed
to start.

## How the preview works here
`scripts/serve-status.py` runs `./pre-commit --all`, captures the result, and
serves a status page on port 3000. `docker-compose.base44.yml` wires this up
with a `python:3.12-slim` container (repo bind-mounted at `/app`). The page has
a "Re-run check" button (POST `/refresh`).

**Note:** `python:3.12-slim` does NOT include `git`, but `pre-commit` shells out
to `git` (`git write-tree`, `git ls-tree`, `git cat-file`). The compose command
installs `git` via apt before starting. The check takes ~3–4 minutes over the
full tree; it runs in a background thread so the page shows `RUNNING…` while it
works and `PASS`/`FAIL` when done.

## Useful commands
- Run the check locally: `./pre-commit --all` (needs `pip install jsonschema pyyaml`)
- Check only changed packages (vs origin/master): `./pre-commit` (no `--all`)
- Start the preview: `docker compose -f docker-compose.base44.yml up -d`
- View logs: `docker compose -f docker-compose.base44.yml logs -f web`
