#!/usr/bin/env python3
"""Shim → canonical retro engine in llm-gateway/plugins/_hooks/."""
from __future__ import annotations

import os
import runpy
from pathlib import Path

_gateway = Path(
    os.environ.get("LLM_GATEWAY_ROOT", os.environ.get("CURSOR_LLMAGATEWAY_ROOT", str(Path.home() / "Desktop" / "llm-gateway")))
).expanduser()
_CANONICAL = _gateway / "plugins" / "_hooks" / "retro_review_sync.py"

if not _CANONICAL.is_file():
    raise SystemExit(f"retro engine not found: {_CANONICAL}")

runpy.run_path(str(_CANONICAL), run_name="__main__")
