import { randomInt } from 'node:crypto';

export type Employee = {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  jobTitle: string;
};

// 40x40 name pairs x 90 two-digit numbers = 144,000 possible emails. The sandbox is shared and
// never cleaned up, so collisions across runs can't be ruled out entirely — but at that size
// they're unlikely enough in practice to keep the readable firstname.lastnameNN@example.com
// format. example.com (not a live domain, reserved for documentation/testing by RFC 2606) also
// keeps any registration email the app fires on employee creation from reaching a real mailbox.
const FIRST_NAMES = [
  'John', 'Emma', 'Michael', 'Sarah', 'David', 'Olivia', 'James', 'Sophie', 'Daniel', 'Grace',
  'Thomas', 'Alice', 'Robert', 'Laura', 'Andrew', 'Chloe', 'Peter', 'Hannah', 'Mark', 'Amy',
  'Paul', 'Zoe', 'Simon', 'Rachel', 'Adam', 'Lucy', 'Ryan', 'Ella', 'Nathan', 'Megan',
  'Joshua', 'Katie', 'Ben', 'Holly', 'Luke', 'Charlotte', 'Matthew', 'Jessica', 'Oliver', 'Ellie',
];
const LAST_NAMES = [
  'Wood', 'Clark', 'Bennett', 'Hughes', 'Foster', 'Reed', 'Morgan', 'Bailey', 'Coleman', 'Hayes',
  'Turner', 'Wright', 'Baker', 'Carter', 'Mitchell', 'Phillips', 'Campbell', 'Parker', 'Evans', 'Edwards',
  'Collins', 'Stewart', 'Sanders', 'Morris', 'Rogers', 'Cooper', 'Richardson', 'Cox', 'Ward', 'Peterson',
  'Gray', 'Ramirez', 'Watson', 'Brooks', 'Kelly', 'Price', 'Fisher', 'Hunt', 'Hudson', 'Marshall',
];
const JOB_TITLES = ['QA Engineer', 'Support Analyst', 'Product Manager'];

function randomName(exclude: Set<string>): { firstName: string; lastName: string } {
  let firstName: string;
  let lastName: string;
  let key: string;

  do {
    firstName = FIRST_NAMES[randomInt(FIRST_NAMES.length)];
    lastName = LAST_NAMES[randomInt(LAST_NAMES.length)];
    key = `${firstName} ${lastName}`;
  } while (exclude.has(key));

  exclude.add(key);
  return { firstName, lastName };
}

function createEmployeeEmail(firstName: string, lastName: string): string {
  const twoDigitNumber = randomInt(10, 100);
  return `${firstName}.${lastName}${twoDigitNumber}@example.com`.toLowerCase();
}

const MAX_NAME_PAIRS = FIRST_NAMES.length * LAST_NAMES.length;

export function createEmployees(count: number): Employee[] {
  if (count > MAX_NAME_PAIRS) {
    throw new Error(`createEmployees(${count}) exceeds the ${MAX_NAME_PAIRS} unique name pairs available`);
  }

  const usedNames = new Set<string>();

  return Array.from({ length: count }, (_, i) => {
    const { firstName, lastName } = randomName(usedNames);

    return {
      firstName,
      lastName,
      email: createEmployeeEmail(firstName, lastName),
      phoneNumber: '07777777777',
      jobTitle: JOB_TITLES[i % JOB_TITLES.length],
    };
  });
}
