const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
    // Launch headless but with custom arguments to bypass basic protections
    const browser = await chromium.launch({
        headless: true,
        args: [
            '--disable-blink-features=AutomationControlled',
            '--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        ]
    });

    const context = await browser.newContext({
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        viewport: { width: 1280, height: 720 },
        deviceScaleFactor: 1,
        hasTouch: false,
        isMobile: false
    });

    // Attempt to mask webdriver
    await context.addInitScript(() => {
        Object.defineProperty(navigator, 'webdriver', {
            get: () => undefined,
        });
    });

    const page = await context.newPage();

    const output = [];
    const targetKeywords = ['api', 'schedule', 'json', 'sph-s-api'];

    page.on('response', async (response) => {
        const url = response.url();
        const type = response.request().resourceType();

        if (type === 'fetch' || type === 'xhr') {
            if (targetKeywords.some(kw => url.toLowerCase().includes(kw))) {
                try {
                    const json = await response.json();
                    output.push({
                        url,
                        method: response.request().method(),
                        status: response.status(),
                        dataSnippet: JSON.stringify(json).substring(0, 1500)
                    });
                    console.log(`Intercepted: ${url}`);
                } catch (e) {
                    console.log(`Failed to parse: ${url}`);
                }
            }
        }
    });

    console.log('Navigating to schedule page...');
    try {
        await page.goto('https://www.olympics.com/en/milano-cortina-2026/paralympic-games/schedule', { waitUntil: 'domcontentloaded', timeout: 30000 });
        await page.waitForTimeout(8000);
    } catch (e) {
        console.log('Navigation ended with:', e.message);
    }

    fs.writeFileSync('olympics_output.json', JSON.stringify(output, null, 2), 'utf-8');
    console.log(`Done writing ${output.length} APIs to olympics_output.json`);

    await browser.close();
})();
