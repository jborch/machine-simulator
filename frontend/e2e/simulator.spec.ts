import { test, expect } from '@playwright/test';

test('simulator idle mode with start/stop controls', async ({ page }) => {
  await page.goto('/');

  const stateJson = page.getByTestId('state-json');
  await expect(stateJson).toBeVisible({ timeout: 10_000 });

  // Verify initial idle state
  await expect(stateJson).toContainText('"isRunning": false');
  await expect(stateJson).toContainText('"stations"');

  const runBtn = page.getByTestId('run-btn');
  const stopBtn = page.getByTestId('stop-btn');

  // Run should be enabled, Stop should be disabled
  await expect(runBtn).toBeEnabled();
  await expect(stopBtn).toBeDisabled();

  // Click Run and verify state changes
  await runBtn.click();
  await expect(stateJson).toContainText('"isRunning": true', { timeout: 5_000 });
  await expect(runBtn).toBeDisabled();
  await expect(stopBtn).toBeEnabled();

  // Click Stop and verify state changes back
  await stopBtn.click();
  await expect(stateJson).toContainText('"isRunning": false', { timeout: 5_000 });
  await expect(runBtn).toBeEnabled();
  await expect(stopBtn).toBeDisabled();
});
