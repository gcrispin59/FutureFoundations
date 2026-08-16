#!/usr/bin/env python3
"""Generate .ics calendar for remaining Future Foundations PAC tasks."""
from __future__ import annotations

import uuid
from datetime import date, datetime, timedelta
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parents[2]
OUTPUT = PROJECT_ROOT / "Admin" / "future-foundations-remaining-tasks.ics"

# One-hour blocks; max two per weekday at 7:00 PM ACST
TASKS = [
    (
        "FFPAC: Verify Square production donation",
        "Run a live $5 Supporter checkout at futurefoundationspac.org/donate/. "
        "Confirm payment in Square Dashboard and thank-you redirect.",
    ),
    (
        "FFPAC: Rotate exposed API credentials",
        "Rotate Square access tokens and YouTube OAuth secrets shared in chat. "
        "Update S:/projects/FutureFoundations/.env and Netlify env vars.",
    ),
    (
        "FFPAC: Git commit — donations and covenant work",
        "Commit Square donation system, covenant reframe, donate pages, and site links "
        "on cursor/ branch. Exclude unrelated Media assets.",
    ),
    (
        "FFPAC: Remove duplicate YouTube Short",
        "Unpublish or delete True to the Oath teaser v1 (LO0_-YPUoqQ). "
        "Keep v3 (4raBrF3lGb4) as canonical.",
    ),
    (
        "FFPAC: Publish TTO teaser to TikTok",
        "Upload teaser_60s_youtube_short.mp4 to TikTok with PAC disclaimer and "
        "link to futurefoundationspac.org/shows/true-to-the-oath/.",
    ),
    (
        "FFPAC: Publish TTO teaser to Facebook Reels",
        "Cross-post 60s vertical to Facebook Reels with disclaimer, donate CTA, "
        "and show hub link.",
    ),
    (
        "FFPAC: The 14th Lever Ep1 — script and checklist",
        "Review ep01-aid-and-comfort.md on cursor/the-14th-lever-media-pipeline. "
        "Finalize B-roll, VO, and compliance checklist.",
    ),
    (
        "FFPAC: The 14th Lever Ep1 — render pipeline",
        "Run media build in S:/venvs/ffpac-media-publish: voice segments, visuals, "
        "~14 min master to Media/the-14th-lever/03-masters/.",
    ),
    (
        "FFPAC: The 14th Lever Ep1 — YouTube upload",
        "Upload full episode to @Blackwood59. Title, description, chapters, "
        "PAC disclaimer, links to show hub and /donate/.",
    ),
    (
        "FFPAC: The 14th Lever show hub and deploy",
        "Create public/shows/the-14th-lever/ hub with embed, transcript, disclaimer. "
        "netlify deploy --prod.",
    ),
    (
        "FFPAC: 14th Lever vertical snippets",
        "Cut 30s and 60s snippets from Ep1. Publish to Shorts, TikTok, and Reels "
        "per PUBLISHING_PLAN.md.",
    ),
    (
        "FFPAC: Push branches and open PR",
        "Push cursor/true-to-the-oath-teaser and cursor/the-14th-lever-media-pipeline. "
        "Open PR(s) for review when ready.",
    ),
    (
        "FFPAC: Covenant-focused homepage",
        "Replace or merge public/index.html with redesigned PAC landing "
        "(covenant language, donate CTAs, show links). Deploy.",
    ),
    (
        "FFPAC: Square custom amount and admin key",
        "Add optional custom-amount Square link tier. Set SQUARE_ADMIN_KEY in Netlify. "
        "Republish site links.",
    ),
]

TZ = "Australia/Adelaide"
START_DAY = date(2026, 7, 13)  # Monday (weekdays only)
SLOTS = [(19, 0), (20, 0)]  # 7:00 PM and 8:00 PM


def escape_ics(text: str) -> str:
    """Escape special characters for iCalendar text fields."""
    return (
        text.replace("\\", "\\\\")
        .replace(";", "\\;")
        .replace(",", "\\,")
        .replace("\n", "\\n")
    )


def fmt_local(dt: datetime) -> str:
    return dt.strftime("%Y%m%dT%H%M%S")


def next_weekday(d: date) -> date:
    while d.weekday() >= 5:
        d += timedelta(days=1)
    return d


def main() -> None:
    lines = [
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        "PRODID:-//Future Foundations PAC//Remaining Tasks//EN",
        "CALSCALE:GREGORIAN",
        "METHOD:PUBLISH",
        "X-WR-CALNAME:Future Foundations — Remaining Tasks",
        "X-WR-TIMEZONE:Australia/Adelaide",
        "BEGIN:VTIMEZONE",
        "TZID:Australia/Adelaide",
        "BEGIN:STANDARD",
        "DTSTART:19700101T000000",
        "TZOFFSETFROM:+1030",
        "TZOFFSETTO:+0930",
        "TZNAME:ACST",
        "END:STANDARD",
        "END:VTIMEZONE",
    ]

    current_day = next_weekday(START_DAY)
    slot_idx = 0
    last_day = current_day
    now_stamp = datetime.utcnow().strftime("%Y%m%dT%H%M%SZ")

    for title, description in TASKS:
        hour, minute = SLOTS[slot_idx]
        start = datetime(current_day.year, current_day.month, current_day.day, hour, minute)
        end = start + timedelta(hours=1)
        uid = f"{uuid.uuid4()}@futurefoundationspac.org"

        lines.extend(
            [
                "BEGIN:VEVENT",
                f"UID:{uid}",
                f"DTSTAMP:{now_stamp}",
                f"DTSTART;TZID={TZ}:{fmt_local(start)}",
                f"DTEND;TZID={TZ}:{fmt_local(end)}",
                f"SUMMARY:{escape_ics(title)}",
                f"DESCRIPTION:{escape_ics(description)}",
                "LOCATION:Home office",
                "STATUS:CONFIRMED",
                "TRANSP:OPAQUE",
                "BEGIN:VALARM",
                "TRIGGER:-PT15M",
                "ACTION:DISPLAY",
                "DESCRIPTION:Task starting in 15 minutes",
                "END:VALARM",
                "END:VEVENT",
            ]
        )

        last_day = current_day
        slot_idx += 1
        if slot_idx >= len(SLOTS):
            slot_idx = 0
            current_day += timedelta(days=1)
            current_day = next_weekday(current_day)

    lines.append("END:VCALENDAR")
    OUTPUT.write_text("\r\n".join(lines) + "\r\n", encoding="utf-8")
    print(f"Wrote {len(TASKS)} events to {OUTPUT}")
    print(f"Schedule: {START_DAY} through {last_day} (weekdays, 7-9 PM ACST)")


if __name__ == "__main__":
    main()
