import { test as setup } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { LoginPage } from './pages/LoginPage.js';

const authDirectory = path.join(process.cwd(), 'playwright', '.auth');
const authFile = path.join(authDirectory, 'user.json');

setup('authenticate BrightHR user', async ({ page }) => {
  const username = process.env.TEST_USERNAME;
  const password = process.env.TEST_PASSWORD;

  if (!username || !password) {
    throw new Error(
      'Set TEST_USERNAME and TEST_PASSWORD in your .env file before running authenticated tests.',
    );
  }

  await mkdir(authDirectory, { recursive: true });

  await page.goto('/');
  await new LoginPage(page).login(username, password);

  await page.context().storageState({ path: authFile });
  await page.context().close();
});
