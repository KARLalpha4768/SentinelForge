/* SentinelForge — Panel Layout Manager
 * Enables drag-to-resize, popout/maximize, and collapse for all panels.
 *
 * Layout:
 *   ┌──────────── Command Bar ────────────────┐
 *   │ Globe              │ Gauge Panel        │ ← vertical divider
 *   ├────────────────────┼────────────────────┤ ← horizontal divider
 *   │ Ground Network     │ Inventory Panel    │
 *   └────────────────────┴────────────────────┘
 *
 * Features:
 *   - Drag horizontal divider to resize top/bottom rows
 *   - Drag vertical divider to resize left/right columns
 *   - Double-click divider to reset to default
 *   - Pop out any panel to a floating, draggable, resizable window
 *   - Maximize any panel to fill the viewport
 *   - Collapse/expand panels
 *   - Layout saved to localStorage
 *   - Keyboard: Ctrl+Shift+R to reset layout
 */

(function() {
    'use strict';

    const DEFAULTS = {
        rowSplit: 0.65,
        colSplit: 0.80,
        cmdHeight: 48,
    };

    const STORAGE_KEY = 'sentinelforge_layout';
    const MIN_PANEL_PX = 120;

    let layout = loadLayout();
    let activeResize = null;

    /* ────────────────── Load / Save ────────────────── */
    function loadLayout() {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) return { ...DEFAULTS, ...JSON.parse(saved) };
        } catch(e) {}
        return { ...DEFAULTS };
    }
    function saveLayout() {
        try { localStorage.setItem(STORAGE_KEY, JSON.stringify(layout)); } catch(e) {}
    }
    function resetLayout() {
        layout = { ...DEFAULTS };
        saveLayout(); applyLayout(); positionHandles();
        // Re-dock all floating panels
        document.querySelectorAll('.sf-panel-floating').forEach(el => {
            dockPanel(el.dataset.panelId);
        });
        toast('Layout reset to default');
    }

    /* ────────────────── Apply Grid ────────────────── */
    function applyLayout() {
        const grid = document.querySelector('.ops-grid');
        if (!grid) return;
        const vh = window.innerHeight, vw = window.innerWidth;
        const availH = vh - layout.cmdHeight;
        const topH = Math.max(MIN_PANEL_PX, Math.round(availH * layout.rowSplit));
        const botH = Math.max(MIN_PANEL_PX, availH - topH);
        const leftW = Math.max(MIN_PANEL_PX, Math.round(vw * layout.colSplit));
        const rightW = Math.max(MIN_PANEL_PX, vw - leftW);
        grid.style.gridTemplateRows = `${layout.cmdHeight}px ${topH}px ${botH}px`;
        grid.style.gridTemplateColumns = `${leftW}px ${rightW}px`;

        if (window.Cesium && window._viewer) try { window._viewer.resize(); } catch(e) {}
        if (typeof renderMap === 'function') setTimeout(renderMap, 50);
    }

    /* ────────────────── Grid Resize Handles ────────────────── */
    function createHandles() {
        const grid = document.querySelector('.ops-grid');
        if (!grid) return;

        const hHandle = mk('div', 'resize-handle resize-handle-h');
        hHandle.title = 'Drag to resize top/bottom · Double-click to reset';
        hHandle.innerHTML = '<div class="resize-grip">⋯</div>';
        grid.appendChild(hHandle);

        const vHandle = mk('div', 'resize-handle resize-handle-v');
        vHandle.title = 'Drag to resize left/right · Double-click to reset';
        vHandle.innerHTML = '<div class="resize-grip">⋮</div>';
        grid.appendChild(vHandle);

        positionHandles();

        hHandle.addEventListener('mousedown', e => startResize(e, 'horizontal', hHandle));
        hHandle.addEventListener('dblclick', () => { layout.rowSplit = DEFAULTS.rowSplit; saveLayout(); applyLayout(); positionHandles(); toast('Row split reset'); });

        vHandle.addEventListener('mousedown', e => startResize(e, 'vertical', vHandle));
        vHandle.addEventListener('dblclick', () => { layout.colSplit = DEFAULTS.colSplit; saveLayout(); applyLayout(); positionHandles(); toast('Column split reset'); });

        document.addEventListener('mousemove', onGridDrag);
        document.addEventListener('mouseup', onGridRelease);
    }

    function startResize(e, dir, handle) {
        e.preventDefault();
        activeResize = { dir, handle };
        document.body.style.cursor = dir === 'horizontal' ? 'row-resize' : 'col-resize';
        document.body.style.userSelect = 'none';
        handle.classList.add('active');
    }

    function onGridDrag(e) {
        if (!activeResize) return;
        const vh = window.innerHeight, vw = window.innerWidth;
        if (activeResize.dir === 'horizontal') {
            layout.rowSplit = clamp((e.clientY - layout.cmdHeight) / (vh - layout.cmdHeight), 0.15, 0.88);
        } else {
            layout.colSplit = clamp(e.clientX / vw, 0.25, 0.95);
        }
        applyLayout(); positionHandles();
    }

    function onGridRelease() {
        if (activeResize) {
            activeResize.handle.classList.remove('active');
            activeResize = null;
            document.body.style.cursor = '';
            document.body.style.userSelect = '';
            saveLayout();
        }
    }

    function positionHandles() {
        const vh = window.innerHeight, vw = window.innerWidth;
        const availH = vh - layout.cmdHeight;
        const topH = Math.round(availH * layout.rowSplit);
        const hH = document.querySelector('.resize-handle-h');
        const vH = document.querySelector('.resize-handle-v');
        if (hH) { hH.style.top = (layout.cmdHeight + topH - 4) + 'px'; hH.style.left = '0'; hH.style.width = '100%'; }
        if (vH) { const lw = Math.round(vw * layout.colSplit); vH.style.left = (lw - 4) + 'px'; vH.style.top = layout.cmdHeight + 'px'; vH.style.height = availH + 'px'; }
    }

    /* ────────────────── Panel Popout / Maximize / Dock ────────────────── */

    const PANELS = [
        { id: 'gauges',    selector: '.gauge-panel',   label: 'System Gauges' },
        { id: 'ground',    selector: '.ground-zone',   label: 'Ground Network' },
        { id: 'inventory', selector: '.inventory-zone', label: 'Catalog Inventory' },
        { id: 'globe',     selector: '.globe-zone',    label: '3D Globe' },
    ];

    function addPanelControls() {
        PANELS.forEach(p => {
            const el = document.querySelector(p.selector);
            if (!el) return;
            el.dataset.panelId = p.id;

            // Toolbar container
            const toolbar = mk('div', 'sf-panel-toolbar');
            toolbar.innerHTML = `
                <span class="sf-panel-toolbar-label">${p.label}</span>
                <button class="sf-panel-btn sf-btn-popout" title="Pop out as floating window (drag & resize freely)" data-action="popout">⧉</button>
                <button class="sf-panel-btn sf-btn-maximize" title="Maximize to full screen" data-action="maximize">⤢</button>
                <button class="sf-panel-btn sf-btn-collapse" title="Collapse panel" data-action="collapse">▾</button>
            `;
            el.style.position = 'relative';
            el.insertBefore(toolbar, el.firstChild);

            toolbar.querySelector('[data-action="popout"]').addEventListener('click', () => popoutPanel(p.id));
            toolbar.querySelector('[data-action="maximize"]').addEventListener('click', () => maximizePanel(p.id));
            toolbar.querySelector('[data-action="collapse"]').addEventListener('click', (e) => collapsePanel(p.id, e.currentTarget));
        });
    }

    function popoutPanel(id) {
        const p = PANELS.find(x => x.id === id);
        const el = document.querySelector(p.selector);
        if (!el || el.classList.contains('sf-panel-floating')) return;

        // Save original grid placement
        el.dataset.origGridArea = getComputedStyle(el).gridArea || '';
        el.dataset.origPosition = el.style.position || '';

        // Calculate center position
        const vw = window.innerWidth, vh = window.innerHeight;
        const w = Math.min(800, vw * 0.6);
        const h = Math.min(500, vh * 0.6);
        const x = (vw - w) / 2;
        const y = (vh - h) / 2;

        el.classList.add('sf-panel-floating');
        el.style.cssText = `
            position:fixed; z-index:1000;
            left:${x}px; top:${y}px; width:${w}px; height:${h}px;
            border-radius:12px; overflow:hidden;
            box-shadow: 0 12px 48px rgba(0,0,0,0.6), 0 0 0 1px rgba(124,77,255,0.3);
            background: rgba(16,20,36,0.98);
            backdrop-filter: blur(24px);
            resize: both;
        `;

        // Update toolbar: show dock button
        const toolbar = el.querySelector('.sf-panel-toolbar');
        const popBtn = toolbar.querySelector('.sf-btn-popout');
        popBtn.innerHTML = '⊡';
        popBtn.title = 'Dock back into grid';
        popBtn.onclick = () => dockPanel(id);

        // Make toolbar draggable
        makeDraggable(el, toolbar);

        // Add resize handles for all edges
        addResizeEdges(el);

        toast(`${p.label} — floating (drag title bar, resize edges)`);
    }

    function dockPanel(id) {
        const p = PANELS.find(x => x.id === id);
        const el = document.querySelector(p.selector);
        if (!el) return;

        el.classList.remove('sf-panel-floating', 'sf-panel-maximized');
        el.style.cssText = '';
        el.style.position = 'relative';

        // Remove resize edges
        el.querySelectorAll('.sf-resize-edge').forEach(e => e.remove());

        // Restore popout button
        const popBtn = el.querySelector('.sf-btn-popout');
        if (popBtn) {
            popBtn.innerHTML = '⧉';
            popBtn.title = 'Pop out as floating window';
            popBtn.onclick = () => popoutPanel(id);
        }

        // Restore maximize button
        const maxBtn = el.querySelector('.sf-btn-maximize');
        if (maxBtn) {
            maxBtn.innerHTML = '⤢';
            maxBtn.title = 'Maximize to full screen';
            maxBtn.onclick = () => maximizePanel(id);
        }

        applyLayout();
        toast(`${p.label} — docked`);
    }

    function maximizePanel(id) {
        const p = PANELS.find(x => x.id === id);
        const el = document.querySelector(p.selector);
        if (!el) return;

        if (el.classList.contains('sf-panel-maximized')) {
            // Un-maximize
            if (el.classList.contains('sf-panel-floating')) {
                // Return to floating state
                el.classList.remove('sf-panel-maximized');
                el.style.left = el.dataset.floatX || '100px';
                el.style.top = el.dataset.floatY || '100px';
                el.style.width = el.dataset.floatW || '800px';
                el.style.height = el.dataset.floatH || '500px';
            } else {
                dockPanel(id);
            }
            const maxBtn = el.querySelector('.sf-btn-maximize');
            if (maxBtn) { maxBtn.innerHTML = '⤢'; maxBtn.title = 'Maximize'; }
            toast(`${p.label} — restored`);
            return;
        }

        // Save current floating position if applicable
        if (el.classList.contains('sf-panel-floating')) {
            el.dataset.floatX = el.style.left;
            el.dataset.floatY = el.style.top;
            el.dataset.floatW = el.style.width;
            el.dataset.floatH = el.style.height;
        } else {
            el.dataset.origGridArea = getComputedStyle(el).gridArea || '';
        }

        el.classList.add('sf-panel-floating', 'sf-panel-maximized');
        el.style.cssText = `
            position:fixed; z-index:1001;
            left:0; top:${layout.cmdHeight}px;
            width:100vw; height:calc(100vh - ${layout.cmdHeight}px);
            background: rgba(16,20,36,0.99);
            backdrop-filter: blur(24px);
            box-shadow: none; border-radius: 0;
        `;

        const maxBtn = el.querySelector('.sf-btn-maximize');
        if (maxBtn) { maxBtn.innerHTML = '⤡'; maxBtn.title = 'Restore from maximize'; }

        const popBtn = el.querySelector('.sf-btn-popout');
        if (popBtn) { popBtn.innerHTML = '⊡'; popBtn.title = 'Dock back into grid'; popBtn.onclick = () => dockPanel(id); }

        toast(`${p.label} — maximized`);
    }

    function collapsePanel(id, btn) {
        const p = PANELS.find(x => x.id === id);
        const el = document.querySelector(p.selector);
        if (!el) return;

        const content = el.querySelector('.inv-content, .gauge-card, .ground-map, #cesiumContainer');
        const allContent = el.querySelectorAll('.inv-content, .gauge-card, .ground-map, .ground-sites, #cesiumContainer, .globe-controls, .chat-overlay, .time-scrubber');

        const isCollapsed = el.dataset.collapsed === 'true';
        if (isCollapsed) {
            allContent.forEach(c => { c.style.display = c.dataset.origDisplay || ''; });
            el.dataset.collapsed = 'false';
            btn.innerHTML = '▾';
            btn.title = 'Collapse panel';
        } else {
            allContent.forEach(c => { c.dataset.origDisplay = c.style.display || ''; c.style.display = 'none'; });
            el.dataset.collapsed = 'true';
            btn.innerHTML = '▸';
            btn.title = 'Expand panel';
        }
    }

    /* ────────────────── Draggable Floating Panel ────────────────── */
    function makeDraggable(panel, handle) {
        let startX, startY, startL, startT;

        handle.style.cursor = 'move';
        handle.addEventListener('mousedown', (e) => {
            if (e.target.closest('.sf-panel-btn')) return; // Don't drag on button clicks
            if (!panel.classList.contains('sf-panel-floating')) return;
            if (panel.classList.contains('sf-panel-maximized')) return;
            e.preventDefault();
            startX = e.clientX; startY = e.clientY;
            startL = parseInt(panel.style.left) || 0;
            startT = parseInt(panel.style.top) || 0;
            document.body.style.userSelect = 'none';

            const onMove = (e2) => {
                panel.style.left = (startL + e2.clientX - startX) + 'px';
                panel.style.top = (startT + e2.clientY - startY) + 'px';
            };
            const onUp = () => {
                document.removeEventListener('mousemove', onMove);
                document.removeEventListener('mouseup', onUp);
                document.body.style.userSelect = '';
            };
            document.addEventListener('mousemove', onMove);
            document.addEventListener('mouseup', onUp);
        });
    }

    /* ────────────────── Resize Edges for Floating Panels ────────────────── */
    function addResizeEdges(panel) {
        const edges = ['n', 's', 'e', 'w', 'ne', 'nw', 'se', 'sw'];
        const cursors = { n:'ns-resize', s:'ns-resize', e:'ew-resize', w:'ew-resize',
                          ne:'nesw-resize', nw:'nwse-resize', se:'nwse-resize', sw:'nesw-resize' };
        const SIZE = 6;

        edges.forEach(edge => {
            const handle = mk('div', 'sf-resize-edge sf-resize-' + edge);
            handle.style.position = 'absolute';
            handle.style.zIndex = '10';
            handle.style.cursor = cursors[edge];

            // Position each edge handle
            if (edge.includes('n')) handle.style.top = '0';
            if (edge.includes('s')) handle.style.bottom = '0';
            if (edge.includes('e')) handle.style.right = '0';
            if (edge.includes('w')) handle.style.left = '0';

            if (edge === 'n' || edge === 's') {
                handle.style.left = SIZE + 'px'; handle.style.right = SIZE + 'px'; handle.style.height = SIZE + 'px';
            } else if (edge === 'e' || edge === 'w') {
                handle.style.top = SIZE + 'px'; handle.style.bottom = SIZE + 'px'; handle.style.width = SIZE + 'px';
            } else {
                handle.style.width = (SIZE * 2) + 'px'; handle.style.height = (SIZE * 2) + 'px';
            }

            handle.addEventListener('mousedown', (e) => {
                if (panel.classList.contains('sf-panel-maximized')) return;
                e.preventDefault(); e.stopPropagation();
                const startX = e.clientX, startY = e.clientY;
                const startL = parseInt(panel.style.left) || 0;
                const startT = parseInt(panel.style.top) || 0;
                const startW = panel.offsetWidth;
                const startH = panel.offsetHeight;
                document.body.style.cursor = cursors[edge];
                document.body.style.userSelect = 'none';

                const onMove = (e2) => {
                    const dx = e2.clientX - startX, dy = e2.clientY - startY;
                    let newL = startL, newT = startT, newW = startW, newH = startH;

                    if (edge.includes('e')) newW = Math.max(250, startW + dx);
                    if (edge.includes('w')) { newW = Math.max(250, startW - dx); newL = startL + dx; }
                    if (edge.includes('s')) newH = Math.max(150, startH + dy);
                    if (edge.includes('n')) { newH = Math.max(150, startH - dy); newT = startT + dy; }

                    panel.style.left = newL + 'px';
                    panel.style.top = newT + 'px';
                    panel.style.width = newW + 'px';
                    panel.style.height = newH + 'px';
                };
                const onUp = () => {
                    document.removeEventListener('mousemove', onMove);
                    document.removeEventListener('mouseup', onUp);
                    document.body.style.cursor = '';
                    document.body.style.userSelect = '';
                };
                document.addEventListener('mousemove', onMove);
                document.addEventListener('mouseup', onUp);
            });

            panel.appendChild(handle);
        });
    }

    /* ────────────────── Utilities ────────────────── */
    function mk(tag, cls) { const e = document.createElement(tag); e.className = cls; return e; }
    function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }

    function toast(msg) {
        const t = mk('div', 'sf-layout-toast');
        t.textContent = msg;
        document.body.appendChild(t);
        setTimeout(() => { t.style.opacity = '0'; setTimeout(() => t.remove(), 300); }, 1800);
    }

    /* ────────────────── CSS Injection ────────────────── */
    function injectCSS() {
        const s = document.createElement('style');
        s.textContent = `
/* ── Grid Resize Handles ── */
.resize-handle { position:absolute; z-index:50; transition:background 0.2s; }
.resize-handle-h { height:8px; cursor:row-resize; }
.resize-handle-v { width:8px; cursor:col-resize; }
.resize-handle-h:hover, .resize-handle-h.active {
    background:linear-gradient(180deg,transparent,rgba(124,77,255,.3) 40%,rgba(124,77,255,.5) 50%,rgba(124,77,255,.3) 60%,transparent);
}
.resize-handle-v:hover, .resize-handle-v.active {
    background:linear-gradient(90deg,transparent,rgba(124,77,255,.3) 40%,rgba(124,77,255,.5) 50%,rgba(124,77,255,.3) 60%,transparent);
}
.resize-grip {
    position:absolute; top:50%; left:50%; transform:translate(-50%,-50%);
    font-size:10px; color:rgba(255,255,255,.12); pointer-events:none; user-select:none;
}
.resize-handle:hover .resize-grip, .resize-handle.active .resize-grip { color:rgba(124,77,255,.8); }

/* ── Panel Toolbar ── */
.sf-panel-toolbar {
    display:flex; align-items:center; gap:4px;
    padding:2px 6px 2px 10px; height:24px;
    background:rgba(255,255,255,0.02);
    border-bottom:1px solid rgba(255,255,255,0.05);
    font-size:9px; color:rgba(255,255,255,0.3);
    text-transform:uppercase; letter-spacing:.8px;
    flex-shrink:0; z-index:5; position:relative;
}
.sf-panel-toolbar-label { flex:1; font-weight:600; pointer-events:none; }
.sf-panel-btn {
    width:20px; height:16px; border:1px solid rgba(255,255,255,0.08);
    background:transparent; color:rgba(255,255,255,0.3);
    border-radius:3px; font-size:10px; cursor:pointer;
    display:flex; align-items:center; justify-content:center;
    transition:all 0.15s; line-height:1;
}
.sf-panel-btn:hover { border-color:rgba(124,77,255,0.6); color:#b388ff; background:rgba(124,77,255,0.1); }

/* ── Floating Panel ── */
.sf-panel-floating { transition:none !important; }
.sf-panel-floating .sf-panel-toolbar {
    background:rgba(124,77,255,0.08);
    border-bottom:1px solid rgba(124,77,255,0.2);
    cursor:move;
}
.sf-panel-floating .sf-panel-toolbar-label { color:rgba(179,136,255,0.8); }
.sf-panel-maximized .sf-panel-toolbar { cursor:default; }

/* ── Resize Edges ── */
.sf-resize-edge { background:transparent; }
.sf-resize-edge:hover { background:rgba(124,77,255,0.15); }

/* ── Toast ── */
.sf-layout-toast {
    position:fixed; bottom:16px; left:50%; transform:translateX(-50%);
    padding:6px 16px; background:rgba(124,77,255,0.9); color:white;
    font-size:11px; font-weight:600; border-radius:6px; z-index:10001;
    font-family:'Inter',sans-serif; letter-spacing:.5px;
    backdrop-filter:blur(8px); transition:opacity 0.3s;
    animation:sfToastIn .3s ease-out;
}
@keyframes sfToastIn { from{opacity:0;transform:translateX(-50%) translateY(10px)} to{opacity:1;transform:translateX(-50%) translateY(0)} }
        `;
        document.head.appendChild(s);
    }

    /* ────────────────── Keyboard ────────────────── */
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.shiftKey && e.key === 'R') { e.preventDefault(); resetLayout(); }
        if (e.key === 'Escape') {
            // Dock all floating panels on Escape
            document.querySelectorAll('.sf-panel-floating').forEach(el => dockPanel(el.dataset.panelId));
        }
    });

    window.addEventListener('resize', () => { applyLayout(); positionHandles(); });

    /* ────────────────── Init ────────────────── */
    function init() {
        injectCSS();
        applyLayout();
        createHandles();
        addPanelControls();
        console.log('[LAYOUT] Panel manager v2. Drag dividers, pop out panels, Ctrl+Shift+R to reset, Escape to dock all.');
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else init();

    window.SFLayout = {
        reset: resetLayout,
        getLayout: () => ({ ...layout }),
        setLayout: (nl) => { Object.assign(layout, nl); saveLayout(); applyLayout(); positionHandles(); },
        popout: popoutPanel,
        dock: dockPanel,
        maximize: maximizePanel,
    };
})();
