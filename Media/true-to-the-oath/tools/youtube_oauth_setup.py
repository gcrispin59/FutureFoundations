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
    if not client_id or not client_secret:
        print("Set YOUTUBE_CLIENT_ID and YOUTUBE_CLIENT_SECRET in .env first.")
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
    creds = flow.run_local_server(port=0)
    print("\nAdd this to S:/projects/FutureFoundations/.env:\n")
    print(f"YOUTUBE_REFRESH_TOKEN={creds.refresh_token}")


if __name__ == "__main__":
    main()
