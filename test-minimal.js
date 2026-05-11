import { browser } from 'k6/browser';  // ✅ Correct import for k6 v0.52+

export const options = {
    scenarios: {
        test: {
            executor: 'shared-iterations',
            vus: 1,
            iterations: 1,
            options: {
                browser: {
                    type: 'chromium',
                    args: ['--no-sandbox', '--disable-setuid-sandbox']
                }
            }
        }
    }
};

export default async function () {
    console.log('Step 1: Creating browser page...');
    const page = await browser.newPage();  // Note: await is required
    console.log('Step 2: Page created successfully');
    
    console.log('Step 3: Navigating to test URL...');
    await page.goto('https://test.k6.io');
    console.log('Step 4: Page loaded');
    
    const title = await page.title();
    console.log(`Step 5: Page title: ${title}`);
    
    await page.close();
    console.log('Test completed successfully!');
}