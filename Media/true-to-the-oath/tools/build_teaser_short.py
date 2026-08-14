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
# Forceful, deep delivery (BrianNeural — reliable via edge-tts)
VOICE = "en-US-BrianNeural"

# (line, pause_seconds_after) — direct we / I / you cadence
VO_SEGMENTS: list[tuple[str, float]] = [
    ("You know the oath. Forty words.", 0.55),
    ("We watch every official swear it.", 0.28),
    ("To support and defend the Constitution.", 0.65),
    ("But when institutions drift.", 0.35),
    ("I have to ask you — who holds them accountable?", 0.70),
    ("We built True to the Oath.", 0.32),
    ("An integrity framework you can see.", 0.28),
    ("We track accountability, transparency, and virtue — in public service.", 0.60),
    ("Oath assessments you can verify.", 0.20),
    ("Virtue metrics we measure together.", 0.20),
    ("Accountability chains we refuse to break.", 0.40),
    ("For citizens like you who will not look away.", 0.60),
    ("We are veterans, law enforcement, teachers, neighbors.", 0.40),
    ("I still believe the oath means something. Do you?", 0.70),
    ("Stand with us. True to the oath.", 0.45),
    ("futurefoundationspac.org", 0.0),
]

# Scene timing as fraction of total audio (must sum to 1.0)
SCENES = [
    {"headline": "YOU KNOW", "sub": "THE OATH", "bg": "Civilization.jpg", "weight": 0.10},
    {"headline": "WE WATCH", "sub": "THEY SWEAR IT", "bg": "Civilization2.jpg", "weight": 0.14},
    {"headline": "I ASK YOU", "sub": "WHO'S ACCOUNTABLE?", "bg": "Civilization3.jpg", "weight": 0.12},
    {"headline": "WE BUILT", "sub": "TRUE TO THE OATH", "bg": "Civilization4.jpg", "weight": 0.16},
    {"headline": "WE TRACK", "sub": "ACCOUNTABILITY", "bg": "Civilization.jpg", "weight": 0.18},
    {"headline": "STAND WITH US", "sub": "TRUE TO THE OATH", "bg": "Civilization2.jpg", "weight": 0.16},
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
    img = ImageEnhance.Brightness(img).enhance(0.38)
    img = ImageEnhance.Contrast(img).enhance(1.12)
    return img


def draw_text_with_shadow(
    draw: ImageDraw.ImageDraw,
    xy: tuple[int, int],
    text: str,
    font: ImageFont.FreeTypeFont | ImageFont.ImageFont,
    fill: tuple[int, int, int, int],
    anchor: str = "mm",
) -> None:
    """Draw headline text with a subtle shadow for readability."""
    x, y = xy
    draw.text((x + 3, y + 3), text, fill=(0, 0, 0, 180), font=font, anchor=anchor)
    draw.text(xy, text, fill=fill, font=font, anchor=anchor)


def render_frame(scene: dict, index: int) -> Path:
    """Render a single vertical frame with headline overlay."""
    img = load_background(scene["bg"])
    overlay = Image.new("RGBA", (WIDTH, HEIGHT), (8, 20, 45, 185))
    img = Image.alpha_composite(img.convert("RGBA"), overlay)
    draw = ImageDraw.Draw(img)

    title_font = load_font(82, bold=True)
    sub_font = load_font(58, bold=True)
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

    draw_text_with_shadow(
        draw, (WIDTH // 2, HEIGHT // 2 - 80), headline, title_font, (255, 255, 255, 255)
    )
    draw_text_with_shadow(
        draw, (WIDTH // 2, HEIGHT // 2 + 40), sub, sub_font, (230, 55, 55, 255)
    )

    # Brand bar
    draw.rectangle([(0, HEIGHT - 140), (WIDTH, HEIGHT)], fill=(26, 68, 128, 230))
    draw.text((WIDTH // 2, HEIGHT - 70), "TRUE TO THE OATH", fill=(255, 255, 255, 255), font=sub_font, anchor="mm")

    out = BUILD_DIR / "frames" / f"frame_{index:02d}.png"
    img.convert("RGB").save(out, quality=95)
    return out


async def generate_voiceover(ffmpeg: str) -> Path:
    """Synthesize forceful narration with deliberate pauses between beats."""
    seg_dir = BUILD_DIR / "segments"
    seg_dir.mkdir(parents=True, exist_ok=True)
    concat_lines: list[str] = []

    for i, (text, pause) in enumerate(VO_SEGMENTS):
        seg_path = seg_dir / f"seg_{i:02d}.mp3"
        communicate = edge_tts.Communicate(
            text,
            VOICE,
            rate="-12%",
            volume="+14%",
        )
        await communicate.save(str(seg_path))
        concat_lines.append(f"file '{seg_path.as_posix()}'")

        if pause > 0:
            silence_path = seg_dir / f"pause_{i:02d}.mp3"
            subprocess.run(
                [
                    ffmpeg,
                    "-y",
                    "-f",
                    "lavfi",
                    "-i",
                    "anullsrc=r=24000:cl=mono",
                    "-t",
                    f"{pause:.3f}",
                    "-c:a",
                    "libmp3lame",
                    "-q:a",
                    "6",
                    str(silence_path),
                ],
                check=True,
                capture_output=True,
            )
            concat_lines.append(f"file '{silence_path.as_posix()}'")

    concat_list = seg_dir / "audio_concat.txt"
    concat_list.write_text("\n".join(concat_lines), encoding="utf-8")
    audio_path = BUILD_DIR / "voiceover.mp3"
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
            "-c:a",
            "libmp3lame",
            "-q:a",
            "4",
            str(audio_path),
        ],
        check=True,
    )
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
    audio_path = await generate_voiceover(ffmpeg)
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
