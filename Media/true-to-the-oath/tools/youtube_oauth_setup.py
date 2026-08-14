#!/usr/bin/env python3
"""One-time OAuth flow to obtain YOUTUBE_REFRESH_TOKEN for uploads."""
from __future__ import annotations

import os
from pathlib import Path

from dotenv import load_dotenv
from google_auth_oauthlib.flow import InstalledAppFlow

PROJECT_ROOT = Path(os.getenv("FUTURE_FOUNDATIONS_ROOT", "S:/projects/FutureFoundations"))
SCOPES = ["https://www.googleapis.com/auth/youtube.upload"]


def main() -> None:
    load_dotenv(PROJECT_ROOT / ".env")
    client_id = os.getenv("YOUTUBE_CLIENT_ID")
    client_secret = os.getenv("YOUTUBE_CLIENT_SECRET")

    # Prefer downloaded Google OAuth JSON if present
    json_path = os.getenv("YOUTUBE_OAUTH_CLIENT_JSON")
    if json_path and Path(json_path).exists():
        flow = InstalledAppFlow.from_client_secrets_file(json_path, SCOPES)
    else:
        if not client_id or not client_secret:
            print("Set YOUTUBE_CLIENT_ID and YOUTUBE_CLIENT_SECRET in .env, or YOUTUBE_OAUTH_CLIENT_JSON.")
            return
        client_config = {
            "installed": {
                "client_id": client_id,
                "client_secret": client_secret,
                "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                "token_uri": "https://oauth2.googleapis.com/token",
                "redirect_uris": ["http://localhost"],
            }
        }
        flow = InstalledAppFlow.from_client_config(client_config, SCOPES)

    print("Opening browser — sign in as gcrispin59@gmail.com and approve access...", flush=True)
    creds = flow.run_local_server(port=0, open_browser=True)

    env_path = PROJECT_ROOT / ".env"
    token_line = f"YOUTUBE_REFRESH_TOKEN={creds.refresh_token}"
    if env_path.exists():
        lines = env_path.read_text(encoding="utf-8").splitlines()
        updated = False
        for i, line in enumerate(lines):
            if line.startswith("YOUTUBE_REFRESH_TOKEN="):
                lines[i] = token_line
                updated = True
                break
        if not updated:
            lines.append(token_line)
        env_path.write_text("\n".join(lines) + "\n", encoding="utf-8")
    print("Refresh token saved to .env", flush=True)


if __name__ == "__main__":
    main()
