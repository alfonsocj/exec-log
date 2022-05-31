import chalk from 'chalk';
import { exit } from 'process';

export function main() {
  console.log('Hello');
  console.log(chalk.dim('[debug] here is some debug message [/debug]'));
  console.log('World');
  exit(1);
}

main();
