import { spawn } from 'child_process';
import { createWriteStream, rm } from 'fs';
import { EventEmitter } from 'stream';
import { promisify } from 'util';
import { createFilterStream } from './filterStream';

type ExitOptions = {
  code: number | null;
  logPath: string;
  removeLog: () => Promise<void>;
};

interface Emitter extends EventEmitter {
  emit(eventName: 'exit', options: ExitOptions): boolean;
  on(event: 'exit', listener: (options: ExitOptions) => void): this;
  once(event: 'exit', listener: (options: ExitOptions) => void): this;
}

type CommandOptions = {
  logPath?: string;
  logPrefix?: string;
  env?: Record<string, string>;
  filterStdOut?: (chunk: string) => string;
  filterStdErr?: (chunk: string) => string;
};

function runCommand(
  command: string,
  args: string[] = [],
  {
    logPath: userLogPath,
    logPrefix = 'log',
    env = {},
    filterStdOut,
    filterStdErr,
  }: CommandOptions = {},
) {
  const emitter: Emitter = new EventEmitter();
  const logPath = userLogPath ?? `/tmp/${logPrefix}-${Date.now()}`;
  const logStream = createWriteStream(logPath);

  const [cmd, ...cmdArgs] = command.split(' ');

  const child = spawn(cmd, [...cmdArgs, ...args], {
    env: { ...process.env, ...env, FORCE_COLOR: 'true' },
    shell: '/bin/bash',
    stdio: ['inherit', 'pipe', 'pipe'],
  });

  // StdOut
  child.stdout.pipe(logStream, { end: false });
  if (filterStdOut) {
    const filterStdOutStream = createFilterStream(filterStdOut);
    child.stdout.pipe(filterStdOutStream, { end: false }).pipe(process.stdout, { end: false });
  } else {
    child.stdout.pipe(process.stdout, { end: false });
  }

  // StdErr
  child.stderr.pipe(logStream, { end: false });
  if (filterStdErr) {
    const filterStdErrStream = createFilterStream(filterStdErr);
    child.stderr.pipe(filterStdErrStream, { end: false }).pipe(process.stderr, { end: false });
  } else {
    child.stderr.pipe(process.stderr, { end: false });
  }

  const removeLog = () => promisify(rm)(logPath);

  child.once('exit', (code) => {
    emitter.emit('exit', { code, logPath, removeLog });
  });

  return emitter;
}

export default runCommand;
