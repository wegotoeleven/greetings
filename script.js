const params = new URLSearchParams(window.location.search);
const rawKey = params.get("card");
const key = rawKey ? rawKey.trim().toLowerCase() : null;
const cardEl = document.querySelector(".card");
const errorEl = document.getElementById("error");
const photoEl = document.getElementById("photo");
const photoWrapEl = document.getElementById("photo-wrap");
const decorationEl = document.getElementById("decoration");
const downloadBtn = document.getElementById("download");

fetch("data.json")
  .then(r => r.json())
  .then(data => {
    if (!key) return showError("Missing card slug in URL (use ?card=...)");

    const person = data[key];
    if (!person) {
      return showError(`Card not found for slug "${key}"`);
    }

    document.getElementById("greeting").textContent =
      `To ${person.name},`;

    document.getElementById("message").textContent = person.message;
    document.getElementById("footer").textContent = formatFooter(person);

    if (person.image && photoEl) {
      photoEl.onload = () => {
        if (photoWrapEl && photoEl.naturalWidth && photoEl.naturalHeight) {
          photoWrapEl.style.aspectRatio = `${photoEl.naturalWidth} / ${photoEl.naturalHeight}`;
        }
        photoWrapEl?.classList.remove("hidden");
      };
      photoEl.onerror = () => showError("Image failed to load");
      photoEl.src = person.image;
    }

    if (person.decoration && decorationEl) {
      decorationEl.src = person.decoration;
      decorationEl.classList.remove("hidden");
    }
  })
  .catch(() => showError("Could not load card data"));

downloadBtn?.addEventListener("click", () => {
  downloadCard().catch(() => showError("Could not download card"));
});

function showError(message = "Card not found.") {
  cardEl?.classList.add("hidden");
  errorEl?.classList.remove("hidden");
  if (errorEl) errorEl.textContent = message;
}

function formatFooter(person) {
  const from = person.footer ? `From ${person.footer}` : "";
  const occasion = person.occasion ? person.occasion : "";
  const year = person.year ? String(person.year) : "";
  const tail = [occasion, year].filter(Boolean).join(" ");
  return [from, tail].filter(Boolean).join(", ");
}

async function downloadCard() {
  if (!cardEl) return;

  const rect = cardEl.getBoundingClientRect();
  const canvas = document.createElement("canvas");
  const scale = window.devicePixelRatio || 1;
  canvas.width = Math.round(rect.width * scale);
  canvas.height = Math.round(rect.height * scale);
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  ctx.scale(scale, scale);

  await drawCardBackground(ctx, rect.width, rect.height);

  if (photoWrapEl && photoEl) {
    await waitForImage(photoEl);
    const wrapRect = photoWrapEl.getBoundingClientRect();
    const x = wrapRect.left - rect.left;
    const y = wrapRect.top - rect.top;
    drawCoverImage(ctx, photoEl, x, y, wrapRect.width, wrapRect.height);

    if (decorationEl && !decorationEl.classList.contains("hidden")) {
      await waitForImage(decorationEl);
      drawCoverImage(ctx, decorationEl, x, y, wrapRect.width, wrapRect.height);
    }
  }

  drawTextFromElement(ctx, document.getElementById("greeting"), rect);
  drawTextFromElement(ctx, document.getElementById("message"), rect);
  drawTextFromElement(ctx, document.getElementById("footer"), rect);

  const blob = await new Promise(resolve => canvas.toBlob(resolve, "image/png"));
  if (!blob) return;
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "card.png";
  link.click();
  URL.revokeObjectURL(url);
}

async function drawCardBackground(ctx, width, height) {
  const bg = await loadImage("assets/bg.png");
  if (bg) {
    drawCoverImage(ctx, bg, 0, 0, width, height);
  }
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, "rgba(12,28,55,0.9)");
  gradient.addColorStop(1, "rgba(22,54,92,0.9)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
}

function drawCoverImage(ctx, img, x, y, w, h) {
  const iw = img.naturalWidth || img.width;
  const ih = img.naturalHeight || img.height;
  if (!iw || !ih) return;
  const scale = Math.max(w / iw, h / ih);
  const sw = w / scale;
  const sh = h / scale;
  const sx = (iw - sw) / 2;
  const sy = (ih - sh) / 2;
  ctx.drawImage(img, sx, sy, sw, sh, x, y, w, h);
}

function drawTextFromElement(ctx, el, cardRect) {
  if (!el) return;
  const rect = el.getBoundingClientRect();
  const style = window.getComputedStyle(el);
  const x = rect.left - cardRect.left;
  const y = rect.top - cardRect.top;
  const maxWidth = rect.width;
  const fontSize = parseFloat(style.fontSize) || 16;
  const lineHeight = parseFloat(style.lineHeight) || fontSize * 1.2;
  ctx.fillStyle = style.color;
  ctx.textBaseline = "top";
  ctx.font = `${style.fontWeight} ${fontSize}px ${style.fontFamily}`;
  drawWrappedText(ctx, el.textContent || "", x, y, maxWidth, lineHeight);
}

function drawWrappedText(ctx, text, x, y, maxWidth, lineHeight) {
  const words = text.split(/\s+/).filter(Boolean);
  let line = "";
  let offsetY = 0;
  for (const word of words) {
    const testLine = line ? `${line} ${word}` : word;
    const width = ctx.measureText(testLine).width;
    if (width > maxWidth && line) {
      ctx.fillText(line, x, y + offsetY);
      line = word;
      offsetY += lineHeight;
    } else {
      line = testLine;
    }
  }
  if (line) ctx.fillText(line, x, y + offsetY);
}

function waitForImage(img) {
  if (img.complete && img.naturalWidth) return Promise.resolve();
  return new Promise(resolve => {
    img.onload = () => resolve();
    img.onerror = () => resolve();
  });
}

function loadImage(src) {
  return new Promise(resolve => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}
