/**
 * SentinelForge — Universal Table Enhancement Utility
 * Auto-applies sortable headers + column filters to all tables.
 * Loaded AFTER sentinel_core.js. Uses MutationObserver to catch
 * dynamically rendered tables (inventory panels, modals, etc.).
 */
(function() {
'use strict';

// ── Sort Utility ────────────────────────────────────
function parseVal(txt) {
    if (!txt) return 0;
    const s = txt.replace(/,/g, '').trim();
    // Scientific notation (e.g. 3.2e-4)
    if (/^[\d.]+e[+-]?\d+$/i.test(s)) return parseFloat(s);
    // Percentage
    if (s.endsWith('%')) return parseFloat(s);
    // Duration with units (e.g. "< 12 min", "4.2h", "30s")
    const durM = s.match(/([\d.]+)\s*(ms|min|h|hr|hrs|s|sec)/i);
    if (durM) {
        const v = parseFloat(durM[1]);
        const u = durM[2].toLowerCase();
        if (u === 'ms') return v / 1000;
        if (u === 's' || u === 'sec') return v;
        if (u === 'min') return v * 60;
        return v * 3600; // h/hr/hrs
    }
    // Suffixed numbers (2.4M, 1.2K, 3.5t)
    const sufM = s.match(/^([<>~≈]?\s*)([\d.]+)\s*([KkMmBbTt])/);
    if (sufM) {
        const v = parseFloat(sufM[2]);
        const m = sufM[3].toUpperCase();
        if (m === 'K') return v * 1e3;
        if (m === 'M') return v * 1e6;
        if (m === 'B') return v * 1e9;
        if (m === 'T') return v * 1e12;
    }
    // Distance (km)
    const kmM = s.match(/([\d.]+)\s*km/i);
    if (kmM) return parseFloat(kmM[1]);
    // Degrees
    const degM = s.match(/([\d.]+)°/);
    if (degM) return parseFloat(degM[1]);
    // m² (RCS)
    const m2M = s.match(/([\d.]+)\s*m²/);
    if (m2M) return parseFloat(m2M[1]);
    // Strip leading < > ~ symbols then try numeric
    const cleaned = s.replace(/^[<>~≈]\s*/, '');
    const num = parseFloat(cleaned);
    if (!isNaN(num)) return num;
    // Date-like (ISO substring)
    if (/\d{2}[:\-T]\d{2}/.test(s)) return new Date(s.length < 11 ? '2026-' + s : s).getTime() || 0;
    return s.toLowerCase(); // fallback: string sort
}

function sortTable(table, colIdx, dir) {
    const tbody = table.querySelector('tbody') || table;
    const rows = Array.from(tbody.querySelectorAll('tr')).filter(r => !r.querySelector('th'));
    // Don't sort total/summary rows (keep them at bottom)
    const dataRows = [];
    const stickyRows = [];
    rows.forEach(r => {
        const first = r.cells[0]?.textContent?.trim();
        if (first === 'TOTAL' || r.style.borderTop) stickyRows.push(r);
        else dataRows.push(r);
    });
    dataRows.sort((a, b) => {
        const aVal = parseVal(a.cells[colIdx]?.textContent);
        const bVal = parseVal(b.cells[colIdx]?.textContent);
        if (typeof aVal === 'string' && typeof bVal === 'string') return dir * aVal.localeCompare(bVal);
        if (typeof aVal === 'number' && typeof bVal === 'number') return dir * (aVal - bVal);
        return 0;
    });
    dataRows.forEach(r => tbody.appendChild(r));
    stickyRows.forEach(r => tbody.appendChild(r));
}

// ── Filter Utility ──────────────────────────────────
function filterTable(table, colIdx, value) {
    const tbody = table.querySelector('tbody') || table;
    const rows = Array.from(tbody.querySelectorAll('tr')).filter(r => !r.querySelector('th'));
    rows.forEach(r => {
        if (!value || value === 'ALL') { r.style.display = ''; return; }
        const cell = r.cells[colIdx]?.textContent?.trim().toUpperCase() || '';
        r.style.display = cell.includes(value.toUpperCase()) ? '' : 'none';
    });
}

// ── Enhancement Logic ───────────────────────────────
const enhanced = new WeakSet();

function enhanceTable(table) {
    if (enhanced.has(table)) return;
    const headerRow = table.querySelector('thead tr') || table.querySelector('tr:first-child');
    if (!headerRow) return;
    const ths = headerRow.querySelectorAll('th');
    if (ths.length < 2) return;
    enhanced.add(table);

    // Track sort state
    let currentCol = -1, currentDir = 1;

    ths.forEach((th, idx) => {
        if (!th.textContent.trim()) return; // skip empty header cells (like icon columns)
        th.style.cursor = 'pointer';
        th.style.userSelect = 'none';
        th.style.transition = 'color 0.2s';
        th.title = 'Click to sort';
        // Add sort indicator
        const indicator = document.createElement('span');
        indicator.style.cssText = 'margin-left:3px;font-size:8px;color:#7c4dff;opacity:0.4;transition:opacity 0.2s';
        indicator.textContent = '⇅';
        indicator.className = 'sf-sort-ind';
        th.appendChild(indicator);

        th.addEventListener('click', function(e) {
            e.stopPropagation();
            // Toggle direction
            if (currentCol === idx) currentDir *= -1;
            else { currentCol = idx; currentDir = 1; }
            sortTable(table, idx, currentDir);
            // Update indicators
            headerRow.querySelectorAll('.sf-sort-ind').forEach(s => {
                s.textContent = '⇅'; s.style.opacity = '0.4'; s.style.color = '#7c4dff';
            });
            indicator.textContent = currentDir === 1 ? '▲' : '▼';
            indicator.style.opacity = '1';
            indicator.style.color = '#00e5ff';
        });

        th.addEventListener('mouseenter', () => { th.style.color = '#00e5ff'; });
        th.addEventListener('mouseleave', () => { th.style.color = ''; });
    });

    // ── Auto-detect filterable columns (Status, Tier, Risk, Orbit, Region, Type) ──
    const filterableKeywords = ['status','tier','risk','orbit','region','type','method','priority','duty'];
    ths.forEach((th, idx) => {
        const label = th.textContent.replace(/[⇅▲▼]/g, '').trim().toLowerCase();
        if (!filterableKeywords.some(k => label.includes(k))) return;
        // Collect unique values from this column
        const tbody = table.querySelector('tbody') || table;
        const rows = Array.from(tbody.querySelectorAll('tr')).filter(r => !r.querySelector('th'));
        const values = new Set();
        rows.forEach(r => {
            const cell = r.cells[idx]?.textContent?.trim();
            if (cell) values.add(cell.replace(/[●◐🟢🟡🔴]/g, '').trim());
        });
        if (values.size < 2 || values.size > 12) return; // skip if too few or too many unique values

        // Create filter pill bar
        const filterBar = document.createElement('div');
        filterBar.style.cssText = 'display:flex;gap:4px;flex-wrap:wrap;margin:4px 0;padding:0 2px';
        const allPill = document.createElement('span');
        allPill.textContent = 'All';
        allPill.className = 'sf-filter-pill sf-active';
        allPill.style.cssText = 'font-size:8px;padding:2px 8px;border-radius:10px;cursor:pointer;border:1px solid rgba(124,77,255,0.3);color:#e8eaf6;background:rgba(124,77,255,0.15);transition:all 0.15s;user-select:none';
        allPill.addEventListener('click', () => {
            filterTable(table, idx, 'ALL');
            filterBar.querySelectorAll('.sf-filter-pill').forEach(p => {
                p.style.background = 'transparent'; p.style.color = '#546e7a'; p.style.borderColor = 'rgba(255,255,255,0.06)';
            });
            allPill.style.background = 'rgba(124,77,255,0.15)';
            allPill.style.color = '#e8eaf6';
            allPill.style.borderColor = 'rgba(124,77,255,0.3)';
        });
        filterBar.appendChild(allPill);

        values.forEach(val => {
            const pill = document.createElement('span');
            pill.textContent = val;
            pill.className = 'sf-filter-pill';
            pill.style.cssText = 'font-size:8px;padding:2px 8px;border-radius:10px;cursor:pointer;border:1px solid rgba(255,255,255,0.06);color:#546e7a;transition:all 0.15s;user-select:none';
            pill.addEventListener('click', () => {
                filterTable(table, idx, val);
                filterBar.querySelectorAll('.sf-filter-pill').forEach(p => {
                    p.style.background = 'transparent'; p.style.color = '#546e7a'; p.style.borderColor = 'rgba(255,255,255,0.06)';
                });
                pill.style.background = 'rgba(0,229,255,0.12)';
                pill.style.color = '#00e5ff';
                pill.style.borderColor = 'rgba(0,229,255,0.3)';
            });
            pill.addEventListener('mouseenter', () => { if (!pill.style.background.includes('229')) pill.style.borderColor = 'rgba(124,77,255,0.25)'; pill.style.color = '#b0bec5'; });
            pill.addEventListener('mouseleave', () => { if (!pill.style.background.includes('229')) { pill.style.borderColor = 'rgba(255,255,255,0.06)'; pill.style.color = '#546e7a'; }});
            filterBar.appendChild(pill);
        });

        // Insert filter bar before the table
        table.parentNode.insertBefore(filterBar, table);
    });
}

// ── Scan and enhance all tables ─────────────────────
function scanTables() {
    document.querySelectorAll('.inv-table, table').forEach(t => {
        // Skip tables inside the technician/programmer sub-pages (they have their own system)
        if (t.closest('.yaml-block') || t.closest('#terminal')) return;
        enhanceTable(t);
    });
}

// Initial scan
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => setTimeout(scanTables, 500));
} else {
    setTimeout(scanTables, 500);
}

// Watch for dynamically rendered tables (modals, inventory tabs)
const observer = new MutationObserver(mutations => {
    let hasNew = false;
    for (const m of mutations) {
        for (const n of m.addedNodes) {
            if (n.nodeType === 1 && (n.tagName === 'TABLE' || n.querySelector?.('table'))) {
                hasNew = true; break;
            }
        }
        if (hasNew) break;
    }
    if (hasNew) setTimeout(scanTables, 100);
});

observer.observe(document.body || document.documentElement, { childList: true, subtree: true });

})();
