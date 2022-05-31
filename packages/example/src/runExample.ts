import { exit } from "process";

export function main() {
  console.log('Hello');
  console.log('[debug] here is some debug message');
  console.log('World');
  exit(0);
}

main();