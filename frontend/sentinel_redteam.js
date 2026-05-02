/* SentinelForge — Red Team Conjunction Scenario
 * Simulates an ASAT debris cloud forcing the ops center into EMERGENCY mode.
 *
 * Scenario: COSMOS 1408 ASAT test (2021-11-15 analog)
 *   1. ASAT kinetic kill → debris cloud generation (1,500+ fragments)
 *   2. Debris cloud intersects ISS orbital shell (~408 km)
 *   3. Conjunction screening triggers: Pc > 1e-2 for ISS
 *   4. EMERGENCY escalation cascade
 *   5. Avoidance maneuver recommendation (Hohmann boost)
 *   6. Secondary conjunction check (burn doesn't create new collisions)
 *   7. GO/NO-GO decision
 *
 * Usage: Call runRedTeamScenario() from browser console or inject via UI
 */

const RED_TEAM = {
    scenario: {
        name: 'COSMOS 1408 ASAT — ISS Conjunction Emergency',
        classification: 'EXERCISE // UNCLASSIFIED',
        trigger: 'Kinetic ASAT test at 485 km altitude',
        target: 'COSMOS 1408 (NORAD 13552)',
        interceptor: 'DA-ASAT from Plesetsk',
        debrisCount: 1500,
        debrisAltRange: [300, 650],  // km
        criticalAsset: 'ISS (NORAD 25544)',
        criticalAltKm: 408,
    },

    timeline: [
        {
            t: 0,
            event: 'ASAT IMPACT DETECTED',
            detail: 'Infrared signature detected by SBIRS (Space-Based Infrared System). NORAD confirms kinetic impact on COSMOS 1408 at 485 km altitude.',
            severity: 'CRITICAL',
            module: 'Edge Detection (Module A)',
            action: 'Initial track file opened. 47 fragments resolved in first pass.',
        },
        {
            t: 120,
            event: 'DEBRIS CLOUD EXPANDING',
            detail: 'Space Fence (Kwajalein) tracking 312 fragments. Doppler analysis shows velocity distribution: Δv = 50-400 m/s from impact point.',
            severity: 'CRITICAL',
            module: 'Graph Associator (Module B)',
            action: 'GNN correlating fragment tracks. 312 of estimated 1,500 fragments cataloged.',
        },
        {
            t: 300,
            event: 'CONJUNCTION SCREENING INITIATED',
            detail: 'Fragment cloud intersects ISS orbital shell. PINN propagation of 312 tracked fragments forward 72 hours.',
            severity: 'CRITICAL',
            module: 'PINN Orbit (Module C) + FNO (Module L)',
            action: 'Batch propagation: 312 objects × 72h = 22,464 state predictions in 0.4 seconds.',
        },
        {
            t: 360,
            event: '⚠️ ISS CONJUNCTION — Pc > 1e-2',
            detail: 'Fragment #1408-DEB-0247 (NORAD TBD) passes within 1.2 km of ISS at TCA = T+6h14m. Non-Gaussian Pc = 3.7e-2 (EMERGENCY threshold = 1e-2).',
            severity: 'EMERGENCY',
            module: 'Non-Gaussian Pc (Module D)',
            action: 'EMERGENCY escalation triggered. Notification cascade initiated.',
        },
        {
            t: 380,
            event: 'ESCALATION CASCADE',
            detail: 'Notifications dispatched per EMERGENCY protocol: Mission Director (FLASH), 18th SDS Watch Floor (FLASH), NASA CARA (FLASH), ISS Flight Director (FLASH), Owner/Operator portal updated.',
            severity: 'EMERGENCY',
            module: 'Conjunction Decision (Module Q)',
            action: 'All P1 notification channels activated. Response time: < 15 minutes.',
        },
        {
            t: 420,
            event: 'AVOIDANCE MANEUVER COMPUTED',
            detail: 'Hohmann posigrade burn: Δv = 1.34 m/s at T+4h00m. Raises perigee by 2.8 km. Fuel cost: 3.2 kg (ISS margin: 180 kg remaining).',
            severity: 'EMERGENCY',
            module: 'Conjunction Decision (Module Q)',
            action: 'Maneuver plan transmitted to ISS Flight Dynamics Officer (FDO).',
        },
        {
            t: 480,
            event: 'SECONDARY CONJUNCTION CHECK',
            detail: 'Post-maneuver trajectory screened against full catalog (10,847 objects). No new conjunctions within 72h window. NEES covariance check: 3.1 (nominal).',
            severity: 'HIGH',
            module: 'Covariance Realism (Module R) + FNO (Module L)',
            action: 'Secondary screen CLEAR. Maneuver does not create new collision risks.',
        },
        {
            t: 540,
            event: 'GO / NO-GO DECISION',
            detail: 'Mission Director authorizes maneuver. ISS crew notified to prepare for engine firing. Hatches to Soyuz/Dragon verified open (shelter-in-place ready).',
            severity: 'EMERGENCY',
            module: 'Operations Center (Module S)',
            action: 'GO for avoidance maneuver at T+4h00m. Crew briefed.',
        },
        {
            t: 14400,
            event: 'MANEUVER EXECUTED',
            detail: 'ISS Progress thrusters fire for 38 seconds. Δv achieved: 1.31 m/s (within 2.2% of planned). Post-burn OD confirms new orbit clears debris cloud by 4.1 km.',
            severity: 'HIGH',
            module: 'PINN Orbit (Module C)',
            action: 'Post-maneuver orbit determination complete. Miss distance now 4.1 km (was 1.2 km).',
        },
        {
            t: 36000,
            event: 'CONJUNCTION CLEARED — STAND DOWN',
            detail: 'Fragment #1408-DEB-0247 TCA passes without incident. Miss distance: 4.1 km. All EMERGENCY notifications stood down. After-action report initiated.',
            severity: 'ROUTINE',
            module: 'Catalog Lifecycle (Module P)',
            action: 'Exercise complete. 312 debris fragments added to catalog. COSMOS 1408 reclassified as DEBRIS_FIELD.',
        },
    ],
};

