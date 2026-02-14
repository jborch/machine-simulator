import { test, expect } from '@playwright/test';

test('overview page renders machine loop with controls', async ({ page }) => {
  await page.goto('/');

  const runBtn = page.getByTestId('run-btn');
  const stopBtn = page.getByTestId('stop-btn');
  const machineLoop = page.getByTestId('machine-loop');

  await expect(machineLoop).toBeVisible({ timeout: 10_000 });

  // Ensure we start from a stopped state
  if (await stopBtn.isEnabled()) {
    await stopBtn.click();
    await expect(runBtn).toBeEnabled({ timeout: 5_000 });
  }

  // Run should be enabled, Stop should be disabled
  await expect(runBtn).toBeEnabled();
  await expect(stopBtn).toBeDisabled();

  // Click Run and verify controls change
  await runBtn.click();
  await expect(runBtn).toBeDisabled({ timeout: 5_000 });
  await expect(stopBtn).toBeEnabled();

  // Click Stop and verify controls change back
  await stopBtn.click();
  await expect(runBtn).toBeEnabled({ timeout: 5_000 });
  await expect(stopBtn).toBeDisabled();

  await page.screenshot({ path: 'e2e/screenshots/overview.png', fullPage: true });
});
