import runCommand from 'log-command';

const command = runCommand({ logPrefix: 'test', command: 'rm -i *.txt' });

command.on('exit', ({ code, logPath, removeLog }) => {
  if (code !== 0) {
    console.error(`Log saved in ${logPath}`);
  } else {
    void removeLog();
  }
});