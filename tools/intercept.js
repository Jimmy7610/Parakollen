const { chromium } = require('playwright');

(async () => {
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext();
    const page = await context.newPage();

    const endpoints = new Set();
    const requests = [];

    page.on('response', async (response) => {
        const url = response.url();
        // Filter for JSON APIs related to results, medals, schedules, etc.
        if (url.includes('.json') || url.includes('api') || url.includes('/v1/')) {
            if (response.request().resourceType() === 'fetch' || response.request().resourceType() === 'xhr') {
                endpoints.add(url);
                try {
                    const json = await response.json();
                    requests.push({ url, json });
                } catch (e) {
                    // ignore non-json
                }
            }
        }
    });

    console.log("Navigating to https://www.paralympic.org/milano-cortina-2026/results...");
    try {
        await page.goto('https://www.paralympic.org/milano-cortina-2026/results', { waitUntil: 'networkidle' });
    } catch (e) {
        console.log('Error navigating or waiting for network idle:', e);
    }

    // Also try Paris 2024 to see Bornan structure if Milano Cortina is totally empty
    console.log("Navigating to https://www.paralympic.org/paris-2024/results...");
    try {
        await page.goto('https://www.paralympic.org/paris-2024/results', { waitUntil: 'networkidle' });
    } catch (e) { }

    await browser.close();

    console.log("--- FOUND ENDPOINTS ---");
    for (const url of endpoints) {
        console.log("- " + url);
    }

    console.log("\n--- EXAMPLES ---");
    requests.slice(0, 5).forEach(req => {
        console.log(`URL: ${req.url}`);
        console.log(`Response Snippet: ${JSON.stringify(req.json).substring(0, 200)}...`);
        console.log("-------------------");
    });

})();
