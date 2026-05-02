/* SentinelForge — Panel Layout Manager
 * Enables drag-to-resize and collapse/expand for all dashboard panels.
 *
 * Layout:
 *   ┌──────────── Command Bar ────────────────┐
 *   │ Globe              │ Gauge Panel        │ ← vertical divider (h-resize)
 *   ├────────────────────┼────────────────────┤ ← horizontal divider (v-resize)
 *   │ Ground Network     │ Inventory Panel    │
 *   └────────────────────┴────────────────────┘
 *
 * Features:
 *   - Drag horizontal divider to resize top/bottom rows
 *   - Drag vertical divider to resize left/right columns
 *   - Double-click divider to reset to default
 *   - Collapse/expand panels via header buttons
 *   - Layout saved to localStorage
 *   - Keyboard: Ctrl+Shift+R to reset layout
 */

(function() {
    'use strict';

    // ── Default Layout ──
    const DEFAULTS = {
        rowSplit: 0.65,     // Globe row = 65% of available space (after cmd bar)
        colSplit: 0.80,     // Left column = 80%
        cmdHeight: 48,      // Fixed command bar height
    };

    const STORAGE_KEY = 'sentinelforge_layout';
    const MIN_PANEL_PX = 120;

    // ── State ──
    let layout = loadLayout();
    let activeResize = null;

    // ── Load / Save ──
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
        saveLayout();
        applyLayout();
        showLayoutToast('Layout reset to default');
    }

    // ── Apply Layout to Grid ──
    function applyLayout() {
        const grid = document.querySelector('.ops-grid');
        if (!grid) return;

        const vh = window.innerHeight;
        const vw = window.innerWidth;
        const availH = vh - layout.cmdHeight;

        const topH = Math.max(MIN_PANEL_PX, Math.round(availH * layout.rowSplit));
        const botH = Math.max(MIN_PANEL_PX, availH - topH);
        const leftW = Math.max(MIN_PANEL_PX, Math.round(vw * layout.colSplit));
        const rightW = Math.max(MIN_PANEL_PX, vw - leftW);

        grid.style.gridTemplateRows = `${layout.cmdHeight}px ${topH}px ${botH}px`;
        grid.style.gridTemplateColumns = `${leftW}px ${rightW}px`;

        // Trigger CesiumJS resize if available
        if (window.Cesium && window._viewer) {
            try { window._viewer.resize(); } catch(e) {}
        }

        // Trigger map canvas resize
        const mapCanvas = document.getElementById('mapCanvas');
        if (mapCanvas && typeof renderMap === 'function') {
            setTimeout(renderMap, 50);
        }
    }

    // ── Create Resize Handles ──
    function createHandles() {
        const grid = document.querySelector('.ops-grid');
        if (!grid) return;

        // Horizontal resize handle (between top and bottom rows)
        const hHandle = document.createElement('div');
        hHandle.className = 'resize-handle resize-handle-h';
        hHandle.title = 'Drag to resize top/bottom panels · Double-click to reset';
        hHandle.innerHTML = '<div class="resize-grip">⋯</div>';
        grid.appendChild(hHandle);

        // Vertical resize handle (between left and right columns)
        const vHandle = document.createElement('div');
        vHandle.className = 'resize-handle resize-handle-v';
        vHandle.title = 'Drag to resize left/right panels · Double-click to reset';
        vHandle.innerHTML = '<div class="resize-grip">⋮</div>';
        grid.appendChild(vHandle);

        // Position handles
        positionHandles();

        // ── Horizontal Handle Events ──
        hHandle.addEventListener('mousedown', (e) => {
            e.preventDefault();
            activeResize = 'horizontal';
            document.body.style.cursor = 'row-resize';
            document.body.style.userSelect = 'none';
            hHandle.classList.add('active');
        });

        hHandle.addEventListener('dblclick', () => {
            layout.rowSplit = DEFAULTS.rowSplit;
            saveLayout(); applyLayout(); positionHandles();
            showLayoutToast('Row split reset');
        });

        // ── Vertical Handle Events ──
        vHandle.addEventListener('mousedown', (e) => {
            e.preventDefault();
            activeResize = 'vertical';
            document.body.style.cursor = 'col-resize';
            document.body.style.userSelect = 'none';
            vHandle.classList.add('active');
        });

        vHandle.addEventListener('dblclick', () => {
            layout.colSplit = DEFAULTS.colSplit;
            saveLayout(); applyLayout(); positionHandles();
            showLayoutToast('Column split reset');
        });

        // ── Global Mouse Move/Up ──
        document.addEventListener('mousemove', (e) => {
            if (!activeResize) return;

            const vh = window.innerHeight;
            const vw = window.innerWidth;

            if (activeResize === 'horizontal') {
                const availH = vh - layout.cmdHeight;
                const newSplit = (e.clientY - layout.cmdHeight) / availH;
                layout.rowSplit = Math.max(0.2, Math.min(0.85, newSplit));
            } else if (activeResize === 'vertical') {
                const newSplit = e.clientX / vw;
                layout.colSplit = Math.max(0.3, Math.min(0.92, newSplit));
            }

            applyLayout();
            positionHandles();
        });

        document.addEventListener('mouseup', () => {
            if (activeResize) {
                activeResize = null;
                document.body.style.cursor = '';
                document.body.style.userSelect = '';
                hHandle.classList.remove('active');
                vHandle.classList.remove('active');
                saveLayout();
            }
        });

        // ── Panel Collapse Buttons ──
        addCollapseButtons();
    }

    function positionHandles() {
        const vh = window.innerHeight;
        const vw = window.innerWidth;
        const availH = vh - layout.cmdHeight;
        const topH = Math.round(availH * layout.rowSplit);

        const hHandle = document.querySelector('.resize-handle-h');
        const vHandle = document.querySelector('.resize-handle-v');

        if (hHandle) {
            hHandle.style.top = (layout.cmdHeight + topH - 4) + 'px';
            hHandle.style.left = '0';
            hHandle.style.width = '100%';
        }
        if (vHandle) {
            const leftW = Math.round(vw * layout.colSplit);
            vHandle.style.left = (leftW - 4) + 'px';
            vHandle.style.top = layout.cmdHeight + 'px';
            vHandle.style.height = availH + 'px';
        }
    }

    // ── Collapse / Expand ──
    function addCollapseButtons() {
        const panels = [
            { selector: '.gauge-panel', label: 'Gauges', direction: 'right' },
            { selector: '.ground-zone', label: 'Ground Network', direction: 'bottom' },
            { selector: '.inventory-zone', label: 'Inventory', direction: 'bottom' },
        ];

        panels.forEach(p => {
            const el = document.querySelector(p.selector);
            if (!el) return;

            // Find or create the header
            let header = el.querySelector('.card-header');
            if (!header) {
                header = el.querySelector('.inv-tabs');
            }
            if (!header) return;

            // Add collapse button
            const btn = document.createElement('button');
            btn.className = 'panel-collapse-btn';
            btn.title = `Collapse ${p.label} panel`;
            btn.innerHTML = p.direction === 'right' ? '▶' : '▼';
            btn.style.cssText = `
                position:absolute; top:4px; right:4px; z-index:20;
                width:20px; height:20px; border:1px solid rgba(255,255,255,0.1);
                background:rgba(10,12,20,0.8); color:rgba(255,255,255,0.4);
                border-radius:4px; font-size:8px; cursor:pointer;
                display:flex; align-items:center; justify-content:center;
                transition:all 0.2s;
            `;
            btn.addEventListener('mouseover', () => { btn.style.borderColor = '#7c4dff'; btn.style.color = '#7c4dff'; });
            btn.addEventListener('mouseout', () => { btn.style.borderColor = 'rgba(255,255,255,0.1)'; btn.style.color = 'rgba(255,255,255,0.4)'; });

            let collapsed = false;
            btn.addEventListener('click', () => {
                collapsed = !collapsed;
                if (collapsed) {
                    el.dataset.origDisplay = el.style.display || '';
                    el.style.display = 'none';
                    btn.innerHTML = p.direction === 'right' ? '◀' : '▲';
                    btn.title = `Expand ${p.label} panel`;
                    showLayoutToast(`${p.label} collapsed`);
                } else {
                    el.style.display = el.dataset.origDisplay || '';
                    btn.innerHTML = p.direction === 'right' ? '▶' : '▼';
                    btn.title = `Collapse ${p.label} panel`;
                    showLayoutToast(`${p.label} expanded`);
                }
            });

            // Make header position relative for the absolute button
            if (el.style.position !== 'absolute' && el.style.position !== 'fixed') {
                el.style.position = 'relative';
            }
            el.appendChild(btn);
        });
    }

    // ── Toast Notification ──
    function showLayoutToast(msg) {
        const toast = document.createElement('div');
        toast.style.cssText = `
            position:fixed; bottom:16px; left:50%; transform:translateX(-50%);
            padding:6px 16px; background:rgba(124,77,255,0.9);
            color:white; font-size:11px; font-weight:600;
            border-radius:6px; z-index:10001;
            font-family:'Inter',sans-serif; letter-spacing:0.5px;
            backdrop-filter:blur(8px);
            animation: layoutToastIn 0.3s ease-out;
        `;
        toast.textContent = msg;
        document.body.appendChild(toast);
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transition = 'opacity 0.3s';
            setTimeout(() => toast.remove(), 300);
        }, 1500);
    }

    // ── Keyboard Shortcuts ──
    document.addEventListener('keydown', (e) => {
        // Ctrl+Shift+R: Reset layout
        if (e.ctrlKey && e.shiftKey && e.key === 'R') {
            e.preventDefault();
            resetLayout();
        }
    });

    // ── Window Resize ──
    window.addEventListener('resize', () => {
        applyLayout();
        positionHandles();
    });

    // ── Initialize ──
    function init() {
        applyLayout();
        createHandles();

        // Inject CSS for resize handles
        const style = document.createElement('style');
        style.textContent = `
            .resize-handle {
                position: absolute;
                z-index: 50;
                transition: background 0.2s;
            }
            .resize-handle-h {
                height: 8px;
                cursor: row-resize;
                background: transparent;
            }
            .resize-handle-h:hover, .resize-handle-h.active {
                background: linear-gradient(180deg,
                    transparent 0%,
                    rgba(124,77,255,0.3) 40%,
                    rgba(124,77,255,0.5) 50%,
                    rgba(124,77,255,0.3) 60%,
                    transparent 100%
                );
            }
            .resize-handle-v {
                width: 8px;
                cursor: col-resize;
                background: transparent;
            }
            .resize-handle-v:hover, .resize-handle-v.active {
                background: linear-gradient(90deg,
                    transparent 0%,
                    rgba(124,77,255,0.3) 40%,
                    rgba(124,77,255,0.5) 50%,
                    rgba(124,77,255,0.3) 60%,
                    transparent 100%
                );
            }
            .resize-grip {
                position: absolute;
                top: 50%; left: 50%;
                transform: translate(-50%, -50%);
                font-size: 10px;
                color: rgba(255,255,255,0.15);
                pointer-events: none;
                user-select: none;
                line-height: 1;
            }
            .resize-handle:hover .resize-grip,
            .resize-handle.active .resize-grip {
                color: rgba(124,77,255,0.8);
            }
            @keyframes layoutToastIn {
                from { opacity: 0; transform: translateX(-50%) translateY(10px); }
                to   { opacity: 1; transform: translateX(-50%) translateY(0); }
            }
            .panel-collapse-btn:hover {
                border-color: #7c4dff !important;
                color: #7c4dff !important;
            }
        `;
        document.head.appendChild(style);

        console.log('[LAYOUT] Panel manager initialized. Drag dividers to resize. Ctrl+Shift+R to reset.');
    }

    // Wait for DOM
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Expose API
    window.SFLayout = {
        reset: resetLayout,
        getLayout: () => ({ ...layout }),
        setLayout: (newLayout) => {
            Object.assign(layout, newLayout);
            saveLayout();
            applyLayout();
            positionHandles();
        },
    };
})();
