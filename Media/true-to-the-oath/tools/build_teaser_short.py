#!/usr/bin/env python3
"""
Build True to the Oath 60s vertical teaser for YouTube Shorts.
Uses edge-tts for VO and bundled ffmpeg (imageio-ffmpeg) for assembly.
"""
from __future__ import annotations

import asyncio
import json
import os
import subprocess
import textwrap
from pathlib import Path

import edge_tts
from dotenv import load_dotenv
from imageio_ffmpeg import get_ffmpeg_exe
from PIL import Image, ImageDraw, ImageEnhance, ImageFont

# Portable root via env or default
PROJECT_ROOT = Path(os.getenv("FUTURE_FOUNDATIONS_ROOT", "S:/projects/FutureFoundations"))
MEDIA_ROOT = PROJECT_ROOT / "Media" / "true-to-the-oath"
BUILD_DIR = MEDIA_ROOT / "02-build" / "teaser_60s"
OUTPUT_FILE = MEDIA_ROOT / "04-vertical" / "teaser_60s_youtube_short.mp4"

WIDTH, HEIGHT = 1080, 1920
FPS = 30
VOICE = "en-US-GuyNeural"

VO_SCRIPT = """
The oath is forty words.
Every federal official swears it, to support and defend the Constitution.
But when institutions drift, who measures the gap?
True to the Oath is an institutional integrity framework, tracking accountability, transparency, and virtue in public service.
Oath assessments. Virtue metrics. Accountability chains, for citizens who refuse to look away.
Veterans. Former law enforcement. Teachers. Neighbors. People who still believe the oath means something.
Stand true to the oath. Link in bio.
""".strip()

# Scene timing as fraction of total audio (must sum to 1.0)
SCENES = [
    {"headline": "THE OATH IS", "sub": "40 WORDS.", "bg": "Civilization.jpg", "weight": 0.10},
    {"headline": "SUPPORT & DEFEND", "sub": "the Constitution", "bg": "Civilization2.jpg", "weight": 0.14},
    {"headline": "WHO HOLDS THEM", "sub": "ACCOUNTABLE?", "bg": "Civilization3.jpg", "weight": 0.12},
    {"headline": "TRUE TO", "sub": "THE OATH", "bg": "Civilization4.jpg", "weight": 0.16},
    {"headline": "ACCOUNTABILITY", "sub": "CHAINS", "bg": "Civilization.jpg", "weight": 0.18},
    {"headline": "STAND TRUE", "sub": "TO THE OATH", "bg": "Civilization2.jpg", "weight": 0.16},
    {"headline": "futurefoundationspac.org", "sub": "#TrueToTheOath", "bg": "Civilization3.jpg", "weight": 0.14},
]


def load_font(size: int, bold: bool = False) -> ImageFont.FreeTypeFont | ImageFont.ImageFont:
    """Load a system font with fallback."""
    candidates = [
        "C:/Windows/Fonts/arialbd.ttf" if bold else "C:/Windows/Fonts/arial.ttf",
        "C:/Windows/Fonts/segoeuib.ttf" if bold else "C:/Windows/Fonts/segoeui.ttf",
    ]
    for path in candidates:
        if Path(path).exists():
            return ImageFont.truetype(path, size)
    return ImageFont.load_default()


def load_background(name: str) -> Image.Image:
    """Load and crop a background image to 9:16."""
    src = PROJECT_ROOT / "Media" / name
    if not src.exists():
        img = Image.new("RGB", (WIDTH, HEIGHT), "#0d1f3c")
        return img
    img = Image.open(src).convert("RGB")
    # Center crop to vertical
    w, h = img.size
    target_ratio = WIDTH / HEIGHT
    current_ratio = w / h
    if current_ratio > target_ratio:
        new_w = int(h * target_ratio)
        left = (w - new_w) // 2
        img = img.crop((left, 0, left + new_w, h))
    else:
        new_h = int(w / target_ratio)
        top = (h - new_h) // 2
        img = img.crop((0, top, w, top + new_h))
    img = img.resize((WIDTH, HEIGHT), Image.Resampling.LANCZOS)
    img = ImageEnhance.Brightness(img).enhance(0.45)
    return img


