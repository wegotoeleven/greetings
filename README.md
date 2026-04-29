# greetings

A client-side personalized greeting card generator served at [greetings.warnefordjones.xyz](https://greetings.warnefordjones.xyz).

Each recipient gets a unique URL containing their slug. The page fetches `data.json`, looks up the slug, and renders a styled card with a personal message, optional photo, and optional decoration overlay. A download button exports the rendered card as a PNG.

## Prerequisites

A static web server or static hosting platform (e.g. GitHub Pages). No build toolchain or runtime dependencies required — the project is plain HTML, CSS, and JavaScript.

## Installation

```bash
git clone https://github.com/wegotoeleven/greetings.git
cd greetings
```

Serve the directory with any static server, for example:

```bash
npx serve .
# or
python3 -m http.server 8080
```

## Usage

Open a card by passing the recipient's slug as the `card` query parameter:

```
https://greetings.warnefordjones.xyz/?card=<slug>
```

If the slug is missing or not found in `data.json`, the page displays an error message.

Click **Download card** to save the rendered card as `card.png`.

## Configuration

Cards are defined in `data.json` as a top-level object keyed by slug:

```json
{
  "slug_here": {
    "name": "Recipient Name",
    "message": "Your personal message.",
    "image": "https://…",
    "decoration": "https://…",
    "footer": "From Name",
    "occasion": "Christmas",
    "year": 2025
  }
}
```

| Field | Required | Description |
|---|---|---|
| `name` | Yes | Displayed as "To \<name\>," |
| `message` | Yes | Body text of the card |
| `image` | No | URL or data URI for the photo |
| `decoration` | No | URL or data URI overlaid on top of the photo |
| `footer` | No | Shown as "From \<footer\>" |
| `occasion` | No | Appended to the footer line |
| `year` | No | Appended after occasion |

Images may be remote URLs or inline base64 data URIs.

## License

No license file is present in this repository.
