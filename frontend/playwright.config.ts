import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  timeout: 30_000,
  use: {
    baseURL: 'http://localhost:4200',
  },
  projects: [
    {
      name: 'chromium',
      use: { browserName: 'chromium' },
    },
  ],
  webServer: [
    {
      command: 'dotnet run --project ../backend/Backend.csproj -- --idle',
      url: 'http://localhost:5000/health',
      reuseExistingServer: !process.env.CI,
      timeout: 30_000,
    },
    {
      command: 'pnpm start',
      url: 'http://localhost:4200',
      reuseExistingServer: !process.env.CI,
      timeout: 30_000,
    },
  ],
});
