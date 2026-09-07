// Flourish chart embeds for the Boise-area counties, placed under each
// county's historical table in the Boise section.
//
// Each county gets two charts: the Compass-branded median price chart (a
// seasonal year-over-year overlay, 2023-2026) and the absorption rate chart
// (a continuous monthly series). Both are the same assets used in Compass
// decks, so the site and the decks can never show different numbers.
//
// Publishing state is probed rather than assumed. Flourish serves an embed
// with 200 once published and a bare S3 403 page before that, and sends
// access-control-allow-origin: * either way, so a HEAD from the browser can
// read the status. An unpublished chart therefore never lands on the page as
// a raw "403 Forbidden" box: absorption falls back to the local Chart.js
// renderer, and median shows a short note with a link to publish it.
//
// Downloads are offered three ways because they serve different needs: CSV
// for the underlying numbers, IMG for a quick drop into a deck or email, and
// the Flourish page itself for the interactive version and a full-resolution
// export.

const BOISE_FLOURISH = {
  Ada:    { median: 30181985, absorption: 30182179 },
  Canyon: { median: 30181986, absorption: 30182180 },
  Gem:    { median: 30181843, absorption: 30182181 },
  Valley: { median: 30181846, absorption: 30182182 },
};

const BFC_EMBED_BASE = 'https://flo.uri.sh/visualisation/';
const BFC_PUBLIC_BASE = 'https://public.flourish.studio/visualisation/';

// One probe per visualisation id per page load, shared between callers, so
// eight charts do not become eight duplicate requests on re-render.
const bfcPublished = {};
function bfcIsPublished(id) {
  if (!bfcPublished[id]) {
    bfcPublished[id] = fetch(`${BFC_EMBED_BASE}${id}/embed`, { method: 'HEAD' })
      .then(r => r.ok)
      .catch(() => false);   // offline or blocked — treat as unpublished and fall back
  }
  return bfcPublished[id];
}

function bfcToCsv(rows) {
  return rows.map(r => r.map(v => {
    const s = v === null || v === undefined ? '' : String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  }).join(',')).join('\n');
}

