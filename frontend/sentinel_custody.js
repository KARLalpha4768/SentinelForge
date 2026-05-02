/* SentinelForge — Custody Chain Timeline Visualization
 * Shows sensor-to-sensor handoffs for high-priority objects.
 *
 * The custody chain is the most operationally critical view in SSA:
 * it shows WHEN each sensor had custody of an object, WHERE gaps exist,
 * and HOW long until custody is lost entirely.
 *
 * Renders as a horizontal Gantt-style timeline in the inventory panel.
 */

const CUSTODY_DATA = [
    {
        norad: 25544, name: 'ISS (ZARYA)',
        priority: 'CRITICAL',
        segments: [
            { site: 'USSF Eglin',       start: '2026-05-02T00:14:00Z', end: '2026-05-02T00:18:30Z', quality: 'GOOD', obs: 12 },
            { site: 'LeoLabs Midland',   start: '2026-05-02T00:31:00Z', end: '2026-05-02T00:37:45Z', quality: 'GOOD', obs: 18 },
            { site: 'ESA Tenerife',      start: '2026-05-02T01:02:00Z', end: '2026-05-02T01:08:15Z', quality: 'GOOD', obs: 14 },
            { site: 'USSF Diego Garcia', start: '2026-05-02T02:44:00Z', end: '2026-05-02T02:51:00Z', quality: 'MARGINAL', obs: 7 },
            { site: 'ExoAnalytic Hawaii', start: '2026-05-02T04:12:00Z', end: '2026-05-02T04:19:30Z', quality: 'GOOD', obs: 16 },
            { site: 'Space Fence Kwaj',  start: '2026-05-02T05:33:00Z', end: '2026-05-02T05:38:00Z', quality: 'GOOD', obs: 22 },
        ],
        custodyPct: 98.2,
    },
    {
        norad: 43235, name: 'COSMOS 2535',
        priority: 'HIGH',
        segments: [
            { site: 'USSF Cape Cod',     start: '2026-05-02T00:02:00Z', end: '2026-05-02T00:06:15Z', quality: 'GOOD', obs: 9 },
            { site: 'USSF Cavalier',     start: '2026-05-02T01:31:00Z', end: '2026-05-02T01:35:45Z', quality: 'MARGINAL', obs: 5 },
            // GAP: 3h 27m — object not tracked
            { site: 'Slingshot AUS',     start: '2026-05-02T05:02:00Z', end: '2026-05-02T05:09:00Z', quality: 'GOOD', obs: 11 },
        ],
        custodyPct: 72.4,
    },
    {
        norad: 48274, name: 'STARLINK-2395',
        priority: 'MEDIUM',
        segments: [
            { site: 'LeoLabs NZ',        start: '2026-05-02T00:22:00Z', end: '2026-05-02T00:26:30Z', quality: 'GOOD', obs: 14 },
            { site: 'ESA Kiruna',        start: '2026-05-02T01:55:00Z', end: '2026-05-02T02:01:00Z', quality: 'GOOD', obs: 16 },
            { site: 'USSF Maui',         start: '2026-05-02T03:14:00Z', end: '2026-05-02T03:19:45Z', quality: 'GOOD', obs: 12 },
            { site: 'ExoAnalytic Aus',   start: '2026-05-02T04:48:00Z', end: '2026-05-02T04:53:30Z', quality: 'GOOD', obs: 10 },
        ],
        custodyPct: 91.7,
    },
    {
        norad: 99901, name: 'UCT-2026-047',
        priority: 'CRITICAL',
        segments: [
            { site: 'Space Fence Kwaj',  start: '2026-05-02T02:14:00Z', end: '2026-05-02T02:16:30Z', quality: 'MARGINAL', obs: 3 },
            // Lost after single pass — needs urgent reacquisition
        ],
        custodyPct: 12.1,
    },
];

/**
 * Render the custody chain timeline into a container element.
 */
