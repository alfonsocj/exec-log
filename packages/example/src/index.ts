import runCommand from 'log-command';

const child = runCommand('rm', ['-i', '*.txt'], { logPrefix: 'test' });

child.on('exit', ({ code, logPath, removeLog }) => {
  if (code !== 0) {
    console.error(`Log saved in ${logPath}`);
  } else {
    void removeLog();
  }
});