// data: URL rather than blob:, matching the IMLS area export — blob downloads
// are dropped in the wrapped in-app browsers this dashboard gets opened in.
function bfcSaveDataUrl(href, filename) {
  const a = document.createElement('a');
  a.href = href;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

function bfcSaveCsv(rows, filename) {
  bfcSaveDataUrl('data:text/csv;charset=utf-8,' + encodeURIComponent(bfcToCsv(rows)), filename);
}

// Flourish renders a 1020px JPEG of the published chart at /thumbnail. The
// download attribute is ignored cross-origin, so the bytes are fetched and
// re-issued as a data: URL to make it an actual save rather than a navigation.
function bfcSaveImage(id, filename, btn) {
  const original = btn.textContent;
  btn.textContent = '…';
  btn.disabled = true;
  fetch(`${BFC_PUBLIC_BASE}${id}/thumbnail`)
    .then(r => { if (!r.ok) throw new Error(r.status); return r.blob(); })
    .then(blob => new Promise((res, rej) => {
      const fr = new FileReader();
      fr.onload = () => res(fr.result);
      fr.onerror = rej;
      fr.readAsDataURL(blob);
    }))
    .then(dataUrl => bfcSaveDataUrl(dataUrl, filename))
    .catch(() => window.open(`${BFC_PUBLIC_BASE}${id}/`, '_blank', 'noopener'))
    .finally(() => { btn.textContent = original; btn.disabled = false; });
}

// The median CSV is the year-over-year matrix the chart actually plots, not
// the 14-month table above it — a download should match the chart it sits
// under.
function bfcMedianRows(county) {
  const d = BOISE_MEDIAN_YOY;
  const rows = [['Month'].concat(d.years)];
  d.months.forEach((m, i) => {
    rows.push([m].concat(d.counties[county][i].map(v => v === null ? '' : v)));
  });
  return rows;
}

function bfcAbsorptionRows(county, history) {
  const rows = [['county', 'month', 'closed_sf', 'on_market_month_end', 'absorption_pct', 'months_supply']];
  history.forEach(m => rows.push([
    county, m.month, m.sf,
    m.inventory == null ? '' : m.inventory,
    m.absorption == null ? '' : m.absorption.toFixed(1),
    m.monthsSupply == null ? '' : m.monthsSupply.toFixed(1),
  ]));
  return rows;
}

// Flourish embeds loaded with ?auto=1 post their rendered height to the parent
// once they have laid out, and again on every resize. Without this the iframe
// keeps whatever height we guessed and the chart is clipped.
//
// The payload arrives as a JSON *string*, not an object, so it has to be
// parsed — reading e.data.sender directly silently matches nothing. Origin is
// checked because this is untrusted cross-origin input, and frames are matched
// on contentWindow rather than the message's src so we do not depend on how
// Flourish spells the URL back to us.
const BFC_ORIGINS = ['https://flo.uri.sh', 'https://public.flourish.studio'];
let bfcResizeBound = false;
const bfcFrames = [];
function bfcBindResize() {
  if (bfcResizeBound) return;
  bfcResizeBound = true;
  window.addEventListener('message', e => {
    if (BFC_ORIGINS.indexOf(e.origin) === -1) return;
    let d = e.data;
    if (typeof d === 'string') {
      try { d = JSON.parse(d); } catch (err) { return; }
    }
    if (!d || d.sender !== 'Flourish' || d.context !== 'iframe.resize' || !d.height) return;
    const hit = bfcFrames.find(f => f.contentWindow === e.source);
    if (hit) hit.style.height = d.height + 'px';
  });
}

// Header row: title on the left, download controls on the right.
function bfcHeader(el, title, buttons) {
  const head = document.createElement('div');
  head.style.cssText = 'display:flex;align-items:baseline;justify-content:space-between;gap:12px;flex-wrap:wrap;margin-top:28px;';
  head.innerHTML = `<div class="subsection-title" style="margin:0;">${title}</div>`;
  const actions = document.createElement('div');
  actions.style.cssText = 'display:flex;gap:6px;';
  buttons.forEach(b => {
    const btn = document.createElement('button');
    btn.className = 'btn-icon';
    btn.textContent = b.label;
    btn.title = b.title;
    btn.addEventListener('click', ev => { ev.stopPropagation(); b.onClick(btn); });
    actions.appendChild(btn);
  });
  head.appendChild(actions);
  el.appendChild(head);
}

// Flourish charts are Compass house style — light background, Compass Sans —
// so they sit on a white card rather than bleeding into the dark UI, which
// would read as a rendering fault rather than a deliberate asset.
function bfcMountFrame(el, id, marginBottom) {
  bfcBindResize();
  const card = document.createElement('div');
  card.style.cssText = `background:#fff;border:1px solid var(--border);border-radius:var(--card-radius);overflow:hidden;margin-bottom:${marginBottom};`;
  const frame = document.createElement('iframe');
  frame.src = `${BFC_EMBED_BASE}${id}/embed?auto=1`;
  frame.title = 'Flourish chart';
  frame.loading = 'lazy';
  frame.scrolling = 'no';
  frame.style.cssText = 'width:100%;height:480px;border:0;display:block;';
  card.appendChild(frame);
  el.appendChild(card);
  bfcFrames.push(frame);
}

function bfcUnpublishedNote(el, id, label, marginBottom) {
  const p = document.createElement('p');
  p.style.cssText = `margin:0 0 ${marginBottom}; max-width:90ch; color:var(--yellow); font-size:0.8rem;`;
  p.innerHTML = `The ${label} chart is built but not yet published on Flourish, so it cannot be embedded. ` +
    `<a href="https://app.flourish.studio/visualisation/${id}/edit" target="_blank" rel="noopener" style="color:var(--accent)">Open it and hit Publish</a>` +
    ` and it will appear here on the next load.`;
  el.appendChild(p);
}

// Appends both charts for one county. `history` is the same monthlyHistory the
// table above renders, used for the absorption CSV and the local fallback.
function renderBoiseFlourishCharts(el, county, history) {
  const ids = BOISE_FLOURISH[county];
  if (!ids) return;
  const stamp = new Date().toISOString().slice(0, 10);
  const slug = county.toLowerCase();
  const hasNote = history.some(m => m.absorption == null);

  // ── Median price ──
  bfcHeader(el, `${county} County Median Sale Price`, [
    { label: 'CSV', title: `Download ${county} County median price by month and year as CSV`,
      onClick: () => bfcSaveCsv(bfcMedianRows(county), `${slug}-county-median-price-${stamp}.csv`) },
    { label: 'IMG', title: `Download the ${county} County median price chart as an image`,
      onClick: btn => bfcSaveImage(ids.median, `${slug}-county-median-price-${stamp}.jpg`, btn) },
    { label: 'Open ↗', title: 'Open the interactive chart on Flourish',
      onClick: () => window.open(`${BFC_PUBLIC_BASE}${ids.median}/`, '_blank', 'noopener') },
  ]);
  const medianSlot = document.createElement('div');
  el.appendChild(medianSlot);
  bfcIsPublished(ids.median).then(ok => {
    if (ok) bfcMountFrame(medianSlot, ids.median, '8px');
    else bfcUnpublishedNote(medianSlot, ids.median, `${county} County median price`, '8px');
  });

  // ── Absorption rate ──
  bfcHeader(el, `${county} County Absorption Rate`, [
    { label: 'CSV', title: `Download ${county} County absorption data as CSV`,
      onClick: () => bfcSaveCsv(bfcAbsorptionRows(county, history), `${slug}-county-absorption-${stamp}.csv`) },
    { label: 'IMG', title: `Download the ${county} County absorption chart as an image`,
      onClick: btn => bfcSaveImage(ids.absorption, `${slug}-county-absorption-${stamp}.jpg`, btn) },
    { label: 'Open ↗', title: 'Open the interactive chart on Flourish',
      onClick: () => window.open(`${BFC_PUBLIC_BASE}${ids.absorption}/`, '_blank', 'noopener') },
  ]);
  const absSlot = document.createElement('div');
  el.appendChild(absSlot);
  bfcIsPublished(ids.absorption).then(ok => {
    if (ok) {
      bfcMountFrame(absSlot, ids.absorption, hasNote ? '8px' : '32px');
    } else if (typeof renderBoiseAbsorptionChart === 'function') {
      // Local Chart.js version of the same series, so the page still carries
      // the chart while the Flourish one is unpublished.
      renderBoiseAbsorptionChart(absSlot, county, history);
    } else {
      bfcUnpublishedNote(absSlot, ids.absorption, `${county} County absorption`, hasNote ? '8px' : '32px');
    }
  });
}
