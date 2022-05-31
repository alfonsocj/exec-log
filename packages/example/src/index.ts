import { exec } from 'child_process';
import runCommand from 'log-command';
import { join } from 'path';

const filterOutDebugLogs = (str: string) => str.replace(/[\n\r]{0,1}\[debug\].*\[\/debug\][\n\r]{0,1}/s, '');

const fileToRun = join(__dirname, 'runExample.ts');

const child = runCommand('yarn', ['ts-node', fileToRun], { logPrefix: 'test', filterStdOut: filterOutDebugLogs });

child.on('exit', ({ code, logPath, removeLog }) => {
  if (code !== 0) {
    console.error(`Log saved in ${logPath}`);
    exec(`open -R ${logPath}`);
  } else {
    void removeLog();
  }
});