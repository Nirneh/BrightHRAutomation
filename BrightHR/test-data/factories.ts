import { randomUUID } from 'node:crypto';

export type Employee = {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  jobTitle: string;
};

export type SignupUser = {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  companyName: string;
};

function createRunId(): string {
  return `${Date.now()}-${randomUUID().slice(0, 8)}`;
}

export function createEmployee(firstName: string, jobTitle: string): Employee {
  const runId = createRunId();

  return {
    firstName,
    lastName: 'Automation',
    email: `${firstName.toLowerCase()}.${runId}@example.test`,
    phoneNumber: '07777777777',
    jobTitle,
  };
}

const JOB_TITLES = ['QA Engineer', 'Support Analyst', 'Product Manager'];

export function createEmployees(count: number): Employee[] {
  return Array.from({ length: count }, (_, i) =>
    createEmployee(`Employee${i + 1}`, JOB_TITLES[i % JOB_TITLES.length]),
  );
}

export function createSignupUser(): SignupUser {
  const runId = createRunId();

  return {
    firstName: 'Automation',
    lastName: 'User',
    email: `signup.${runId}@example.test`,
    phoneNumber: '07111111111',
    companyName: `QA Test ${runId}`,
  };
}
