# log-command

This small script facilitates obtaining a log when running a command.

It's a wrapper around `child_process.spawn` that pipes the commands `stdout` and `stderr` to a file.

## How to use it

```javascript
import runCommand from 'log-command';

const child = runCommand('rm', ['-i', '*.txt'], { logPrefix: 'test' });

child.on('exit', ({ code, logPath, removeLog }) => {
  if (code !== 0) {
    console.error(`Log saved in ${logPath}`);
  } else {
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