function renderCustodyTimeline(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    // Time range: last 6 hours
    const now = new Date();
    const windowStart = new Date(now.getTime() - 6 * 3600 * 1000);
    const windowMs = 6 * 3600 * 1000;

    const priorityColors = {
        CRITICAL: '#ff1744',
        HIGH: '#ff6d00',
        MEDIUM: '#ffab00',
        LOW: '#78909c',
    };

    const qualityColors = {
        GOOD: '#00e676',
        MARGINAL: '#ffab00',
        POOR: '#ff1744',
    };

    let html = `
        <div style="font-size:10px;color:#b0bec5;margin-bottom:8px">
            <strong>Custody Chain</strong> — Last 6 hours · ${CUSTODY_DATA.length} tracked objects
        </div>
        <div style="display:flex;gap:4px;font-size:7px;color:#546e7a;margin-bottom:6px">
            <span>00:00</span><span style="flex:1;text-align:center">03:00</span><span>06:00 UTC</span>
        </div>
    `;

    CUSTODY_DATA.forEach(obj => {
        const pColor = priorityColors[obj.priority] || '#78909c';
        const custodyColor = obj.custodyPct > 90 ? '#00e676' : obj.custodyPct > 60 ? '#ffab00' : '#ff1744';

        // Track bar
        html += `<div style="margin-bottom:6px">
            <div style="display:flex;align-items:center;gap:6px;margin-bottom:2px">
                <span style="color:${pColor};font-size:7px;font-weight:700">${obj.priority}</span>
                <span style="color:#e8eaf6;font-size:9px;font-weight:600">${obj.name}</span>
                <span style="color:#546e7a;font-size:8px;font-family:'JetBrains Mono',mono">${obj.norad}</span>
                <span style="flex:1"></span>
                <span style="color:${custodyColor};font-size:8px;font-weight:700">${obj.custodyPct}%</span>
            </div>
            <div style="position:relative;height:14px;background:rgba(255,255,255,0.03);border-radius:3px;overflow:hidden;border:1px solid rgba(255,255,255,0.06)">`;

        // Segment bars
        obj.segments.forEach(seg => {
            const segStart = new Date(seg.start).getTime();
            const segEnd = new Date(seg.end).getTime();
            const left = Math.max(0, (segStart - windowStart.getTime()) / windowMs * 100);
            const width = Math.max(0.5, (segEnd - segStart) / windowMs * 100);
            const color = qualityColors[seg.quality] || '#00e676';

            html += `<div title="${seg.site}: ${seg.obs} obs (${seg.quality})"
                style="position:absolute;left:${left}%;width:${width}%;top:1px;bottom:1px;
                       background:${color};border-radius:2px;opacity:0.85;
                       cursor:pointer;transition:opacity 0.2s"
                onmouseover="this.style.opacity='1'"
                onmouseout="this.style.opacity='0.85'">
            </div>`;
        });

        // Gap indicators (red dashes between segments)
        for (let i = 0; i < obj.segments.length - 1; i++) {
            const gapStart = new Date(obj.segments[i].end).getTime();
            const gapEnd = new Date(obj.segments[i + 1].start).getTime();
            const gapMin = Math.round((gapEnd - gapStart) / 60000);

            if (gapMin > 30) {
                const left = (gapStart - windowStart.getTime()) / windowMs * 100;
                const width = (gapEnd - gapStart) / windowMs * 100;
                const midLeft = left + width / 2;

                html += `<div title="CUSTODY GAP: ${gapMin} min"
                    style="position:absolute;left:${midLeft - 1}%;width:2%;top:5px;
                           font-size:6px;color:#ff1744;text-align:center;
                           font-weight:700;pointer-events:none">
                    ⚠
                </div>`;
            }
        }

        html += `</div></div>`;
    });

    // Legend
    html += `<div style="display:flex;gap:12px;margin-top:8px;font-size:7px;color:#546e7a">
        <span>■ <span style="color:#00e676">GOOD</span></span>
        <span>■ <span style="color:#ffab00">MARGINAL</span></span>
        <span>⚠ <span style="color:#ff1744">GAP</span></span>
    </div>`;

    container.innerHTML = html;
}

// Expose globally
window.CUSTODY_DATA = CUSTODY_DATA;
window.renderCustodyTimeline = renderCustodyTimeline;

console.log('[CUSTODY] Module loaded. Use renderCustodyTimeline("containerId")');
