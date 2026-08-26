import { type Page, type Locator } from '@playwright/test';
import type { SignupUser } from '../test-data/factories.js';

export class SignupPage {
  readonly submitButton: Locator;
  private readonly signUpButton: Locator;
  private readonly firstNameInput: Locator;
  private readonly lastNameInput: Locator;
  private readonly emailInput: Locator;
  private readonly phoneNumberInput: Locator;
  private readonly companyNameInput: Locator;
  private readonly employerConfirmationCheckbox: Locator;
  private readonly termsConsentCheckbox: Locator;

  constructor(private readonly page: Page) {
    this.submitButton = page.getByRole('button', { name: 'Submit' });
    this.signUpButton = page.getByRole('button', { name: 'Sign up' });
    this.firstNameInput = page.getByTestId('first-name-input');
    this.lastNameInput = page.getByTestId('last-name-input');
    this.emailInput = page.getByTestId('email-input');
    this.phoneNumberInput = page.getByTestId('phone-number-input');
    this.companyNameInput = page.getByTestId('company-name-input');
    this.employerConfirmationCheckbox = page.getByTestId('termsConsentCheckBox');
    this.termsConsentCheckbox = page.getByTestId('checkbox-termsConsent');
  }

  async open(): Promise<void> {
    await this.page.goto('/lite/');
    await this.signUpButton.click();
  }

  async completeForm(user: SignupUser): Promise<void> {
    await this.firstNameInput.fill(user.firstName);
    await this.lastNameInput.fill(user.lastName);
    await this.emailInput.fill(user.email);
    await this.phoneNumberInput.fill(user.phoneNumber);
    await this.companyNameInput.fill(user.companyName);
    // termsConsentCheckBox's <label for> points at the wrong id, so a mouse click
    // never toggles it; keyboard activation does.
    await this.employerConfirmationCheckbox.focus();
    await this.page.keyboard.press('Space');
    await this.termsConsentCheckbox.check();
  }

  async submit(): Promise<void> {
    await this.submitButton.click();
  }
}
