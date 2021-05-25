/**
 * Root file mock.
 */
import inquirer from 'inquirer';
import chalk from 'chalk';
import * as fs from 'fs';
import { promisify } from 'util';

const readdir = promisify(fs.readdir);
const writeFile = promisify(fs.writeFile);

/**
 * Compiles the root code.
 */
export function root(
  timeout: number,
  additional: string[],
  mockRedis: boolean
) {
  // TEMPLATE START //
  return `
const { setupStrapi } = require('./helpers/strapi')
const knexCleaner = require('knex-cleaner')

jest.setTimeout(${timeout})

const sleep = (milliseconds) => {
return new Promise((resolve) => setTimeout(resolve, milliseconds))
}

/** this code is called once before any test is called */
beforeAll(async (done) => {
    ${
      mockRedis
        ? `jest.mock('redis', () => jest.requireActual('redis-mock'))`
        : ''
    }
    await setupStrapi() // singleton so it can be called many times
    done()
})

/** this code is called once before all the tested are finished */
afterAll(async (done) => {
    await knexCleaner.clean(strapi.connections.default, { mode: 'delete' }) // clear database after all tests
    await strapi.server.close() // close the server

    await sleep(1000)

    done()
})

describe('Strapi in general', () => {
    it('strapi is defined', () => {
        expect(strapi).toBeDefined()
    })
})

${additional.map((s) => `require('./${s}')`).join('\n')}
`;
  // TEMPLATE END //
}

/**
 * The generator.
 */
export default async function RootFile() {
  const { timeout, redis } = await inquirer.prompt([
    {
      type: 'number',
      default: 60000,
      name: 'timeout',
      message: 'Jest test timeout',
    },
    {
      type: 'confirm',
      default: true,
      message: 'Add redis database mocking?',
      name: 'redis',
    },
  ]);
  const list = await readdir('.');
  let additional: string[] = [];
  if (list.length > 0) {
    const answer = await inquirer.prompt([
      {
        type: 'checkbox',
        name: 'additional',
        message:
          'The generator has detected additional entries in this directory, select which ones you want to add as a require at the end of the file:',
        choices: list.map((name) => ({ name })),
      },
    ]);
    additional = answer.additional;
  }
  const { fileName } = await inquirer.prompt([
    {
      type: 'input',
      name: 'fileName',
      message: 'Confirm the file name to write to:',
      default: 'app.test.js',
      validate: function fileNameValidator(value: string) {
        const match = value.match(/\//);
        if (match) {
          return 'Please enter a valid file name!';
        }
        return true;
      },
    },
  ]);
  await writeFile(fileName, root(timeout, additional, redis));
  console.log(chalk.greenBright`🚀 Done! Your file is ready at ${fileName}!`)
}
