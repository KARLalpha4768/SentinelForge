/* SentinelForge — Site Resilience & Self-Healing Engine
 * Simulates autonomous recovery systems for each ground station.
 * 
 * Architecture:
 *   Watchdog → Anomaly Detection → Auto-Recovery → Escalation
 *   Each site runs an independent resilience state machine.
 */

const RESILIENCE = {
    // Global fleet resilience stats
    fleet: {
        uptimePct: 99.94,
        mttr: 2.4,           // Mean Time To Recovery (minutes)
        mtbf: 720,           // Mean Time Between Failures (hours)
        autoRecoveries: 847, // Lifetime auto-recoveries without human intervention
        escalations: 12,     // Events requiring human intervention (last 90 days)
        lastIncident: '2026-04-28T03:14Z',
    },

    // Self-healing subsystems per site
    subsystems: [
        {
            name: 'Watchdog Timer',
            icon: '🐕',
            desc: 'Hardware watchdog reboots edge node if kernel heartbeat stops',
            implementation: 'Intel TCO WDT + systemd-watchdog, 30s timeout',
            triggerCondition: 'No heartbeat for 30 consecutive seconds',
            action: 'Hard reset via IPMI/BMC → cold boot → service auto-start',
            recoveryTime: '45-90 seconds',
            lastTriggered: null, // populated per-site
            status: 'armed',
        },
        {
            name: 'Process Supervisor',
            icon: '🔄',
            desc: 'systemd auto-restarts crashed services within 5 seconds',
            implementation: 'systemd unit files with Restart=always, RestartSec=5',
            triggerCondition: 'Service exit code ≠ 0 OR OOM kill',
            action: 'Restart service → verify health endpoint → log event',
            recoveryTime: '5-15 seconds',
            lastTriggered: null,
            status: 'active',
        },
        {
            name: 'GPU Thermal Governor',
            icon: '🌡️',
            desc: 'Auto-throttles inference at 85°C, shuts down at 95°C, resumes at 75°C',
            implementation: 'nvidia-smi daemon + custom thermal_governor.py',
            triggerCondition: 'GPU junction temp crosses threshold',
            action: '85°C: halve batch size → 90°C: disable TensorRT → 95°C: emergency stop → 75°C: resume',
            recoveryTime: '2-10 minutes (thermal cooldown)',
            lastTriggered: null,
            status: 'monitoring',
        },
        {
            name: 'Disk Pressure Relief',
            icon: '💾',
            desc: 'Auto-purges oldest raw frames when disk hits 90%',
            implementation: 'Cron job + inotifywait, LRU eviction policy',
            triggerCondition: 'Filesystem usage > 90% on /data partition',
            action: 'Purge oldest raw frames (detections already uploaded) → alert at 95% → read-only at 98%',
            recoveryTime: 'Instant (async purge)',
            lastTriggered: null,
            status: 'armed',
        },
        {
            name: 'Network Failover Stack',
            icon: '📡',
            desc: 'Primary → Secondary → Tertiary → Store-and-forward',
            implementation: 'NetworkManager dispatcher + keepalived + custom failover.sh',
            triggerCondition: 'Primary uplink fails 3 consecutive pings (15s)',
            action: 'Starlink → LTE modem → VSAT Ku-band → local buffer (USB SSD)',
            recoveryTime: '5-30 seconds (failover) / hours (store-and-forward playback)',
            lastTriggered: null,
            status: 'active',
        },
        {
            name: 'Pipeline Circuit Breaker',
            icon: '⚡',
            desc: 'Disables ML inference if error rate exceeds 5%, falls back to classical',
            implementation: 'Circuit breaker pattern (half-open after 5 min cooldown)',
            triggerCondition: 'Detection error rate > 5% over 60-second window',
            action: 'Open breaker → fall back to matched-filter only → alert → half-open test → close',
            recoveryTime: '5-15 minutes (auto-test + close)',
            lastTriggered: null,
            status: 'closed',
        },
        {
            name: 'Auto-Calibration Daemon',
            icon: '🔬',
            desc: 'Nightly flat-field + dark frames, self-adjusts gain/exposure',
            implementation: 'sf_calibrate.py triggered by cron at local sunset + 30min',
            triggerCondition: 'Scheduled (nightly) OR detection SNR drops below 3σ baseline',
            action: 'Acquire 20 darks + 20 flats → compute master cal → update pipeline config',
            recoveryTime: '20 minutes (calibration cycle)',
            lastTriggered: null,
            status: 'scheduled',
        },
        {
            name: 'Immutable Boot Image',
            icon: '🔒',
            desc: 'Read-only squashfs root — corrupted state = reboot to clean baseline',
            implementation: 'Overlay filesystem: squashfs (RO) + tmpfs (RW) + persistent /data',
            triggerCondition: 'Filesystem integrity check fails OR manual recovery trigger',
            action: 'Reboot → mount clean squashfs → overlay fresh tmpfs → restore from /data/config',
            recoveryTime: '90-120 seconds',
            lastTriggered: null,
            status: 'verified',
        },
        {
            name: 'Canary Deployment Gate',
            icon: '🐤',
            desc: 'Firmware updates roll to 1 site first, wait 24h, then cascade',
            implementation: 'GitHub Actions + custom canary_gate.py + rollback webhook',
            triggerCondition: 'New firmware version tagged in CI/CD',
            action: 'Deploy to canary site → monitor 24h → if healthy: cascade → if anomaly: auto-rollback',
            recoveryTime: '< 2 minutes (automated rollback)',
            lastTriggered: null,
            status: 'ready',
        },
        {
            name: 'Dead Man\'s Switch',
            icon: '☠️',
            desc: 'Auto-escalates if a site misses 3 consecutive heartbeats',
            implementation: 'Cloud-side monitor (Go) polling /health every 5 min',
            triggerCondition: 'No heartbeat response for 15 minutes (3 × 5 min)',
            action: 'PagerDuty P1 → NOC call → attempt remote wake (WoL/IPMI) → dispatch field tech if unrecoverable',
            recoveryTime: 'Variable (remote: 5 min, field: 4-24 hours)',
            lastTriggered: null,
            status: 'watching',
        },
    ],

    // Redundancy architecture
    redundancy: [
        { layer: 'Sensor Overlap', detail: 'N+1 coverage — adjacent sites cover each other\'s blind spots during outages', metric: '94% sky coverage maintained with any single site down' },
        { layer: 'Hot-Spare Edge Node', detail: 'Pre-configured standby Jetson at each Tier-1 site — auto-promoted if primary fails SMART checks', metric: 'Standby → active in < 5 minutes' },
        { layer: 'Dual Power', detail: 'Grid + LiFePO4 battery (8h backup) + solar at remote sites', metric: '99.98% power uptime over 12 months' },
        { layer: 'Config Snapshots', detail: 'Hourly config backups to S3 — any deploy can rollback in < 2 minutes', metric: '720 snapshots retained (30 days)' },
        { layer: 'DNS Failover', detail: 'Route53 health checks — data ingestion fails over to secondary cloud region', metric: 'Failover in < 60 seconds' },
        { layer: 'Kafka Replication', detail: 'Edge→Cloud Kafka topics replicated 3× across availability zones', metric: 'Zero message loss during AZ failure' },
    ],

    // Observability stack
    observability: {
        metrics: 'Prometheus (node_exporter + gpu_exporter + custom sf_exporter)',
        logs: 'Fluentd → Loki → Grafana (7-day hot, 90-day cold in S3)',
        traces: 'OpenTelemetry → Tempo (distributed tracing across edge→cloud)',
        dashboards: 'Grafana (GPU temp, detection rate, pipeline latency, disk usage, network throughput)',
        alerts: 'PagerDuty (P1: DMS trigger, P2: degraded performance, P3: scheduled maintenance)',
        predictive: 'ML anomaly model trained on 6 months of site telemetry — flags deviations 30 min before failure',
    },
};