def render_frame(scene: dict, index: int) -> Path:
    """Render a single vertical frame with headline overlay."""
    img = load_background(scene["bg"])
    overlay = Image.new("RGBA", (WIDTH, HEIGHT), (13, 31, 60, 160))
    img = Image.alpha_composite(img.convert("RGBA"), overlay)
    draw = ImageDraw.Draw(img)

    title_font = load_font(78, bold=True)
    sub_font = load_font(56, bold=True)
    small_font = load_font(36, bold=False)

    headline = scene["headline"]
    sub = scene["sub"]

    # Top disclaimer on first frame
    if index == 0:
        draw.text(
            (WIDTH // 2, 120),
            "Educational initiative. Not a government agency.",
            fill=(200, 200, 200, 255),
            font=small_font,
            anchor="mm",
        )

    draw.text((WIDTH // 2, HEIGHT // 2 - 80), headline, fill=(255, 255, 255, 255), font=title_font, anchor="mm")
    draw.text((WIDTH // 2, HEIGHT // 2 + 40), sub, fill=(215, 63, 63, 255), font=sub_font, anchor="mm")

    # Brand bar
    draw.rectangle([(0, HEIGHT - 140), (WIDTH, HEIGHT)], fill=(26, 68, 128, 230))
    draw.text((WIDTH // 2, HEIGHT - 70), "TRUE TO THE OATH", fill=(255, 255, 255, 255), font=sub_font, anchor="mm")

    out = BUILD_DIR / "frames" / f"frame_{index:02d}.png"
    img.convert("RGB").save(out, quality=95)
    return out


async def generate_voiceover() -> Path:
    """Synthesize narration with edge-tts."""
    audio_path = BUILD_DIR / "voiceover.mp3"
    communicate = edge_tts.Communicate(VO_SCRIPT, VOICE, rate="-5%")
    await communicate.save(str(audio_path))
    return audio_path


def probe_duration(ffmpeg: str, audio_path: Path) -> float:
    """Return audio duration in seconds by parsing ffmpeg stderr."""
    cmd = [ffmpeg, "-i", str(audio_path), "-f", "null", "-"]
    result = subprocess.run(cmd, capture_output=True, text=True)
    stderr = result.stderr
    for line in stderr.splitlines():
        if "Duration:" in line:
            # Duration: 00:00:58.42,
            part = line.split("Duration:")[1].split(",")[0].strip()
            h, m, s = part.split(":")
            return int(h) * 3600 + int(m) * 60 + float(s)
    raise RuntimeError(f"Could not parse duration from ffmpeg output: {stderr[:500]}")


def build_video(ffmpeg: str, audio_path: Path, total_duration: float) -> None:
    """Assemble scene stills and audio into final Short."""
    frames_dir = BUILD_DIR / "frames"
    concat_list = BUILD_DIR / "concat.txt"
    silent_video = BUILD_DIR / "video_silent.mp4"

    lines = []
    for i, scene in enumerate(SCENES):
        duration = max(2.5, total_duration * scene["weight"])
        frame = frames_dir / f"frame_{i:02d}.png"
        lines.append(f"file '{frame.as_posix()}'")
        lines.append(f"duration {duration:.3f}")
    # concat demuxer requires last file repeated
    last = (frames_dir / f"frame_{len(SCENES) - 1:02d}.png").as_posix()
    lines.append(f"file '{last}'")
    concat_list.write_text("\n".join(lines), encoding="utf-8")

    subprocess.run(
        [
            ffmpeg,
            "-y",
            "-f",
            "concat",
            "-safe",
            "0",
            "-i",
            str(concat_list),
            "-vf",
            f"scale={WIDTH}:{HEIGHT},fps={FPS}",
            "-c:v",
            "libx264",
            "-pix_fmt",
            "yuv420p",
            "-t",
            f"{total_duration:.3f}",
            str(silent_video),
        ],
        check=True,
    )

    OUTPUT_FILE.parent.mkdir(parents=True, exist_ok=True)
    subprocess.run(
        [
            ffmpeg,
            "-y",
            "-i",
            str(silent_video),
            "-i",
            str(audio_path),
            "-c:v",
            "copy",
            "-c:a",
            "aac",
            "-b:a",
            "192k",
            "-shortest",
            "-movflags",
            "+faststart",
            str(OUTPUT_FILE),
        ],
        check=True,
    )


def write_metadata(duration: float) -> None:
    """Write YouTube upload metadata sidecar."""
    meta = {
        "title": "The Oath Is 40 Words. Who Holds Them Accountable? | True to the Oath",
        "description": textwrap.dedent(
            """
            Every official swears to defend the Constitution. True to the Oath tracks accountability when institutions drift.

            🏛️ Institutional integrity · Virtue metrics · Accountability chains
            🔗 https://futurefoundationspac.org
            #TrueToTheOath #Constitution #CivicEngagement #FutureFoundations

            Educational initiative by Future Foundations PAC. Not affiliated with any government agency.
            """
        ).strip(),
        "tags": [
            "True to the Oath",
            "constitutional oath",
            "institutional integrity",
            "civic engagement",
            "Future Foundations",
            "accountability",
            "YouTube Shorts",
        ],
        "category_id": "25",
        "privacy_status": "public",
        "duration_sec": round(duration, 2),
        "output_file": str(OUTPUT_FILE),
    }
    (BUILD_DIR / "youtube_metadata.json").write_text(json.dumps(meta, indent=2), encoding="utf-8")


async def main() -> None:
    load_dotenv(PROJECT_ROOT / ".env")
    ffmpeg = os.getenv("FFMPEG_PATH", get_ffmpeg_exe())
    BUILD_DIR.mkdir(parents=True, exist_ok=True)
    (BUILD_DIR / "frames").mkdir(parents=True, exist_ok=True)

    print("Generating voiceover...")
    audio_path = await generate_voiceover()
    duration = probe_duration(ffmpeg, audio_path)
    print(f"Audio duration: {duration:.1f}s")

    print("Rendering frames...")
    for i, scene in enumerate(SCENES):
        render_frame(scene, i)

    print("Assembling video...")
    build_video(ffmpeg, audio_path, duration)
    write_metadata(duration)
    print(f"Done: {OUTPUT_FILE}")


if __name__ == "__main__":
    asyncio.run(main())
