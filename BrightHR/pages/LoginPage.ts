import { type Page } from '@playwright/test';

export class LoginPage {
  constructor(private readonly page: Page) {}

  async login(username: string, password: string): Promise<void> {
    await this.page.getByLabel('Email address').fill(username);
    await this.page.getByLabel('Password').fill(password);
    await this.page.getByTestId('login-button').click();
    await this.page.waitForURL('**/dashboard');
  }
}