// Generate per-site resilience state (seeded from site ID for consistency)
function getSiteResilience(site) {
    const seed = hashCode(site.id);
    const rng = (offset) => ((seed + offset * 7919) % 1000) / 1000;

    // Populate last-triggered timestamps (simulated but realistic)
    const subsystems = RESILIENCE.subsystems.map((s, i) => {
        const daysAgo = Math.floor(rng(i) * 90); // 0-90 days ago
        const hoursAgo = Math.floor(rng(i + 100) * 24);
        const triggered = daysAgo > 60 ? null : new Date(Date.now() - (daysAgo * 86400000 + hoursAgo * 3600000)).toISOString().slice(0, 16) + 'Z';
        const count = daysAgo > 60 ? 0 : Math.floor(rng(i + 200) * 15) + 1;
        return { ...s, lastTriggered: triggered, triggerCount90d: count };
    });

    // Site-specific uptime
    const uptimePct = 99.5 + rng(500) * 0.49; // 99.50-99.99%
    const autoRecoveries = Math.floor(rng(600) * 40) + 5;

    return {
        siteId: site.id,
        siteName: site.name,
        uptimePct: uptimePct.toFixed(2),
        autoRecoveries,
        subsystems,
        redundancy: RESILIENCE.redundancy,
        observability: RESILIENCE.observability,
        fleetStats: RESILIENCE.fleet,
    };
}

// Simple string hash for deterministic per-site generation
function hashCode(str) {
    let h = 0;
    for (let i = 0; i < str.length; i++) {
        h = ((h << 5) - h) + str.charCodeAt(i);
        h |= 0;
    }
    return Math.abs(h);
}

// Simulate self-healing events in the telemetry loop
let _healingEvents = [];
function simulateHealingEvent() {
    if (!STATE || !STATE.sites || STATE.sites.length === 0) return;

    const site = STATE.sites[Math.floor(Math.random() * STATE.sites.length)];
    const subsystem = RESILIENCE.subsystems[Math.floor(Math.random() * RESILIENCE.subsystems.length)];
    const now = new Date().toISOString();

    const event = {
        timestamp: now,
        siteId: site.id,
        siteName: site.name,
        subsystem: subsystem.name,
        icon: subsystem.icon,
        action: subsystem.action.split('→')[0].trim(),
        recoveryTime: subsystem.recoveryTime,
        autoResolved: true,
    };

    _healingEvents.unshift(event);
    if (_healingEvents.length > 50) _healingEvents.pop();

    // Update fleet auto-recovery counter
    RESILIENCE.fleet.autoRecoveries++;

    return event;
}

// Schedule periodic healing events (every 3-8 minutes)
function scheduleHealingEvents() {
    const interval = (3 + Math.random() * 5) * 60 * 1000; // 3-8 minutes
    setTimeout(() => {
        const event = simulateHealingEvent();
        if (event) {
            console.log(`[Resilience] ${event.icon} Auto-healed: ${event.siteName} — ${event.subsystem} (${event.recoveryTime})`);
        }
        scheduleHealingEvents(); // recurse
    }, interval);
}

// Start healing simulation after 30 seconds
setTimeout(scheduleHealingEvents, 30000);

// Expose globally
window.RESILIENCE = RESILIENCE;
window.getSiteResilience = getSiteResilience;
window._healingEvents = _healingEvents;
