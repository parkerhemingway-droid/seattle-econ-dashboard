// Intermountain MLS (IMLS) Area → ZIP crosswalk
// Source: IMLS "Areas" reference (imlsmembers.com/areas); intra-area ZIP
//         percentages updated 2026-07-31 from live Boise MLS listing
//         distribution in Databricks (main.gold_mls.search_listings).
//
// IMLS reports market statistics by AREA, not by ZIP. Areas map many-to-many
// onto ZIPs: an area spans several ZIPs, and a ZIP can appear in several areas.
// `pct` = share of that area's listings falling in that ZIP (from the IMLS
// area/ZIP distribution). Percentages within an area do not always sum to 100 —
// the long tail of <5% ZIPs is not published.
//
// SCOPE NOTE: the published crosswalk covers the Boise/Meridian/Eagle/Star/Kuna
// core only — i.e. ALL of these ZIPs are in ADA COUNTY. No Canyon County ZIP
// (Nampa, Caldwell, Middleton) appears in the area list, so Canyon County
// inventory has no IMLS area assignment here.

const IMLS_AREAS = [
  { code: '100',  name: 'North Boise',                zips: [['83702', 59], ['83703', 41]] },
  { code: '200',  name: 'Northeast Boise',            zips: [['83716', 55], ['83712', 45]] },
  { code: '300',  name: 'Southeast Boise',            zips: [['83706', 62], ['83716', 38]] },
  { code: '400',  name: 'Boise Bench',                zips: [['83709', 51], ['83706', 25], ['83705', 24]] },
  { code: '500',  name: 'Southwest Boise',            zips: [['83709', 100]] },
  { code: '550',  name: 'S.W. Boise — Meridian Dist.', zips: [['83642', 54], ['83709', 46]] },
  { code: '600',  name: 'West Boise',                 zips: [['83709', 49], ['83704', 36], ['83713', 15]] },
  { code: '650',  name: 'West Boise — Meridian Dist.', zips: [['83704', 37], ['83714', 37], ['83713', 26]] },
  { code: '700',  name: 'Garden City — Meridian Dist.', zips: [['83714', 100]] },
  { code: '800',  name: 'Northwest Boise / Garden City', zips: [['83714', 65], ['83703', 35]] },
  { code: '900',  name: 'Eagle',                      zips: [['83616', 100]] },
  { code: '950',  name: 'Star — Meridian Dist.',      zips: [['83669', 100]] },
  { code: '1000', name: 'S.E. Meridian',              zips: [['83642', 100]] },
  { code: '1010', name: 'S.W. Meridian',              zips: [['83642', 100]] },
  { code: '1020', name: 'N.E. Meridian',              zips: [['83646', 44], ['83642', 41], ['83713', 15]] },
  { code: '1030', name: 'N.W. Meridian',              zips: [['83646', 55], ['83642', 45]] },
  { code: '1100', name: 'Kuna',                       zips: [['83642', 65], ['83634', 35]] },
];

// ── ZIP metadata ─────────────────────────────────────────────────────────────
// County assignments verified against USPS / Idaho county boundaries.
// NOTE: Kuna (83634), Meridian (83642, 83646), Star (83669) and Eagle (83616)
// are ADA County — they are frequently mislabelled as Canyon County.

const IMLS_ZIP_META = {
  // ── Ada County ──
  '83616': { city: 'Eagle',       county: 'Ada',    label: 'Eagle' },
  '83634': { city: 'Kuna',        county: 'Ada',    label: 'Kuna' },
  '83642': { city: 'Meridian',    county: 'Ada',    label: 'Meridian (South)' },
  '83646': { city: 'Meridian',    county: 'Ada',    label: 'Meridian (North)' },
  '83669': { city: 'Star',        county: 'Ada',    label: 'Star' },
  '83702': { city: 'Boise',       county: 'Ada',    label: 'North End / Downtown' },
  '83703': { city: 'Boise',       county: 'Ada',    label: 'Collister / Pierce Park' },
  '83704': { city: 'Boise',       county: 'Ada',    label: 'West Boise' },
  '83705': { city: 'Boise',       county: 'Ada',    label: 'Boise Bench' },
  '83706': { city: 'Boise',       county: 'Ada',    label: 'East End / Depot Bench' },
  '83709': { city: 'Boise',       county: 'Ada',    label: 'Southwest Boise' },
  '83712': { city: 'Boise',       county: 'Ada',    label: 'East Boise / Warm Springs' },
  '83713': { city: 'Boise',       county: 'Ada',    label: 'Northwest Boise' },
  '83714': { city: 'Garden City', county: 'Ada',    label: 'Garden City' },
  '83716': { city: 'Boise',       county: 'Ada',    label: 'Southeast Boise / Foothills' },
  // ── Canyon County (no IMLS area assignment in the published crosswalk) ──
  '83605': { city: 'Caldwell',    county: 'Canyon', label: 'Caldwell (Central)' },
  '83607': { city: 'Caldwell',    county: 'Canyon', label: 'Caldwell (Outer)' },
  '83626': { city: 'Greenleaf',   county: 'Canyon', label: 'Greenleaf' },
  '83644': { city: 'Middleton',   county: 'Canyon', label: 'Middleton' },
  '83651': { city: 'Nampa',       county: 'Canyon', label: 'Nampa (Central)' },
  '83656': { city: 'Notus',       county: 'Canyon', label: 'Notus' },
  '83660': { city: 'Parma',       county: 'Canyon', label: 'Parma' },
  '83676': { city: 'Wilder',      county: 'Canyon', label: 'Wilder' },
  '83686': { city: 'Nampa',       county: 'Canyon', label: 'Nampa (South)' },
  '83687': { city: 'Nampa',       county: 'Canyon', label: 'Nampa (North / East)' },
};

