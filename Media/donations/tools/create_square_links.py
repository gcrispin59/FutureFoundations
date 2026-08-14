#!/usr/bin/env python3
"""Create Square payment links for donation tiers via Checkout API."""
from __future__ import annotations

import json
import os
import uuid
from pathlib import Path

import requests
from dotenv import load_dotenv

PROJECT_ROOT = Path(os.getenv("FUTURE_FOUNDATIONS_ROOT", "S:/projects/FutureFoundations"))
OUTPUT_JSON = PROJECT_ROOT / "public" / "config" / "donate-links.json"

# Tier names align with True to the Oath monetization plan
TIERS = [
    {"id": "supporter_5", "env_key": "SQUARE_LINK_SUPPORTER_5", "label": "Supporter", "amount_cents": 500},
    {"id": "defender_25", "env_key": "SQUARE_LINK_DEFENDER_25", "label": "Defender", "amount_cents": 2500},
    {"id": "guardian_50", "env_key": "SQUARE_LINK_GUARDIAN_50", "label": "Guardian", "amount_cents": 5000},
    {"id": "protector_100", "env_key": "SQUARE_LINK_PROTECTOR_100", "label": "Protector", "amount_cents": 10000},
]


def square_base_url() -> str:
    env = os.getenv("SQUARE_ENVIRONMENT", "production").lower()
    if env == "sandbox":
        return "https://connect.squareupsandbox.com"
    return "https://connect.squareup.com"


def create_link(token: str, location_id: str, name: str, amount_cents: int, redirect_url: str) -> dict:
    """Create one Square quick-pay checkout link."""
    payload = {
        "idempotency_key": str(uuid.uuid4()),
        "description": f"Future Foundations PAC — {name}",
        "quick_pay": {
            "location_id": location_id,
            "name": name,
            "price_money": {"amount": amount_cents, "currency": "USD"},
        },
        "checkout_options": {
            "redirect_url": redirect_url,
            "merchant_support_email": os.getenv("SQUARE_SUPPORT_EMAIL", "info@futurefoundationspac.org"),
        },
        "payment_note": "PAC civic education donation — Future Foundations PAC",
    }
    response = requests.post(
        f"{square_base_url()}/v2/online-checkout/payment-links",
        headers={
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json",
            "Square-Version": "2024-01-18",
        },
        json=payload,
        timeout=60,
    )
    response.raise_for_status()
    return response.json()["payment_link"]


def main() -> None:
    load_dotenv(PROJECT_ROOT / ".env")
    token = os.getenv("SQUARE_ACCESS_TOKEN")
    location_id = os.getenv("SQUARE_LOCATION_ID")
    redirect_url = os.getenv(
        "SQUARE_DONATE_REDIRECT_URL",
        "https://futurefoundationspac.org/donate/thank-you",
    )

    if not token or not location_id:
        print("Set SQUARE_ACCESS_TOKEN and SQUARE_LOCATION_ID in .env")
        return

    custom_url = os.getenv("SQUARE_LINK_CUSTOM", "").strip()
    tiers_out = []
    env_lines = []

    if custom_url:
        tiers_out.append(
            {
                "id": "custom",
                "label": "Choose your amount",
                "amount_usd": None,
                "url": custom_url,
            }
        )
        env_lines.append(f"SQUARE_LINK_CUSTOM={custom_url}")

    for tier in TIERS:
        title = f"{tier['label']} — Future Foundations PAC (${tier['amount_cents'] // 100})"
        print(f"Creating: {title}...")
        link = create_link(token, location_id, title, tier["amount_cents"], redirect_url)
        url = link.get("url") or link.get("long_url", "")
        tiers_out.append(
            {
                "id": tier["id"],
                "label": tier["label"],
                "amount_usd": tier["amount_cents"] // 100,
                "url": url,
                "order_id": link.get("order_id"),
            }
        )
        env_lines.append(f"{tier['env_key']}={url}")
        print(f"  -> {url}")

    OUTPUT_JSON.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT_JSON.write_text(
        json.dumps(
            {
                "provider": "square",
                "redirect_url": redirect_url,
                "tiers": tiers_out,
            },
            indent=2,
        )
        + "\n",
        encoding="utf-8",
    )
    print(f"\nWrote {OUTPUT_JSON}")
    print("\nAdd to Netlify environment variables:\n")
    print("\n".join(env_lines))
    publish_tiers_to_site(tiers_out)


