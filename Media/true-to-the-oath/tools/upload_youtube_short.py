#!/usr/bin/env python3
"""Upload True to the Oath teaser to YouTube (requires OAuth credentials in .env)."""
from __future__ import annotations

import json
import os
import sys
from pathlib import Path

from dotenv import load_dotenv
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from googleapiclient.http import MediaFileUpload

PROJECT_ROOT = Path(os.getenv("FUTURE_FOUNDATIONS_ROOT", "S:/projects/FutureFoundations"))
BUILD_DIR = PROJECT_ROOT / "Media" / "true-to-the-oath" / "02-build" / "teaser_60s"
MANIFEST = PROJECT_ROOT / "Media" / "true-to-the-oath" / "publish-manifest.json"


def get_youtube_service():
    """Build YouTube API client from refresh token in environment."""
    required = ["YOUTUBE_CLIENT_ID", "YOUTUBE_CLIENT_SECRET", "YOUTUBE_REFRESH_TOKEN"]
    missing = [k for k in required if not os.getenv(k)]
    if missing:
        print(f"Missing .env keys for upload: {', '.join(missing)}")
        print("Video is ready for manual upload via YouTube Studio.")
        sys.exit(1)

    creds = Credentials(
        token=None,
        refresh_token=os.environ["YOUTUBE_REFRESH_TOKEN"],
        token_uri="https://oauth2.googleapis.com/token",
        client_id=os.environ["YOUTUBE_CLIENT_ID"],
        client_secret=os.environ["YOUTUBE_CLIENT_SECRET"],
        scopes=["https://www.googleapis.com/auth/youtube.upload"],
    )
    return build("youtube", "v3", credentials=creds)


def main() -> None:
    load_dotenv(PROJECT_ROOT / ".env")
    meta_path = BUILD_DIR / "youtube_metadata.json"
    if not meta_path.exists():
        print("Run build_teaser_short.py first.")
        sys.exit(1)

    meta = json.loads(meta_path.read_text(encoding="utf-8"))
    video_path = Path(meta["output_file"])
    if not video_path.exists():
        print(f"Video not found: {video_path}")
        sys.exit(1)

    youtube = get_youtube_service()
    body = {
        "snippet": {
            "title": meta["title"],
            "description": meta["description"],
            "tags": meta["tags"],
            "categoryId": meta["category_id"],
        },
        "status": {
            "privacyStatus": meta.get("privacy_status", "public"),
            "selfDeclaredMadeForKids": False,
        },
    }

    media = MediaFileUpload(str(video_path), mimetype="video/mp4", resumable=True)
    request = youtube.videos().insert(part="snippet,status", body=body, media_body=media)
    response = None
    while response is None:
        status, response = request.next_chunk()
        if status:
            print(f"Upload {int(status.progress() * 100)}%")

    video_id = response["id"]
    print(f"Uploaded: https://youtube.com/shorts/{video_id}")

    manifest = json.loads(MANIFEST.read_text(encoding="utf-8"))
    manifest["teasers"][0]["platforms"]["youtube_shorts"]["video_id"] = video_id
    MANIFEST.write_text(json.dumps(manifest, indent=2) + "\n", encoding="utf-8")


if __name__ == "__main__":
    main()
