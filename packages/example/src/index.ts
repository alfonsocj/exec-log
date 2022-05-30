import runCommand from 'log-command';

const command = runCommand('rm', ['-i', '*.txt'], { logPrefix: 'test' });

command.on('exit', ({ code, logPath, removeLog }) => {
  if (code !== 0) {
    console.error(`Log saved in ${logPath}`);
  } else {
    void removeLog();
  }
});