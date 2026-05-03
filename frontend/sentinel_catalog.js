// SentinelForge Catalog Data & Logic

const CATALOG_DATA = [
    { norad: 25544, name: 'ISS (ZARYA)', type: 'Payload', regime: 'LEO', alt: 420, inc: 51.6, period: 92.9, rcs: 400.0, owner: 'International', country: 'Multi', status: 'Active', launched: '1998-11-20', img: 'img/sat_inspector.png', desc: 'International Space Station. Largest artificial object in space. Permanently crewed since 2000.' },
    { norad: 48274, name: 'STARLINK-3391', type: 'Payload', regime: 'LEO', alt: 550, inc: 53.0, period: 95.6, rcs: 2.4, owner: 'SpaceX', country: 'USA', status: 'Active', launched: '2023-03-24', img: 'img/sat_starlink.png', desc: 'SpaceX Starlink v2-Mini broadband satellite. Utilizes argon Hall-effect thrusters and optical inter-satellite links.' },
    { norad: 43013, name: 'NOAA-20', type: 'Payload', regime: 'LEO', alt: 825, inc: 98.7, period: 101.4, rcs: 5.2, owner: 'NOAA', country: 'USA', status: 'Active', launched: '2017-11-18', img: 'img/sat_earth_obs.png', desc: 'Joint Polar Satellite System (JPSS-1). Provides global environmental data for weather forecasting.' },
    { norad: 27386, name: 'FENGYUN 1C DEB', type: 'Debris', regime: 'LEO', alt: 850, inc: 98.6, period: 102.1, rcs: 0.1, owner: 'PRC', country: 'China', status: 'Defunct', launched: '1999-05-10', img: 'img/debris_asat.png', desc: 'Debris from the 2007 Chinese anti-satellite missile test. Created >3000 trackable fragments.' },
    { norad: 44832, name: 'COSMOS 2251 DEB', type: 'Debris', regime: 'LEO', alt: 790, inc: 74.0, period: 100.5, rcs: 0.2, owner: 'Russia', country: 'Russia', status: 'Defunct', launched: '1993-06-16', img: 'img/debris_collision.png', desc: 'Debris from the 2009 Iridium-Cosmos collision — the first accidental hypervelocity collision between two intact satellites.' },
    { norad: 39166, name: 'TDRS-11', type: 'Payload', regime: 'GEO', alt: 35786, inc: 4.5, period: 1436.1, rcs: 15.0, owner: 'NASA', country: 'USA', status: 'Active', launched: '2013-01-31', img: 'img/sat_geo_comms.png', desc: 'Tracking and Data Relay Satellite. Provides continuous high-bandwidth communication with ISS and Hubble.' },
    { norad: 28485, name: 'USA-179', type: 'Payload', regime: 'GEO', alt: 35790, inc: 2.1, period: 1436.2, rcs: 12.5, owner: 'USSF', country: 'USA', status: 'Active', launched: '2004-08-31', img: 'img/sat_geo_comms.png', desc: 'Advanced EHF (AEHF) military communications satellite. Highly secure, jam-resistant global comms.' },
    { norad: 40555, name: 'GSAT-6', type: 'Payload', regime: 'GEO', alt: 35785, inc: 0.1, period: 1436.1, rcs: 10.0, owner: 'ISRO', country: 'India', status: 'Active', launched: '2015-08-27', img: 'img/sat_geo_comms.png', desc: 'Indian military communications satellite featuring a 6-meter unfurlable antenna.' },
    { norad: 41456, name: 'GALILEO 14', type: 'Payload', regime: 'MEO', alt: 23222, inc: 56.0, period: 844.2, rcs: 3.5, owner: 'ESA', country: 'EU', status: 'Active', launched: '2016-05-24', img: 'img/sat_navigation.png', desc: 'European global navigation satellite system (GNSS) constellation member.' },
    { norad: 36585, name: 'NAVSTAR 65', type: 'Payload', regime: 'MEO', alt: 20200, inc: 55.0, period: 717.9, rcs: 4.1, owner: 'USSF', country: 'USA', status: 'Active', launched: '2010-05-28', img: 'img/sat_navigation.png', desc: 'GPS Block IIF navigation satellite providing precision PNT services.' },
    { norad: 37849, name: 'COSMOS 2474', type: 'Payload', regime: 'MEO', alt: 19100, inc: 64.8, period: 675.7, rcs: 4.0, owner: 'Russia', country: 'Russia', status: 'Active', launched: '2011-10-02', img: 'img/sat_navigation.png', desc: 'GLONASS-M navigation satellite.' },
    { norad: 49044, name: 'LUCH-5X', type: 'Payload', regime: 'GEO', alt: 35780, inc: 0.5, period: 1436.0, rcs: 8.5, owner: 'Russia', country: 'Russia', status: 'Active', launched: '2023-08-15', img: 'img/sat_inspector.png', desc: 'Russian data relay satellite often observed performing proximity operations near Western commercial GEO satellites.' },
    { norad: 53123, name: 'CZ-5B R/B', type: 'Rocket Body', regime: 'LEO', alt: 180, inc: 41.5, period: 88.2, rcs: 18.5, owner: 'CNSA', country: 'China', status: 'Decayed', launched: '2022-10-31', img: 'img/lv_cz5b.png', desc: 'Long March 5B core stage. Remained in orbit for 4 days before uncontrolled reentry over the Pacific Ocean.' },
    { norad: 38249, name: 'FALCON 9 R/B', type: 'Rocket Body', regime: 'MEO', alt: 11500, inc: 28.5, period: 385.1, rcs: 12.0, owner: 'SpaceX', country: 'USA', status: 'Defunct', launched: '2012-10-08', img: 'img/sat_rocket_body.png', desc: 'Spent upper stage from an early Falcon 9 mission.' },
    { norad: 45167, name: 'MEV-1', type: 'Payload', regime: 'GEO', alt: 35800, inc: 0.2, period: 1436.5, rcs: 6.0, owner: 'Northrop Grumman', country: 'USA', status: 'Active', launched: '2019-10-09', img: 'img/sat_inspector.png', desc: 'Mission Extension Vehicle. First commercial satellite servicing vehicle to dock with a client satellite in GEO.' },
    { norad: 44049, name: 'IRIDIUM 104', type: 'Payload', regime: 'LEO', alt: 780, inc: 86.4, period: 100.3, rcs: 3.2, owner: 'Iridium', country: 'USA', status: 'Active', launched: '2019-01-11', img: 'img/sat_iridium.png', desc: 'Iridium NEXT mobile communications constellation satellite.' },
    { norad: 50928, name: 'USA-326', type: 'Payload', regime: 'LEO', alt: 400, inc: 97.4, period: 92.6, rcs: 4.5, owner: 'NRO', country: 'USA', status: 'Active', launched: '2022-02-02', img: 'img/sat_elint.png', desc: 'Classified National Reconnaissance Office payload, suspected electro-optical imaging.' },
    { norad: 41849, name: 'TIANGONG', type: 'Payload', regime: 'LEO', alt: 390, inc: 41.5, period: 92.4, rcs: 180.0, owner: 'CNSA', country: 'China', status: 'Active', launched: '2021-04-29', img: 'img/sat_inspector.png', desc: 'Chinese modular space station (CSS). Core module Tianhe launched in 2021.' },
    { norad: 25556, name: 'NOAA-15', type: 'Payload', regime: 'LEO', alt: 805, inc: 98.7, period: 100.9, rcs: 4.8, owner: 'NOAA', country: 'USA', status: 'Defunct', launched: '1998-05-13', img: 'img/sat_earth_obs.png', desc: 'Legacy POES weather satellite. Suffered multiple anomalies and partial breakups but remains intact.' },
    { norad: 50465, name: 'COSMOS 2551', type: 'Payload', regime: 'LEO', alt: 300, inc: 67.1, period: 90.5, rcs: 2.1, owner: 'Russia', country: 'Russia', status: 'Decayed', launched: '2021-09-09', img: 'img/sat_elint.png', desc: 'Russian military reconnaissance satellite that failed shortly after launch and reentered.' },
    // Inject more simulated objects to reach ~35 items for a robust table
    { norad: 51234, name: 'STARLINK-4011', type: 'Payload', regime: 'LEO', alt: 540, inc: 53.2, period: 95.4, rcs: 2.4, owner: 'SpaceX', country: 'USA', status: 'Active', launched: '2023-08-11', img: 'img/sat_starlink.png', desc: 'SpaceX Starlink broadband satellite.' },
    { norad: 51235, name: 'STARLINK-4012', type: 'Payload', regime: 'LEO', alt: 540, inc: 53.2, period: 95.4, rcs: 2.4, owner: 'SpaceX', country: 'USA', status: 'Active', launched: '2023-08-11', img: 'img/sat_starlink.png', desc: 'SpaceX Starlink broadband satellite.' },
    { norad: 48999, name: 'ONEWEB-0211', type: 'Payload', regime: 'LEO', alt: 1200, inc: 87.9, period: 109.4, rcs: 1.8, owner: 'OneWeb', country: 'UK', status: 'Active', launched: '2021-04-25', img: 'img/sat_navigation.png', desc: 'OneWeb broadband constellation satellite.' },
    { norad: 33053, name: 'CBERS-2B DEB', type: 'Debris', regime: 'LEO', alt: 740, inc: 98.5, period: 99.6, rcs: 0.1, owner: 'China/Brazil', country: 'Multi', status: 'Defunct', launched: '2007-09-19', img: 'img/debris_breakup.png', desc: 'Fragmentation debris from CBERS-2B.' },
    { norad: 12345, name: 'THOR AGENA D R/B', type: 'Rocket Body', regime: 'LEO', alt: 950, inc: 82.1, period: 104.2, rcs: 8.5, owner: 'USA', country: 'USA', status: 'Defunct', launched: '1968-05-18', img: 'img/sat_rocket_body.png', desc: 'Vintage upper stage from early US space program.' },
    { norad: 44383, name: 'BEIDOU IGSO-1', type: 'Payload', regime: 'HEO', alt: 35786, inc: 55.0, period: 1436.1, rcs: 6.5, owner: 'China', country: 'China', status: 'Active', launched: '2019-06-24', img: 'img/sat_navigation.png', desc: 'Inclined Geosynchronous Orbit satellite for the Beidou navigation system.' },
    { norad: 46292, name: 'SYRACUSE 4A', type: 'Payload', regime: 'GEO', alt: 35785, inc: 0.1, period: 1436.1, rcs: 9.0, owner: 'DGA', country: 'France', status: 'Active', launched: '2021-10-24', img: 'img/sat_geo_comms.png', desc: 'French military communications satellite.' },
    { norad: 38771, name: 'USA-239', type: 'Payload', regime: 'MEO', alt: 20200, inc: 55.0, period: 718.0, rcs: 4.1, owner: 'USSF', country: 'USA', status: 'Active', launched: '2012-10-04', img: 'img/sat_navigation.png', desc: 'GPS Block IIF satellite.' },
    { norad: 40136, name: 'H-IIA R/B', type: 'Rocket Body', regime: 'GTO', alt: 18000, inc: 28.5, period: 630.5, rcs: 14.0, owner: 'JAXA', country: 'Japan', status: 'Defunct', launched: '2014-05-24', img: 'img/sat_rocket_body.png', desc: 'Spent upper stage in highly elliptical GTO.' },
    { norad: 55001, name: 'SLINGSHOT-CAL', type: 'Payload', regime: 'LEO', alt: 500, inc: 97.4, period: 94.6, rcs: 1.0, owner: 'Slingshot', country: 'USA', status: 'Active', launched: '2024-01-10', img: 'img/slingshot.png', desc: 'Calibration satellite used for optical cross-validation by the Slingshot Aerospace Global Sensor Network.' }
];