def publish_tiers_to_site(tiers: list[dict]) -> None:
    """Embed tier links in public HTML pages (between DONATE_TIERS markers)."""
    pages = {
        PROJECT_ROOT / "public" / "donate" / "index.html": render_donate_tiers(tiers, "donate"),
        PROJECT_ROOT / "public" / "index.html": render_home_donate(tiers),
        PROJECT_ROOT / "public" / "shows" / "true-to-the-oath" / "index.html": render_compact_tiers(
            tiers, "tto"
        ),
    }
    start, end = "<!-- DONATE_TIERS:START -->", "<!-- DONATE_TIERS:END -->"
    for path, block in pages.items():
        if not path.exists():
            print(f"Skip missing {path}")
            continue
        text = path.read_text(encoding="utf-8")
        if start not in text:
            print(f"Skip {path} (no markers)")
            continue
        before, rest = text.split(start, 1)
        _, after = rest.split(end, 1)
        path.write_text(f"{before}{start}\n{block}\n{end}{after}", encoding="utf-8")
        print(f"Published tiers -> {path}")


def tier_url(base: str, medium: str, campaign: str | None = None) -> str:
    """Build Square link with UTM tracking."""
    sep = "&" if "?" in base else "?"
    url = f"{base}{sep}utm_source=site&utm_medium={medium}"
    if campaign:
        url += f"&utm_campaign={campaign}"
    return url


def render_donate_tiers(tiers: list[dict], medium: str) -> str:
    """Full tier cards for /donate/."""
    lines = []
    for t in tiers:
        url = tier_url(t["url"], medium)
        amount = "Any amount" if t.get("amount_usd") is None else f"${t['amount_usd']}"
        cls = "tier custom" if t.get("amount_usd") is None else "tier"
        lines.append(
            f'      <a class="{cls}" href="{url}" target="_blank" rel="noopener">\n'
            f"        <div><strong>{t['label']}</strong><br>"
            f'<span class="cta-note">Secure checkout via Square</span></div>\n'
            f'        <span class="amount">{amount}</span>\n'
            f"      </a>"
        )
    return "\n".join(lines)


def render_compact_tiers(tiers: list[dict], medium: str) -> str:
    """Inline tier buttons for show pages."""
    parts = [
        f'    <a class="donate-btn" href="{tier_url(t["url"], medium)}" target="_blank" rel="noopener">'
        f'{t["label"]} ${t["amount_usd"]}</a>'
        for t in tiers
        if t.get("amount_usd") is not None
    ]
    return (
        '    <div class="donate-tiers">\n'
        + "\n".join(parts)
        + '\n    </div>\n    <p class="donate-note"><a href="/donate/?utm_source=site&utm_medium='
        + medium
        + '">All donation options</a> · Secure checkout via Square</p>'
    )


def render_home_donate(tiers: list[dict]) -> str:
    """Support block for homepage."""
    buttons = "\n".join(
        f'            <a class="donate-tier" href="{tier_url(t["url"], "home")}" '
        f'target="_blank" rel="noopener">{t["label"]} · ${t["amount_usd"]}</a>'
        for t in tiers
        if t.get("amount_usd") is not None
    )
    return (
        "        <div class=\"donate-tiers\">\n"
        f"{buttons}\n"
        "        </div>\n"
        '        <p style="margin-top:1rem;font-size:0.9rem;">'
        '<a href="/donate/?utm_source=site&utm_medium=home">Donation page</a> · '
        '<a href="/shows/true-to-the-oath/">True to the Oath</a></p>'
    )


if __name__ == "__main__":
    import sys

    if "--publish-only" in sys.argv:
        data = json.loads(OUTPUT_JSON.read_text(encoding="utf-8"))
        publish_tiers_to_site(data.get("tiers", []))
    else:
        main()
