import { expect, test } from '@playwright/test';
import { SignupPage } from '../../pages/SignupPage.js';
import { createSignupUser } from '../../test-data/factories.js';

test.describe('User sign-up', () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test('submits a valid new-user registration', async ({ page }) => {
    const signupPage = new SignupPage(page);

    await signupPage.open();
    await signupPage.completeForm(createSignupUser());
    await expect(signupPage.submitButton).toBeEnabled();
    await signupPage.submit();
  });
});
