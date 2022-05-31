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

| Option | type | Description |
|---|---|---|
| `logPath` | string | Path to the generated log file. |
| `logPrefix` | string | Convenience option to `logPath` (ignored if `logPath` exists). The path to the log will be `/tmp/${logPath}/${Date.now}. defaults to `log`. |
| `env` | object | Environment variables for the process (it already includes process.env). |
