# Gulf Surplus Board — stock listings site

Plain HTML/CSS/JS. No backend, no build step, no payments, no sales
processing — this is an advertising/listings board, not a store. Stock is
treated as unlimited (no quantity tracking); an item is simply "Available"
if it has a price, or "Currently unavailable" if it doesn't. Item data lives
in `items.json`; the page fetches it and renders the listings.

## The "Ask on WhatsApp" button

Each listing has a button that opens WhatsApp with a pre-filled message
containing that item's name, SKU, category, and price (omitted if the item
has no price yet). This is generated automatically from whatever is in
`items.json` at the moment someone clicks it — there's nothing to configure
per item. Add a new item to `items.json` and its WhatsApp button just works.

To change the WhatsApp number later, edit the `WHATSAPP_NUMBER` line near the
top of `script.js` (digits only, country code first, no `+` or spaces).

## Files
- `index.html` — page structure
- `style.css` — styling
- `script.js` — loads items.json, handles category filter + search + sort
- `items.json` — your item list (this is the file you'll edit day-to-day)
- `manage-items.html` — bulk price/country editor, see below
- `compress-image.html` — bulk image compressor, see below
- `CNAME` — your custom domain (fill in before going live)

## Updating price / country — the fast way (recommended for more than 1-2 items)

For a single quick edit, GitHub's web editor (below) is fine. For updating a
batch of items at once — new pricing across a category, adding country of
origin, marking several things unavailable — use `manage-items.html`:

1. First, download the current `items.json` from your GitHub repo (open the
   file on GitHub, click "Raw", save the page — or just keep a local copy
   after each edit).
2. Open `manage-items.html` in your browser (double-click it, no server
   needed — same as the image compressor, nothing uploads anywhere).
3. Click "load your current items.json" and select the file.
4. You get one searchable table with every item, an editable Price field and
   an editable Country field per row, and a "Clear price" button to mark
   something unavailable in one click. Changed cells highlight blue; any row
   with no price shades red. A live counter shows how many items are
   unavailable and how many you've changed.
5. Click "Download updated items.json" — this saves a new file with your
   changes, everything else (name, SKU, description, image, etc.) untouched.
6. Upload that one file to GitHub, overwriting the old `items.json`, and
   commit once. Every price/country change goes live in a single commit
   instead of editing each item's block by hand.

## Updating items the manual way (fine for one-off edits)

1. Go to your GitHub repo in the browser.
2. Open `items.json`.
3. Click the pencil icon (top right of the file view) to edit.
4. Copy an existing item block and change the values, e.g.:

```json
{
  "sku": "HT-18",
  "name": "Garden Hose",
  "category": "Hand Tools",
  "price": 3.800,
  "unit": "unit",
  "country": "China",
  "description": "Heavy-duty garden hose, 20m."
}
```

   Field meanings:
   - `sku` — your internal code, shown on the item tag
   - `category` — controls which filter tab it shows under (new category
     names just work — a new tab appears automatically)
   - `price` — a number (e.g. `1.700`), or `null` if not priced yet — an item
     with `null` price shows as "Currently unavailable" and "Price on
     request" automatically
   - `unit` — e.g. "sheet", "roll", "kg", "pair" — shown as "per {unit}"
   - `country` — optional. Omit the field entirely if origin isn't known;
     when present it shows as "Made in {country}" on the card
   - `description` — a short line shown on the card
5. Scroll down, add a commit message like "add garden hose", click **Commit
   changes**.
6. Wait ~30–60 seconds — GitHub Pages redeploys automatically. Refresh the
   site.

To delete an item, just delete its `{ ... }` block (watch the commas — every
item except the last one needs a trailing comma).

If this ever gets annoying to do by hand, the next easiest upgrade is
switching `items.json` for a published Google Sheet (CSV) — happy to wire
that up later if you want edits from your phone without opening GitHub.

## Deploying on GitHub Pages

1. Create a new GitHub repo (public or private — Pages works on both, private

   requires GitHub Pro on some plans, so public is simpler if there's nothing
   sensitive in it).
2. Push these files to the repo root (or to a `/docs` folder — just set the
   Pages source accordingly).
3. In the repo: **Settings → Pages → Build and deployment → Source** = "Deploy
   from a branch", branch = `main`, folder = `/ (root)`. Save.
4. GitHub gives you a URL like `https://yourusername.github.io/repo-name/`.
   Confirm the site loads there before touching DNS.

## Pointing your Namecheap domain at it

1. In the repo root, edit the `CNAME` file and put your domain on the first
   line, e.g. `stock.yourdomain.com` or `yourdomain.com` (no `https://`, no
   trailing slash). Commit it.
2. In **Namecheap → Domain List → Manage → Advanced DNS**, add:

   **If using the root domain (`yourdomain.com`):**
   | Type | Host | Value |
   |---|---|---|
   | A | @ | 185.199.108.153 |
   | A | @ | 185.199.109.153 |
   | A | @ | 185.199.110.153 |
   | A | @ | 185.199.111.153 |

   **If using a subdomain (`stock.yourdomain.com`):**
   | Type | Host | Value |
   |---|---|---|
   | CNAME | stock | yourusername.github.io. |

3. Back in **GitHub → Settings → Pages**, enter your custom domain in the
   "Custom domain" field and save (this also writes the `CNAME` file for you,
   so steps 1 and this can overlap — either works).
4. Tick **Enforce HTTPS** once GitHub shows the certificate as issued (can
   take up to ~24h, usually faster).
5. DNS propagation: usually 10–60 minutes, occasionally longer.

## Notes
- No payments, no cart, no checkout — this is intentionally a browsable
  catalog only. The footer has a contact line for orders; edit the email and
  phone number in `index.html`.
- Prices display in BHD (e.g. `BD 1.700`, 3 decimals) — see `script.js` if
  you ever need to change currency.

## Adding photos (optional, and kept small on purpose)

Images aren't required — items without one just show a colored category tag,
which is why the sample data works with no photos at all.

If you want real photos:

1. Open `compress-image.html` in your browser (just double-click the file —
   no server needed, nothing uploads anywhere, it all runs locally in the
   page).
2. Drop in the photo. It resizes to a sensible max width and re-compresses
   as a JPEG, showing you the before/after file size live. Default settings
   (900px wide, quality 0.72) usually land a normal phone photo under
   ~80–150KB, which is small enough that even 50+ product photos barely
   register against GitHub's free hosting limits.
3. Type a filename (lowercase, no spaces — it suggests one automatically),
   click **Download compressed image**.
4. Create an `images/` folder in your repo (if it doesn't exist yet) and
   upload the compressed file there via GitHub's web UI.
5. In `items.json`, add an `"image"` field to that item:

```json
{
  "sku": "HT-1001",
  "name": "Reinforced Steel Shovel",
  "category": "Hand Tools",
  "image": "images/steel-shovel.jpg",
  "price": 1.700,
  ...
}
```

If an image is missing or fails to load, the card automatically falls back
to the colored category tag — so a typo in the filename never breaks the
layout, it just quietly shows no photo for that item.

