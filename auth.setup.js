// auth.setup.js
import { expect, test as setup } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

const authFile = path.resolve('.auth/user.json');

setup('authenticate', async ({ page }) => {
  await page.goto('/');
  const homePageIcon = page.getByRole('link', { name: 'FedRAMP home page' });

  await expect(homePageIcon).toBeVisible();

  // Ensure the directory exists before Playwright writes to it
  fs.mkdirSync(path.dirname(authFile), { recursive: true });

  await page.context().storageState({
    path: authFile,
  });
});