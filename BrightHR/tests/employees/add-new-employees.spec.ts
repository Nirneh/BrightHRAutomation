import { test } from '@playwright/test';
import { EmployeesPage } from '../../pages/EmployeesPage.js';
import { createEmployees } from '../../test-data/factories.js';

test.describe('Employee management', () => {
  test('adds employees and verifies they appear in the employee list', async ({ page }) => {
    const employeesPage = new EmployeesPage(page);
    const employees = createEmployees(2);

    await employeesPage.open();
    for (const [index, employee] of employees.entries()) {
      await employeesPage.addEmployee(employee, index === 0);
    }
    await employeesPage.closeSuccessDialog();
    await employeesPage.verifyEmployeesVisible(employees);
  });
});
