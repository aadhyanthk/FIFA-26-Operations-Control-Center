import { test, expect } from '@playwright/test';

test.describe('Dashboard E2E', () => {
  test('should load the dashboard and verify initial tabs', async ({ page }) => {
    // Navigate to the app (assuming it runs on localhost:1420 by default via Tauri dev)
    await page.goto('http://localhost:1420/');
    
    // Verify title
    await expect(page).toHaveTitle(/Vite \+ React \+ TS/); // Or whatever the title is in index.html

    // Verify tabs are present
    const overviewTab = page.locator('button[role="tab"]', { hasText: 'Overview' });
    await expect(overviewTab).toBeVisible();
    
    const agentTab = page.locator('button[role="tab"]', { hasText: 'Agent' });
    await expect(agentTab).toBeVisible();

    // Verify metric cards render
    const metricCards = page.locator('.card');
    await expect(metricCards.first()).toBeVisible();

    // Click Agent tab and verify panel
    await agentTab.click();
    await expect(page.getByText('Agent Interface')).toBeVisible(); // Or similar text in AgentTab
  });
});
