import { spawn } from 'child_process';
import { createWriteStream, rm } from 'fs';
import { EventEmitter } from 'stream';
import { promisify } from 'util';

type ExitOptions = {
  code: number
  logPath: string
  removeLog: () => Promise<void>
}
interface Emitter extends EventEmitter {
  // eslint-disable-next-line no-unused-vars
  emit(eventName: 'exit', options: ExitOptions): boolean;
  // eslint-disable-next-line no-unused-vars
  on(event: 'exit', listener: (options: ExitOptions) => void): this;
  // eslint-disable-next-line no-unused-vars
  once(event: 'exit', listener: (options: ExitOptions) => void): this;
}

type CommandOptions = {
  logPrefix?: string
  env?: Record<string, string>
}

function runCommand(
  command: string,
  args = [],
  { logPrefix = 'log', env = {} }: CommandOptions = {},
) {
  const emitter: Emitter = new EventEmitter();
  const logPath = `/tmp/${logPrefix}-${Date.now()}`;
  const logStream = createWriteStream(logPath);

  const [cmd, ...cmdArgs] = command.split(' ');

  const child = spawn(cmd, [...cmdArgs, ...args], {
    env: { ...process.env, ...env, FORCE_COLOR: 'true' },
    shell: '/bin/bash',
    stdio: ['inherit'],
  });

  child.stdout.pipe(process.stdout, { end: false });
  child.stdout.pipe(logStream, { end: false });

  child.stderr.pipe(process.stderr, { end: false });
  child.stderr.pipe(logStream, { end: false });

  const removeLog = () => promisify(rm)(logPath);

  child.once('exit', (code) => {
    emitter.emit('exit', { code, logPath, removeLog });
  });

  return emitter;
}

export default runCommand;