// ── Derived: ZIP → areas ─────────────────────────────────────────────────────

const IMLS_ZIP_TO_AREAS = (() => {
  const map = {};
  IMLS_AREAS.forEach(a => {
    a.zips.forEach(([zip, pct]) => {
      (map[zip] = map[zip] || []).push({ code: a.code, name: a.name, pct });
    });
  });
  // Highest share first so the "primary" area is index 0
  Object.values(map).forEach(list => list.sort((x, y) => y.pct - x.pct));
  return map;
})();

const IMLS_ADA_ZIPS    = Object.keys(IMLS_ZIP_META).filter(z => IMLS_ZIP_META[z].county === 'Ada').sort();
const IMLS_CANYON_ZIPS = Object.keys(IMLS_ZIP_META).filter(z => IMLS_ZIP_META[z].county === 'Canyon').sort();
const IMLS_ALL_ZIPS    = [...IMLS_ADA_ZIPS, ...IMLS_CANYON_ZIPS];

// ZIPs that actually appear in the published area crosswalk
const IMLS_MAPPED_ZIPS = Object.keys(IMLS_ZIP_TO_AREAS).sort();

// ── Helpers ──────────────────────────────────────────────────────────────────

// All areas a ZIP belongs to, highest listing-share first. [] if unmapped.
function imlsAreasForZip(zip) {
  return IMLS_ZIP_TO_AREAS[String(zip)] || [];
}

// The single dominant area for a ZIP, or null.
function imlsPrimaryAreaForZip(zip) {
  const a = imlsAreasForZip(zip);
  return a.length ? a[0] : null;
}

// Short "300 (58%) · 400 (12%)" style label for table cells.
function imlsAreaLabelForZip(zip) {
  const a = imlsAreasForZip(zip);
  if (!a.length) return null;
  return a.map(x => `${x.code} (${x.pct}%)`).join(' · ');
}

function imlsZipMeta(zip) {
  return IMLS_ZIP_META[String(zip)] || null;
}

function imlsCountyForZip(zip) {
  const m = imlsZipMeta(zip);
  return m ? m.county : null;
}

// Roll ZIP-level rows up to IMLS areas using the published listing-share
// weights. `rows` = [{ zipcode, ...numeric fields }]. Returns one row per area
// with each numeric field weighted by pct/100 and summed (counts) or
// share-weighted averaged (prices/ratios).
function imlsRollupByArea(rows, { sumFields = [], avgFields = [] } = {}) {
  const byZip = {};
  rows.forEach(r => { byZip[String(r.zipcode)] = r; });

  return IMLS_AREAS.map(area => {
    const out = { code: area.code, name: area.name, zips: area.zips.map(z => z[0]), coverage: 0 };
    let weightTotal = 0;
    const avgAcc = {};

    area.zips.forEach(([zip, pct]) => {
      const row = byZip[zip];
      if (!row) return;
      const w = pct / 100;
      weightTotal += w;
      sumFields.forEach(f => {
        if (row[f] == null) return;
        out[f] = (out[f] || 0) + row[f] * w;
      });
      avgFields.forEach(f => {
        if (row[f] == null) return;
        avgAcc[f] = avgAcc[f] || { num: 0, den: 0 };
        avgAcc[f].num += row[f] * w;
        avgAcc[f].den += w;
      });
    });

    avgFields.forEach(f => {
      if (avgAcc[f] && avgAcc[f].den > 0) out[f] = avgAcc[f].num / avgAcc[f].den;
    });

    const totalPct = area.zips.reduce((s, z) => s + z[1], 0) / 100;
    out.coverage = totalPct > 0 ? Math.min(1, weightTotal / totalPct) : 0;
    return out;
  });
}

// Cross-reference a set of ZIPs the dashboard has data for against the
// published IMLS crosswalk. Returns what matches, what the dashboard is
// missing, and which of its ZIPs have no area assignment.
function imlsCrossReference(dataZips) {
  const have = new Set((dataZips || []).map(String));
  return {
    matched:     IMLS_MAPPED_ZIPS.filter(z => have.has(z)),
    missingData: IMLS_MAPPED_ZIPS.filter(z => !have.has(z)),
    unmapped:    [...have].filter(z => !IMLS_ZIP_TO_AREAS[z]).sort(),
  };
}