/**
 * Run the Red Team scenario in the ops center dashboard.
 * Injects events as toast notifications with realistic timing.
 */
function runRedTeamScenario() {
    if (typeof STATE === 'undefined' || typeof showToast === 'undefined') {
        console.error('[RED TEAM] Must be run from within sentinel_ops.html');
        return;
    }

    console.log('[RED TEAM] ═══════════════════════════════════════');
    console.log('[RED TEAM] EXERCISE EXERCISE EXERCISE');
    console.log('[RED TEAM] Scenario: ' + RED_TEAM.scenario.name);
    console.log('[RED TEAM] ═══════════════════════════════════════');

    // Flash the command bar red
    const cmdBar = document.querySelector('.cmd-bar');
    if (cmdBar) {
        cmdBar.style.transition = 'background 0.3s';
        cmdBar.style.background = 'linear-gradient(90deg, #ff1744 0%, #1a1a2e 30%)';
        setTimeout(() => { cmdBar.style.background = ''; }, 5000);
    }

    // Inject the exercise banner
    const banner = document.createElement('div');
    banner.id = 'redTeamBanner';
    banner.style.cssText = `
        position:fixed; top:0; left:0; right:0; z-index:10000;
        background:linear-gradient(90deg, #ff1744, #d50000);
        color:white; text-align:center; padding:6px 0;
        font-family:'JetBrains Mono',monospace; font-size:11px;
        font-weight:700; letter-spacing:2px;
        animation: pulse-banner 1s ease-in-out infinite;
    `;
    banner.textContent = '⚠ EXERCISE — RED TEAM CONJUNCTION SCENARIO — EXERCISE ⚠';
    document.body.appendChild(banner);

    // Add CSS animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes pulse-banner {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.7; }
        }
    `;
    document.head.appendChild(style);

    // Sequence the events with accelerated timing
    RED_TEAM.timeline.forEach((event, index) => {
        const delay = index * 4000;  // 4 seconds between events (accelerated)
        setTimeout(() => {
            // Toast notification
            const colors = {
                EMERGENCY: '#ff1744',
                CRITICAL: '#ff6d00',
                HIGH: '#ffab00',
                ROUTINE: '#00e676',
            };
            const color = colors[event.severity] || '#78909c';

            if (typeof showToast === 'function') {
                showToast(
                    `[${event.severity}] ${event.event}`,
                    event.detail,
                    color
                );
            }

            // Console log with timestamp
            const tMin = Math.floor(event.t / 60);
            const tSec = event.t % 60;
            console.log(`[RED TEAM T+${tMin}:${String(tSec).padStart(2,'0')}] ${event.severity} | ${event.event}`);
            console.log(`  Module: ${event.module}`);
            console.log(`  Action: ${event.action}`);

            // Update gauges for drama
            if (event.severity === 'EMERGENCY') {
                const conjGauge = STATE.gauges.find(g => g.key === 'conjActive');
                if (conjGauge) conjGauge.value = 47;  // Spike
                if (typeof renderGauges === 'function') renderGauges();
            }

            // Final event — clean up
            if (index === RED_TEAM.timeline.length - 1) {
                setTimeout(() => {
                    const b = document.getElementById('redTeamBanner');
                    if (b) b.remove();
                    console.log('[RED TEAM] ═══════════════════════════════════════');
                    console.log('[RED TEAM] EXERCISE COMPLETE — STAND DOWN');
                    console.log('[RED TEAM] ═══════════════════════════════════════');
                }, 5000);
            }
        }, delay);
    });
}

// Expose globally
window.RED_TEAM = RED_TEAM;
window.runRedTeamScenario = runRedTeamScenario;

console.log('[RED TEAM] Module loaded. Run: runRedTeamScenario()');
