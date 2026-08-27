import { expect, type Page, type Locator } from '@playwright/test';
import type { Employee } from '../test-data/factories.js';

export class EmployeesPage {
  private readonly sidebarEmployeesLink: Locator;
  private readonly addEmployeeButton: Locator;
  private readonly addAnotherEmployeeButton: Locator;
  private readonly firstNameInput: Locator;
  private readonly lastNameInput: Locator;
  private readonly emailAddressInput: Locator;
  private readonly phoneNumberInput: Locator;
  private readonly startDateInput: Locator;
  private readonly jobTitleInput: Locator;
  private readonly saveNewEmployeeButton: Locator;
  private readonly closeModalButton: Locator;
  private readonly employeeListHeading: Locator;

  constructor(private readonly page: Page) {
    this.sidebarEmployeesLink = page.getByTestId('sideBar').getByRole('link', { name: 'Employees' });
    this.addEmployeeButton = page.getByRole('button', { name: 'Add employee' });
    this.addAnotherEmployeeButton = page.getByRole('button', { name: 'Add another employee' });
    this.firstNameInput = page.getByLabel('First name');
    this.lastNameInput = page.getByLabel('Last name');
    this.emailAddressInput = page.getByLabel('Email address');
    this.phoneNumberInput = page.getByLabel('Phone number(optional)');
    this.startDateInput = page.getByLabel('Start date (optional)');
    this.jobTitleInput = page.getByLabel('Job title(optional)');
    this.saveNewEmployeeButton = page.getByRole('button', { name: 'Save new employee' });
    this.closeModalButton = page.getByLabel('Close modal');
    this.employeeListHeading = page.getByRole('heading', { name: /^Employees \(\d+\)$/ });
  }

  async open(): Promise<void> {
    await this.page.goto('/dashboard');
    await this.sidebarEmployeesLink.click();
  }

  async addEmployee(employee: Employee, isFirst: boolean): Promise<void> {
    const addButton = isFirst ? this.addEmployeeButton : this.addAnotherEmployeeButton;

    await addButton.click();
    await this.firstNameInput.fill(employee.firstName);
    await this.lastNameInput.fill(employee.lastName);
    await this.emailAddressInput.fill(employee.email);
    await this.phoneNumberInput.fill(employee.phoneNumber);
    await this.selectStartDate(new Date());
    await this.jobTitleInput.fill(employee.jobTitle);
    await this.saveNewEmployeeButton.click();
    // Fail fast, right at the point of failure, if the save didn't actually succeed.
    await expect(this.page.getByText(`${employee.firstName} added to BrightHR Lite`)).toBeVisible();
  }

  private async selectStartDate(date: Date): Promise<void> {
    await this.startDateInput.click();
    // The calendar's day-cell title is `Tooltip for date: ${Date.toString()}`, rendered by the
    // *browser* in its own timezone, while `date` is built in *Node*. Both are pinned to the same
    // zone (timezoneId/TZ in playwright.config.ts) for determinism, but matching only the
    // toDateString() prefix (weekday/month/day/year) sidesteps the time/timezone suffix
    // altogether, so the two clocks don't need to agree exactly to find the right cell.
    await this.page.locator(`[title^="Tooltip for date: ${date.toDateString()}"]`).click();
  }

  async closeSuccessDialog(): Promise<void> {
    await this.closeModalButton.click();
  }

  async verifyEmployeesVisible(employees: Employee[]): Promise<void> {
    await expect(this.employeeListHeading).toBeVisible();

    for (const employee of employees) {
      const card = this.page
        .getByRole('heading', { name: `${employee.firstName} ${employee.lastName}` })
        .first();
      await expect(card).toBeVisible({ timeout: 10_000 });
      await expect(card.locator('..').getByText(employee.jobTitle)).toBeVisible();
    }
  }
}