// State
let filteredData = [...CATALOG_DATA];
let sortCol = 'norad';
let sortAsc = true;
let activeFilters = { regime: 'ALL', type: 'ALL', status: 'ALL' };

const tbody = document.getElementById('catBody');
const totalEl = document.getElementById('totalCount');
const shownEl = document.getElementById('shownCount');
const detailPanel = document.getElementById('detailPanel');
const detailBody = document.getElementById('detailBody');

// Update total
totalEl.textContent = '46,238+';

// Format helpers
function getRegimeBadge(r) {
    const cls = r === 'LEO' ? 'regime-leo' : r === 'MEO' ? 'regime-meo' : r === 'GEO' ? 'regime-geo' : 'regime-heo';
    return \`<span class="regime-badge \${cls}">\${r}</span>\`;
}
function getTypeClass(t) {
    return t === 'Payload' ? 'type-payload' : t === 'Debris' ? 'type-debris' : 'type-rb';
}
function getStatusClass(s) {
    return s === 'Active' ? 'status-active' : s === 'Defunct' ? 'status-defunct' : 'status-decayed';
}

function renderTable() {
    tbody.innerHTML = '';
    shownEl.textContent = filteredData.length;

    filteredData.forEach((sat, i) => {
        const tr = document.createElement('tr');
        tr.onclick = () => openDetail(sat, tr);
        tr.innerHTML = \`
            <td style="font-family:'JetBrains Mono',monospace">\${sat.norad}</td>
            <td style="font-weight:600;color:#e8eaf6">\${sat.name}</td>
            <td class="\${getTypeClass(sat.type)}">\${sat.type}</td>
            <td>\${getRegimeBadge(sat.regime)}</td>
            <td>\${sat.alt.toLocaleString()}</td>
            <td>\${sat.inc.toFixed(1)}</td>
            <td>\${sat.period.toFixed(1)}</td>
            <td>\${sat.rcs.toFixed(2)}</td>
            <td>\${sat.owner}</td>
            <td>\${sat.country}</td>
            <td class="\${getStatusClass(sat.status)}">\${sat.status}</td>
            <td>\${sat.launched}</td>
        \`;
        tbody.appendChild(tr);
    });
}

function openDetail(sat, trNode) {
    document.querySelectorAll('.cat-table tr').forEach(t => t.classList.remove('selected'));
    if (trNode) trNode.classList.add('selected');

    detailBody.innerHTML = \`
        <h2>\${sat.name}</h2>
        <div style="font-family:'JetBrains Mono',monospace;font-size:11px;color:#00e5ff;margin-bottom:12px">NORAD ID: \${sat.norad}</div>
        
        <img src="\${sat.img}" alt="\${sat.name}">
        
        <div style="font-size:11px;line-height:1.7;color:#b0bec5;margin-bottom:16px">\${sat.desc}</div>
        
        <h3>Orbital Parameters</h3>
        <table><tbody>
            <tr><td style="color:#78909c;width:120px">Regime</td><td>\${getRegimeBadge(sat.regime)}</td></tr>
            <tr><td style="color:#78909c">Altitude (Mean)</td><td>\${sat.alt.toLocaleString()} km</td></tr>
            <tr><td style="color:#78909c">Inclination</td><td>\${sat.inc.toFixed(2)}°</td></tr>
            <tr><td style="color:#78909c">Orbital Period</td><td>\${sat.period.toFixed(2)} min</td></tr>
            <tr><td style="color:#78909c">Radar Cross Sec.</td><td>\${sat.rcs.toFixed(2)} m²</td></tr>
        </tbody></table>

        <h3>Registration</h3>
        <table><tbody>
            <tr><td style="color:#78909c;width:120px">Object Type</td><td class="\${getTypeClass(sat.type)}">\${sat.type}</td></tr>
            <tr><td style="color:#78909c">Operational Status</td><td class="\${getStatusClass(sat.status)}">\${sat.status}</td></tr>
            <tr><td style="color:#78909c">Owner/Operator</td><td>\${sat.owner}</td></tr>
            <tr><td style="color:#78909c">Origin Country</td><td>\${sat.country}</td></tr>
            <tr><td style="color:#78909c">Launch Date</td><td>\${sat.launched}</td></tr>
        </tbody></table>
        
        <div style="margin-top:20px;padding:12px;background:rgba(124,77,255,0.05);border:1px solid rgba(124,77,255,0.1);border-radius:6px">
            <div style="font-size:10px;color:#7c4dff;font-weight:700;margin-bottom:4px;text-transform:uppercase">Intelligence Tiers Available</div>
            <div style="font-size:10px;color:#78909c">SDA tracking indicates nominal orbit propagation. No anomalous maneuvers detected in the last 72 hours. Conjunction screening is active against the entire 46k+ catalog.</div>
        </div>
    \`;
    detailPanel.classList.add('open');
}

document.getElementById('detailClose').onclick = () => {
    detailPanel.classList.remove('open');
    document.querySelectorAll('.cat-table tr').forEach(t => t.classList.remove('selected'));
};

// Filtering & Sorting
function applyFilters() {
    const q = document.getElementById('searchInput').value.toLowerCase();
    
    filteredData = CATALOG_DATA.filter(sat => {
        // Search
        const matchSearch = sat.name.toLowerCase().includes(q) || 
                            sat.norad.toString().includes(q) || 
                            sat.owner.toLowerCase().includes(q) || 
                            sat.country.toLowerCase().includes(q);
        
        // Chips
        const matchRegime = activeFilters.regime === 'ALL' || sat.regime === activeFilters.regime;
        const matchType = activeFilters.type === 'ALL' || sat.type === activeFilters.type;
        const matchStatus = activeFilters.status === 'ALL' || sat.status === activeFilters.status;

        return matchSearch && matchRegime && matchType && matchStatus;
    });

    // Sort
    filteredData.sort((a, b) => {
        let valA = a[sortCol];
        let valB = b[sortCol];
        if (typeof valA === 'string') valA = valA.toLowerCase();
        if (typeof valB === 'string') valB = valB.toLowerCase();
        
        if (valA < valB) return sortAsc ? -1 : 1;
        if (valA > valB) return sortAsc ? 1 : -1;
        return 0;
    });

    renderTable();
}

// Search listener
document.getElementById('searchInput').addEventListener('input', applyFilters);

// Chip listeners
document.querySelectorAll('.filter-chip').forEach(chip => {
    chip.addEventListener('click', () => {
        const group = chip.parentElement.id;
        document.querySelectorAll(\`#\${group} .filter-chip\`).forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        
        const filterType = chip.getAttribute('data-filter');
        const filterVal = chip.getAttribute('data-val');
        activeFilters[filterType] = filterVal;
        
        applyFilters();
    });
});

// Sort listeners
document.querySelectorAll('th').forEach(th => {
    th.addEventListener('click', () => {
        const col = th.getAttribute('data-sort');
        if (sortCol === col) {
            sortAsc = !sortAsc;
        } else {
            sortCol = col;
            sortAsc = true;
        }
        
        // Update arrows
        document.querySelectorAll('.sort-arrow').forEach(a => a.textContent = '');
        th.querySelector('.sort-arrow').textContent = sortAsc ? ' ▲' : ' ▼';
        
        applyFilters();
    });
});

// Init
document.querySelector('[data-sort="norad"] .sort-arrow').textContent = ' ▲';
applyFilters();
