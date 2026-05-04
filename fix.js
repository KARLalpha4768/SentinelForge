const fs = require('fs');
let f = fs.readFileSync('frontend/sentinel_drilldown.js', 'utf8');

// Remove the Programmer's Specs link from network drilldown (line 558)
const old = `            <a href="sentinel_slingshot_catalog.html" style="color:#00e5ff;text-decoration:none;padding:3px 10px;border:1px solid rgba(0,229,255,0.2);border-radius:4px;transition:all .2s" onmouseover="this.style.background='rgba(0,229,255,0.1)';this.style.borderColor='rgba(0,229,255,0.4)'" onmouseout="this.style.background='';this.style.borderColor='rgba(0,229,255,0.2)'">\ud83d\udcbb Programmer's Specs</a>`;

const rep = `            <span style="color:#546e7a;font-size:9px;font-style:italic">Click a site row above for station-specific Programmer's Specs</span>`;

if (f.includes(old)) {
    f = f.replace(old, rep);
    fs.writeFileSync('frontend/sentinel_drilldown.js', f);
    console.log('SUCCESS');
} else {
    console.log('NOT FOUND - trying without emoji');
    // Try matching without emoji
    const old2 = `href="sentinel_slingshot_catalog.html"`;
    if (f.includes(old2)) {
        f = f.replace(/<a href="sentinel_slingshot_catalog\.html"[^>]*>.*?Programmer.*?<\/a>/g, rep);
        fs.writeFileSync('frontend/sentinel_drilldown.js', f);
        console.log('SUCCESS (regex)');
    } else {
        console.log('FAILED');
    }
}
