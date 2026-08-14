# Square Donations Setup

Use [Square Dashboard](https://app.squareup.com/dashboard) for links and API credentials for Future Foundations PAC.

## Option A — Dashboard links (fastest)

1. **Payments & orders → Payment links → Create link**
2. Choose **Accept a donation** (or **Collect a payment** for fixed tiers)
3. Title examples:
   - `Supporter — Future Foundations PAC` ($5)
   - `Defender — Future Foundations PAC` ($25)
   - `Guardian — Future Foundations PAC` ($50)
   - `Protector — Future Foundations PAC` ($100)
   - `Custom donation — Future Foundations PAC` (donor chooses amount)
4. Enable **tipping** only if you want extra on top of fixed tiers
5. **Redirect after checkout:** `https://futurefoundationspac.org/donate/thank-you`
6. Copy each `https://square.link/u/...` URL into `.env` / Netlify env vars (see `.env.example`)

## Option B — API (batch create tiers)

1. [Square Developer Dashboard](https://developer.squareup.com/apps) → create app → **Production** credentials
2. Copy **Access token** and **Location ID** (Square Dashboard → Account & settings → Locations)
3. Add to `S:/projects/FutureFoundations/.env`
4. Run:

```powershell
& S:/venvs/ffpac-media-publish/Scripts/python.exe `
  S:/projects/FutureFoundations/Media/donations/tools/create_square_links.py
```

5. Script writes `public/config/donate-links.json` and prints env lines for Netlify

## Site integration

| URL | Purpose |
|-----|---------|
| `/donate/` | Public donation page (Square buttons) |
| `/donate/thank-you` | Post-checkout landing |
| `GET /api/square-donate` | JSON tier links (from env) |
| `POST /api/square-donate/create-link` | Create link (requires `SQUARE_ADMIN_KEY`) |

## PAC compliance

- Donation page includes PAC disclaimer; no goods/services implied as official government offerings
- Record keeping: Square Dashboard → Payments exports for FEC reporting
- Do not store `SQUARE_ACCESS_TOKEN` in git
