const CHAPTERS = {
    ch1: \`
        <div class="page-container active">
            <div class="chapter-title">1. Space Domain Awareness Doctrine</div>
            <div class="chapter-subtitle">Foundations of orbital intelligence and the observe-orient-decide-act loop.</div>
            
            <h2>What is Space Domain Awareness (SDA)?</h2>
            <p>Space Domain Awareness represents a shift from legacy "Space Situational Awareness" (SSA). While SSA focused merely on tracking objects and avoiding collisions, SDA treats space as a contested operational domain. It requires understanding not just <strong>where</strong> an object is, but <strong>what</strong> it is doing, <strong>who</strong> owns it, and its <strong>intent</strong>.</p>
            
            <div class="callout info">
                <strong>The SentinelForge Mission:</strong> Provide a unified, unclassified operational picture bridging commercial sensor edge-networks with cloud-scale orbital propagation.
            </div>

            <h2>The SDA Kill Chain</h2>
            <p>SDA operations follow a distinct intelligence lifecycle:</p>
            <ol>
                <li><strong>Detect:</strong> Identify energy return (optical or radar) against the space background.</li>
                <li><strong>Track:</strong> Correlate multiple detections into a single tracklet over a sensor pass.</li>
                <li><strong>Characterize:</strong> Determine physical properties (RCS, photometric signature, stability).</li>
                <li><strong>Attribute:</strong> Identify the specific cataloged object or declare an Uncorrelated Track (UCT).</li>
                <li><strong>Maintain:</strong> Update the state vector and covariance matrix using sequential filters.</li>
            </ol>

            <h2>Custody Requirements</h2>
            <p>Maintaining "custody" of a space object means having a state vector accurate enough to place a sensor's field of view (FOV) on the object during its next pass. Custody is lost when propagation errors (due to drag or unmodeled maneuvers) exceed the sensor's FOV.</p>
        </div>
    \`,
    ch2: \`
        <div class="page-container active">
            <div class="chapter-title">2. Orbital Mechanics Reference</div>
            <div class="chapter-subtitle">The physics governing satellite motion and trajectory propagation.</div>

            <h2>Keplerian Elements</h2>
            <p>A satellite's orbit is classically defined by six Keplerian elements:</p>
            <ul>
                <li><strong>Semi-major Axis (a):</strong> Defines the size of the orbit and orbital period.</li>
                <li><strong>Eccentricity (e):</strong> Defines the shape (0 = circular, >0 = elliptical).</li>
                <li><strong>Inclination (i):</strong> Tilt of the orbital plane relative to the equator.</li>
                <li><strong>Right Ascension of the Ascending Node (Ω):</strong> Swivel of the orbital plane.</li>
                <li><strong>Argument of Perigee (ω):</strong> Orientation of the ellipse within the plane.</li>
                <li><strong>True Anomaly (ν):</strong> The satellite's current position along the orbit.</li>
            </ul>

            <div class="code-block">
// Standard TLE Format (Two-Line Element)
1 25544U 98067A   26122.50000000  .00016717  00000-0  30000-3 0  9997
2 25544  51.6419 247.4627 0006703 130.5360 325.0288 15.49013238563537
            </div>

            <h2>Perturbation Forces</h2>
            <p>Satellites do not follow perfect Keplerian orbits due to external forces:</p>
            <ul>
                <li><strong>J2 Effect:</strong> Earth's equatorial bulge causes the ascending node to precess. Crucial for Sun-Synchronous Orbits (SSO).</li>
                <li><strong>Atmospheric Drag:</strong> The primary uncertainty in LEO. Highly dependent on space weather (F10.7, Kp).</li>
                <li><strong>Solar Radiation Pressure (SRP):</strong> Photons striking the spacecraft alter its orbit, dominant in GEO.</li>
                <li><strong>Third-Body Gravity:</strong> Lunar and solar gravity cause long-term cyclic changes in HEO/GEO.</li>
            </ul>
        </div>
    \`,
    ch3: \`
        <div class="page-container active">
            <div class="chapter-title">3. Sensor Networks & Architecture</div>
            <div class="chapter-subtitle">Ground and space-based phenomenologies for tracking 46,000+ objects.</div>

            <h2>Phenomenology Comparison</h2>
            
            <h3>1. Phased Array Radar</h3>
            <p>Active systems that bounce RF energy off targets. Excellent for LEO tracking because they are weather-independent and provide instantaneous range/range-rate measurements. However, power requirements scale with the fourth power of distance (radar equation), making them inefficient for GEO.</p>
            <ul>
                <li><strong>Key Networks:</strong> USSF Space Fence, LeoLabs (S-band), Eglin phased array.</li>
            </ul>

            <h3>2. Optical Telescopes</h3>
            <p>Passive systems that detect reflected sunlight. Highly efficient for MEO and GEO tracking. They are limited by weather, daylight, and terminator conditions (target must be illuminated while the sensor is in darkness).</p>
            <ul>
                <li><strong>Key Networks:</strong> ExoAnalytic, Slingshot Global Sensor Network, GEODSS.</li>
            </ul>

            <div class="callout info">
                <strong>Edge Node Processing:</strong> SentinelForge assumes smart edge nodes. Optical sensors run GPU-accelerated pipelines locally to extract RA/Dec astrometry, sending only bytes of telemetry to the cloud rather than gigabytes of FITS images.
            </div>
        </div>
    \`,
    ch4: \`
        <div class="page-container active">
            <div class="chapter-title">4. Conjunction Assessment</div>
            <div class="chapter-subtitle">Evaluating and mitigating orbital collision risks.</div>

            <h2>Probability of Collision (Pc)</h2>
            <p>Conjunction Assessment (CA) is not just about computing the miss distance at the Time of Closest Approach (TCA). Because states are uncertain, we compute a Probability of Collision (Pc). This involves integrating the 3D position probability density functions (PDFs) of both objects over the collision volume.</p>

            <h2>Covariance Realism</h2>
            <p>Pc relies entirely on accurate covariance matrices. If the filter is overconfident (covariance too small), the Pc will artificially drop to zero. If underconfident (covariance too large), the Pc dilutes. SentinelForge tracks Normalized Estimation Error Squared (NEES) to monitor filter health.</p>

            <div class="callout warning">
                <strong>Action Thresholds:</strong> Most operators begin maneuver planning when Pc > 1e-4 (1 in 10,000). Automatic maneuvers may be triggered at Pc > 1e-3.
            </div>

            <h2>Secondary Screening</h2>
            <p>When planning a Collision Avoidance Maneuver (CAM), the proposed post-maneuver ephemeris must be screened against the entire catalog to ensure the avoidance burn doesn't cause a collision with a third object 12 hours later.</p>
        </div>
    \`,
    ch5: \`
        <div class="page-container active">
            <div class="chapter-title">5. Catalog Maintenance</div>
            <div class="chapter-subtitle">Orbit determination, correlation, and UCT resolution.</div>

            <h2>The Correlation Problem</h2>
            <p>When a sensor generates a tracklet, the system must determine if it belongs to a known object. This is done by propagating all catalog objects to the observation time and performing a gating check (usually using Mahalanobis distance). If it matches, the object's state is updated via a Kalman filter or batch least-squares.</p>

            <h2>Uncorrelated Tracks (UCTs)</h2>
            <p>If a tracklet fails to correlate with any known object, it becomes a UCT. UCTs arise from:</p>
            <ul>
                <li>Unannounced launches.</li>
                <li>Unexpected maneuvers breaking custody.</li>
                <li>Satellite breakups or collisions.</li>
                <li>Sensor anomalies/noise.</li>
            </ul>

            <h2>Priority Reacquisition</h2>
            <p>When an object is maneuvered or heavily perturbed by atmospheric drag, its covariance grows rapidly. Once the uncertainty volume exceeds standard sensor search boxes, it enters the "Priority Reacquisition Queue." Dedicated sensors must execute wide-area search patterns to recover it.</p>
        </div>
    \`,
    ch6: \`
        <div class="page-container active">
            <div class="chapter-title">6. Debris Environment</div>
            <div class="chapter-subtitle">Fragmentation events and the Kessler Syndrome risk.</div>

            <h2>Debris Generation Mechanisms</h2>
            <p>The space catalog is dominated by debris (>70% of tracked objects). Major sources include:</p>
            <ul>
                <li><strong>Anti-Satellite (ASAT) Tests:</strong> Intentional destruction (e.g., Cosmos 1408, Fengyun-1C).</li>
                <li><strong>Accidental Collisions:</strong> e.g., Iridium 33 / Cosmos 2251 in 2009.</li>
                <li><strong>Propulsion Breakups:</strong> Exploding residual propellant in abandoned rocket bodies (the most common cause).</li>
                <li><strong>Material Degradation:</strong> Flaking paint, thermal blanket shedding.</li>
            </ul>

            <div class="callout info">
                <strong>Lethal Nontrackable (LNT) Debris:</strong> The SSN tracks objects down to ~10cm. Fragments between 1cm and 10cm are generally untrackable but possess enough kinetic energy to destroy a spacecraft upon impact. Shielding (e.g., Whipple shields) is required to survive LNT impacts.
            </div>

            <h2>Debris Cloud Evolution</h2>
            <p>Following a fragmentation event, debris initially forms a localized cloud. Over hours to days, differences in orbital period cause the cloud to stretch into a "ring" around the entire orbit plane. Over months to years, variations in J2 precession (due to slight inclination differences) cause the orbital planes to fan out, eventually enveloping the entire Earth.</p>
        </div>
    \`,
    ch7: \`
        <div class="page-container active">
            <div class="chapter-title">7. Launch & Reentry</div>
            <div class="chapter-subtitle">Spaceflight operations at the atmospheric boundary.</div>

            <h2>Launch Phase Tracking</h2>
            <p>New launches inject multiple objects into orbit (payloads, upper stages, deployment hardware). Because exact injection vectors often deviate from pre-launch nominals, space surveillance radars (like the USSF Space Fence) cast a wide "fence" to capture the objects on their first revolution and establish initial state vectors.</p>

            <h2>Atmospheric Reentry</h2>
            <p>Objects in LEO eventually decay due to atmospheric drag. Reentry prediction is notoriously difficult because atmospheric density fluctuates wildly with solar activity, and the object's tumbling dynamics constantly change its ballistic coefficient.</p>

            <div class="callout warning">
                <strong>Uncontrolled Reentry Hazard:</strong> Large rocket bodies (like the 22-ton CZ-5B core stage) that reach orbit without restart capability will reenter uncontrolled. High melting-point materials (titanium, stainless steel) frequently survive reentry and impact the ground.
            </div>

            <h2>Controlled Deorbit</h2>
            <p>Responsible operators utilize reserved propellant to lower perigee into the dense atmosphere (~50 km) over an uninhabited region (typically the South Pacific Ocean Uninhabited Area, SPOUA), ensuring complete destruction and zero ground casualty risk.</p>
        </div>
    \`,
    ch8: \`
        <div class="page-container active">
            <div class="chapter-title">8. System Architecture</div>
            <div class="chapter-subtitle">SentinelForge operational pipeline and data flows.</div>

            <h2>Edge-to-Cloud Pipeline</h2>
            <p>SentinelForge operates on a distributed architecture designed for low-latency space domain awareness:</p>
            <ul>
                <li><strong>Sensor Edge:</strong> Optical and radar nodes process raw phenomenology locally. They output standard CCSDS Tracking Data Messages (TDMs).</li>
                <li><strong>Ingest Layer:</strong> A highly available message queue consumes telemetry from internal networks and commercial APIs (Space-Track, Slingshot, LeoLabs).</li>
                <li><strong>Fusion Core:</strong> A C++/CUDA compute cluster runs batch least-squares OD (Orbit Determination) and sequential Kalman filters to update the global catalog state.</li>
                <li><strong>Ops Dashboard:</strong> This interface! A React/Cesium frontend pulling state data via WebSockets for real-time visualization.</li>
            </ul>

            <h2>Agentic Autonomy</h2>
            <p>SentinelForge employs a multi-agent system to automate routine operations. Agents monitor conjunction queues, task sensors for reacquisition, and evaluate covariance realism without human intervention. Operators only intervene during high-tier escalations (e.g., active avoidance maneuvers).</p>
        </div>
    \`
};

// Navigation Logic
const navItems = document.querySelectorAll('.nav-item');
const contentContainer = document.getElementById('portalContent');

function loadChapter(chId) {
    // Update active nav state
    navItems.forEach(item => item.classList.remove('active'));
    document.querySelector(\`[data-target="\${chId}"]\`).classList.add('active');

    // Inject HTML
    if (CHAPTERS[chId]) {
        contentContainer.innerHTML = CHAPTERS[chId];
    } else {
        contentContainer.innerHTML = '<div class="page-container active"><h2>Chapter not found</h2></div>';
    }

    // Reset scroll
    contentContainer.scrollTop = 0;
}

// Bind click events
navItems.forEach(item => {
    item.addEventListener('click', () => {
        loadChapter(item.getAttribute('data-target'));
    });
});

// Load chapter 1 by default
loadChapter('ch1');
