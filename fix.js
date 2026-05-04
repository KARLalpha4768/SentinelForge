const https = require('https');
https.get('https://sentinelforge.vercel.app/sentinel_core.js?v=20260503c', res => {
    let d = '';
    res.on('data', c => d += c);
    res.on('end', () => {
        console.log('has openProgrammerSheet:', d.includes('openProgrammerSheet'));
        console.log('has sentinel_slingshot_catalog link:', d.includes("href=\"sentinel_slingshot_catalog.html\""));
        // Find the Programmer's Specs link
        const idx = d.indexOf("Programmer");
        if (idx > -1) {
            console.log('Context:', d.substring(idx - 100, idx + 100));
        }
    });
});
