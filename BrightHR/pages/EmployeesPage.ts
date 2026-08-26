import { expect, type Locator, type Page } from '@playwright/test';
import type { Employee } from '../test-data/factories.js';

export class EmployeesPage {
  readonly addAnotherEmployeeButton: Locator;
  readonly closeModalButton: Locator;
  readonly employeeListHeading: Locator;

  constructor(private readonly page: Page) {
    this.addAnotherEmployeeButton = page.getByRole('button', { name: 'Add another employee' });
    this.closeModalButton = page.getByLabel('Close modal');
    this.employeeListHeading = page.getByRole('heading', { name: /^Employees \(\d+\)$/ });
  }

  async open(): Promise<void> {
    await this.page.goto('/dashboard');
    await this.page.getByTestId('sideBar').getByRole('link', { name: 'Employees' }).click();
  }

  async addEmployee(employee: Employee, isFirst: boolean): Promise<void> {
    const addButton = isFirst
      ? this.page.getByRole('button', { name: 'Add employee' })
      : this.addAnotherEmployeeButton;

    await addButton.click();
    await this.page.getByLabel('First name').fill(employee.firstName);
    await this.page.getByLabel('Last name').fill(employee.lastName);
    await this.page.getByLabel('Email address').fill(employee.email);
    await this.page.getByLabel('Phone number(optional)').fill(employee.phoneNumber);
    await this.page.getByLabel('Job title(optional)').fill(employee.jobTitle);
    await this.page.getByRole('button', { name: 'Save new employee' }).click();
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
    }
  }
}
