// Import required k6 browser modules
import { browser } from 'k6/browser';

// Read configuration from JSON file
const { widgetUrl, visitors } = JSON.parse(open('./widget-config.json'));

// Test configuration
export const options = {
    scenarios: {
        widgetVisitors: {
            executor: 'shared-iterations',
            vus: 1,
            iterations: Number(__ENV.VISITORS || visitors || 1),
            options: {
                browser: {
                    type: 'chromium',
                },
            },
        },
    },
};

// Create visitor  simple message
function createVisitor() {
    return {
        message: `Message ${__ITER + 1}`,  // Simple: Message 1, Message 2, Message 3...
    };
}

// Add visitor data to URL
function buildVisitorUrl(baseUrl, visitor) {
    const separator = baseUrl.includes('?') ? '&' : '?';
    return `${baseUrl}${separator}visitorId=${visitor.id}&visitorName=${visitor.name}&visitorEmail=${visitor.email}`;
}

// Main test function
export default async function () {
    if (!widgetUrl) {
        throw new Error('widgetUrl missing in widget-config.json');
    }

    const visitor = createVisitor();
    const page = await browser.newPage();

    try {
        // Load chat page
        await page.goto(buildVisitorUrl(widgetUrl, visitor), {
            waitUntil: 'load',
            timeout: 30000,
        });

        // Open chat widget
        await page.locator('button[aria-label="Open chat widget"]').click();
        await page.waitForTimeout(1000);

        // Close privacy popup if exists
        await page.locator('button', { hasText: 'Close' }).click();

        // Type and send message
        await page.locator('[contenteditable="true"]').fill(visitor.message);
        await page.locator('button.flex.h-10.w-10.items-center.justify-center.rounded-full').click();
        await page.waitForTimeout(2000);

        console.log(`✓ ${visitor.message} `);

    } finally {
        await page.close();
    }
}