/* SentinelForge — CelesTrak GP Data Integration
 * Fetches real satellite catalog data from CelesTrak public API
 * and feeds it into the dashboard STATE + UI.
 *
 * API: https://celestrak.org/NORAD/elements/gp.php
 * Format: JSON (GP General Perturbations)
 * No authentication required.
 */

const CELESTRAK = {
    // Endpoints — fetched sequentially to avoid rate limits
    FEEDS: [
        { group: 'last-30-days', label: 'Recent Launches (30d)' },
        { group: 'stations',     label: 'Space Stations' },
        { group: 'visual',       label: 'Brightest / Visual' },
        { group: 'active',       label: 'Active Satellites' },
    ],
    BASE: 'https://celestrak.org/NORAD/elements/gp.php',
    catalog: [],         // All fetched GP records
    byOrbit: { LEO: 0, MEO: 0, GEO: 0, HEO: 0, unknown: 0 },
    byType:  { payload: 0, rocketBody: 0, debris: 0, starlink: 0, oneweb: 0, kuiper: 0, other: 0 },
    fetched: false,
    fetchedAt: null,
    errors: [],
};

// Derive semi-major axis (km) from mean motion (revs/day)
function meanMotionToAltitude(n) {
    const mu = 398600.4418; // km³/s² (Earth GM)
    const T = 86400 / n;    // period in seconds
    const a = Math.pow(mu * (T / (2 * Math.PI)) ** 2, 1/3); // semi-major axis
    return a - 6371;        // altitude above Earth surface
}

// Classify orbit regime from altitude
function classifyOrbit(altKm, ecc, inc) {
    if (ecc > 0.25) return 'HEO';
    if (altKm < 2000)  return 'LEO';
    if (altKm < 35000) return 'MEO';
    if (altKm >= 35000 && altKm < 37000) return 'GEO';
    return 'HEO';
}

// Classify object type from name
function classifyType(name) {
    const n = name.toUpperCase();
    if (n.includes('STARLINK'))  return 'starlink';
    if (n.includes('ONEWEB'))    return 'oneweb';
    if (n.includes('KUIPER'))    return 'kuiper';
    if (n.includes(' DEB'))      return 'debris';
    if (n.includes(' R/B'))      return 'rocketBody';
    if (n.includes('COSMOS') && n.includes('DEB'))  return 'debris';
    if (n.includes('CZ-') && n.includes('R/B'))     return 'rocketBody';
    if (n.includes('FREGAT R/B'))                   return 'rocketBody';
    return 'payload';
}

// Fetch a single CelesTrak group
async function fetchCelesTrakGroup(group) {
    const url = `${CELESTRAK.BASE}?GROUP=${group}&FORMAT=json`;
    try {
        const resp = await fetch(url);
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
        const data = await resp.json();
        return Array.isArray(data) ? data : [];
    } catch (e) {
        CELESTRAK.errors.push({ group, error: e.message });
        console.warn(`[CelesTrak] Failed to fetch ${group}:`, e.message);
        return [];
    }
}

