# log-exec

This small script facilitates obtaining a log when running a command.

It's a wrapper around `child_process.spawn` that pipes the commands `stdout` and `stderr` to a file.

## How to use it

```javascript
import runCommand from 'log-exec';

const child = runCommand({ logPrefix: 'test', command: 'rm -i *.txt' });

child.on('exit', ({ code, logPath, removeLog }) => {
  if (code !== 0) {
    // log path is /tmp/{logPrefix}-{unixTime}
    console.log(`Log saved in ${logPath}`);
  } else {
    // removing log since the command exited without errors
    void removeLog();
  }
});
```

## Options

| Option      | Description                 |
| ----------- | --------------------------- |
| `logPrefix` | Prefix for the log filename |
| `command`   | Command to execute          |
| `args`      | Command arguments           |