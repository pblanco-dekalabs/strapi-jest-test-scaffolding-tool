#!/usr/bin/node
/**
 * Strapi test generator for Jest.
 *
 * Scaffolds out tests with an ease.
 *
 * @author sigmasoldi3r
 * @date May the 17th, 2021
 */
import inquirer from 'inquirer';
import { program } from 'commander';
const packageInfo = require('../package.json');
import chalk from 'chalk';
import { ExitCodes } from './ExitCodes';
import endpoint from './generators/Endpoint';
import rootFile from './generators/RootFile';

/**
 * The main function.
 */
async function main() {
  program.version(packageInfo.version);
  program.parse(process.argv);
  const { kind } = await inquirer.prompt([
    {
      type: 'list',
      name: 'kind',
      message: `What kind of test do you want to create?`,
      default: 'Endpoint',
      choices: ['Endpoint', 'Mock root file', 'Mock Helpers', 'Version', 'Middleware', 'Extensions', 'Plugins', 'Providers', 'Hooks', 'Components'],
    },
  ]);
  if (kind === 'Endpoint') {
    await endpoint();
    return ExitCodes.SUCCESS;
  } else if (kind === 'Mock root file') {
    await rootFile();
    return ExitCodes.SUCCESS;
  }
  console.log(chalk.red`${kind} is not supported yet`);
  return ExitCodes.UNSUPPORTED_GENERATOR;
}
main()
  .then((code) => {
    if (code !== ExitCodes.SUCCESS) {
      process.exit(code);
    }
  })
  .catch((err) => {
    console.log(chalk.red`FATAL! ${err}\n`, err);
    process.exit(err.exitCode || ExitCodes.UNKNOWN_REASON);
  });
