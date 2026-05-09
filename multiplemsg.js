import { browser } from 'k6/browser';
import { check } from 'k6';

const { widgetUrl } = JSON.parse(open('./widget-config.json'));

// Global iteration counters
let totalIterations = 0;
const vuIterations = new Map();

export const options = {
    scenarios: {
        chrome: {
            executor: 'constant-vus',
            vus: 2,
            duration: '30s',
            options: {
                browser: {
                    type: 'chromium',
                },
            },
        },
        edge: {
            executor: 'constant-vus',
            vus: 2,
            duration: '30s',
            options: {
                browser: {
                    type: 'chromium',
                },
            },
        },
    },
};

function randomText(length) {
    return Math.random().toString(36).slice(2, 2 + length);
}

export default async function () {
    // Determine browser type based on scenario name
    // k6 provides scenario name via __ENV.SCENARIO or we can detect it differently
    let browserType = 'unknown';
    
    // Method 1: Use the scenario name from the execution context
    // Since k6 doesn't directly expose scenario name in default function,
    // we'll use a workaround - check VU ranges or use custom logic
    
    // Simple approach: Alternate or use VU ranges
    // VUs 1-2 = Chrome, VUs 3-4 = Edge
    const vuId = __VU;
    
    if (vuId <= 2) {
        browserType = 'chrome';
    } else if (vuId <= 4) {
        browserType = 'edge';
    }
    
    // Track iterations per VU and total
    if (!vuIterations.has(vuId)) {
        vuIterations.set(vuId, { browserType, count: 0 });
    }
    
    const vuData = vuIterations.get(vuId);
    vuData.count++;
    totalIterations++;
    
    const iterationNum = vuData.count;
    
    console.log(`[${browserType}:VU${vuId}] Starting iteration #${iterationNum} (Total across all VUs: ${totalIterations})`);
    
    const userNum = (vuId % 2) + 1;
    const message = `Test user ${userNum} from ${browserType}`;
    const visitorId = `${browserType}-${Date.now()}-${vuId}-${randomText(6)}`;
    
    const page = await browser.newPage();
    
    try {
        console.log(`[${browserType}:VU${vuId}] Sending: "${message}"`);
        
        const separator = widgetUrl.includes('?') ? '&' : '?';
        const url = `${widgetUrl}${separator}visitorId=${visitorId}&visitorName=${browserType}%20User${userNum}&visitorEmail=${browserType}.user${userNum}@example.com&cacheBust=${Date.now()}`;
        
        console.log(`[${browserType}:VU${vuId}] Navigating to: ${url}`);
        
        await page.goto(url, { waitUntil: 'load', timeout: 30000 });
        
        await page.locator('button[aria-label="Open chat widget"]').click();
        await page.waitForTimeout(1000);
        
        try {
            const closeButton = page.locator('button', { hasText: 'Close' });
            if (await closeButton.isVisible()) {
                await closeButton.click();
            }
        } catch (e) {}
        
        await page.locator('[contenteditable="true"]').fill(message);
        await page.locator('button.flex.h-10.w-10.items-center.justify-center.rounded-full').click();
        await page.waitForTimeout(2000);
        
        console.log(`[${browserType}:VU${vuId}] ✓ Successfully sent: "${message}" (Iteration #${iterationNum})`);
        
    } catch (error) {
        console.error(`[${browserType}:VU${vuId}] ✗ Error: ${error.message} (Iteration #${iterationNum})`);
    } finally {
        await page.close();
    }
}

// Handle test end to show final statistics
export function handleSummary(data) {
    console.log('\n========== FINAL STATISTICS ==========');
    console.log(`Total iterations (page visits): ${totalIterations}`);
    console.log('\nBreakdown by VU:');
    
    const vuStats = Array.from(vuIterations.entries()).map(([vuId, data]) => ({
        vuId,
        browserType: data.browserType,
        iterations: data.count
    })).sort((a, b) => a.vuId - b.vuId);
    
    // Group by browser type
    const chromeVUs = vuStats.filter(v => v.browserType === 'chrome');
    const edgeVUs = vuStats.filter(v => v.browserType === 'edge');
    
    if (chromeVUs.length > 0) {
        const chromeTotal = chromeVUs.reduce((sum, v) => sum + v.iterations, 0);
        console.log(`\nCHROME: Total ${chromeTotal} visits`);
        chromeVUs.forEach(v => {
            console.log(`  - VU ${v.vuId}: ${v.iterations} visits`);
        });
    }
    
    if (edgeVUs.length > 0) {
        const edgeTotal = edgeVUs.reduce((sum, v) => sum + v.iterations, 0);
        console.log(`\nEDGE: Total ${edgeTotal} visits`);
        edgeVUs.forEach(v => {
            console.log(`  - VU ${v.vuId}: ${v.iterations} visits`);
        });
    }
    
    console.log('\n======================================\n');
    
    return {
        'stdout': JSON.stringify(data, null, 2),
    };
}