// Main fetch orchestrator — loads groups sequentially
async function loadCelesTrakCatalog() {
    console.log('[CelesTrak] Starting catalog fetch...');
    const seen = new Set(); // dedupe by NORAD_CAT_ID

    // Try 'active' first (biggest payload), then supplements
    for (const feed of CELESTRAK.FEEDS) {
        const records = await fetchCelesTrakGroup(feed.group);
        let added = 0;
        for (const rec of records) {
            if (!rec.NORAD_CAT_ID || seen.has(rec.NORAD_CAT_ID)) continue;
            seen.add(rec.NORAD_CAT_ID);

            const alt = meanMotionToAltitude(rec.MEAN_MOTION);
            const orbit = classifyOrbit(alt, rec.ECCENTRICITY, rec.INCLINATION);
            const type = classifyType(rec.OBJECT_NAME);

            CELESTRAK.catalog.push({
                norad:  rec.NORAD_CAT_ID,
                name:   rec.OBJECT_NAME,
                cospar: rec.OBJECT_ID,
                epoch:  rec.EPOCH,
                n:      rec.MEAN_MOTION,
                ecc:    rec.ECCENTRICITY,
                inc:    rec.INCLINATION,
                raan:   rec.RA_OF_ASC_NODE,
                argp:   rec.ARG_OF_PERICENTER,
                ma:     rec.MEAN_ANOMALY,
                bstar:  rec.BSTAR,
                alt:    Math.round(alt),
                orbit,
                type,
            });

            CELESTRAK.byOrbit[orbit] = (CELESTRAK.byOrbit[orbit] || 0) + 1;
            CELESTRAK.byType[type]   = (CELESTRAK.byType[type]   || 0) + 1;
            added++;
        }
        console.log(`[CelesTrak] ${feed.label}: +${added} objects (${records.length} raw, ${added} new)`);
    }

    CELESTRAK.fetched = true;
    CELESTRAK.fetchedAt = new Date().toISOString();
    console.log(`[CelesTrak] Catalog complete: ${CELESTRAK.catalog.length} unique objects`);
    console.log(`[CelesTrak] Orbits:`, CELESTRAK.byOrbit);
    console.log(`[CelesTrak] Types:`,  CELESTRAK.byType);

    // Update dashboard UI
    updateCatalogUI();
}

// Push CelesTrak data into dashboard elements
function updateCatalogUI() {
    // Update command bar catalog count with REAL number
    const catEl = document.getElementById('catalogCount');
    if (catEl) {
        catEl.textContent = CELESTRAK.catalog.length.toLocaleString();
        catEl.title = `CelesTrak GP Catalog — ${CELESTRAK.catalog.length} objects (fetched ${CELESTRAK.fetchedAt})`;
        catEl.style.color = '#76ff03'; // green = live data
    }

    // Add a subtle indicator that data is live
    const cmdBar = document.querySelector('.cmd-bar');
    if (cmdBar && !document.getElementById('celestrakBadge')) {
        const badge = document.createElement('div');
        badge.id = 'celestrakBadge';
        badge.style.cssText = 'display:flex;align-items:center;gap:4px;font-size:9px;color:#76ff03;padding:0 8px;opacity:0.8';
        badge.innerHTML = `<span style="width:5px;height:5px;background:#76ff03;border-radius:50%;display:inline-block;animation:pulse-dot 2s infinite"></span> CelesTrak LIVE`;
        cmdBar.appendChild(badge);
    }

    // Inject orbit breakdown into Overview tab if it exists
    const invContent = document.getElementById('invContent');
    if (invContent && invContent.querySelector('[data-celestrak]')) return; // already injected

    // Expose for other modules
    window.CELESTRAK = CELESTRAK;
}

// Get orbit stats for overview tab
function getCelesTrakStats() {
    if (!CELESTRAK.fetched) return null;
    const c = CELESTRAK;
    return {
        total: c.catalog.length,
        orbits: { ...c.byOrbit },
        types:  { ...c.byType },
        fetchedAt: c.fetchedAt,
        errors: c.errors.length,
        topConstellations: [
            { name: 'Starlink',  count: c.byType.starlink },
            { name: 'OneWeb',    count: c.byType.oneweb },
            { name: 'Kuiper',    count: c.byType.kuiper },
        ].sort((a,b) => b.count - a.count),
    };
}

// CSS animation for the live dot
const styleEl = document.createElement('style');
styleEl.textContent = `
@keyframes pulse-dot {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.3; }
}`;
document.head.appendChild(styleEl);

// Expose globally
window.CELESTRAK = CELESTRAK;
window.getCelesTrakStats = getCelesTrakStats;

// Auto-fetch on load (delayed to not block initial render)
setTimeout(loadCelesTrakCatalog, 3000);
