import { type Locator, type Page } from '@playwright/test';
import type { SignupUser } from '../test-data/factories.js';

export class SignupPage {
  readonly submitButton: Locator;

  constructor(private readonly page: Page) {
    this.submitButton = page.getByRole('button', { name: 'Submit' });
  }

  async open(): Promise<void> {
    await this.page.goto('/lite/');
    await this.page.getByRole('button', { name: 'Sign up' }).click();
  }

  async completeForm(user: SignupUser): Promise<void> {
    await this.page.getByTestId('first-name-input').fill(user.firstName);
    await this.page.getByTestId('last-name-input').fill(user.lastName);
    await this.page.getByTestId('email-input').fill(user.email);
    await this.page.getByTestId('phone-number-input').fill(user.phoneNumber);
    await this.page.getByTestId('company-name-input').fill(user.companyName);
    // termsConsentCheckBox's <label for> points at the wrong id, so a mouse click
    // never toggles it; keyboard activation does.
    await this.page.getByTestId('termsConsentCheckBox').focus();
    await this.page.keyboard.press('Space');
    await this.page.getByTestId('checkbox-termsConsent').check();
  }

  async submit(): Promise<void> {
    await this.submitButton.click();
  }
}
