import { spawn } from 'child_process';
import { createWriteStream, rm } from 'fs';
import { EventEmitter, Transform } from 'stream';
import { promisify } from 'util';

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
  filter?: (chunk: string) => boolean;
};

function runCommand(
  command: string,
  args: string[] = [],
  {
    logPath: userLogPath,
    logPrefix = 'log',
    env = {},
    filter = () => true,
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
  
  const filterStream = new Transform({
    transform: (chunk, _encoding, next) => {
      console.log(chunk);
      // console.error(`** chunk ${chunk.toString()} filter ${filter(chunk.toString())}**`);
      if (filter(chunk.toString())) {
        return next(null, chunk);
      }
      next();
    },
  });

  child.stdout.pipe(logStream, { end: false });
  child.stdout.pipe(filterStream, { end: false }).pipe(process.stdout, { end: false });
  
  child.stderr.pipe(logStream, { end: false });
  child.stderr.pipe(filterStream, { end: false }).pipe(process.stderr, { end: false });

  const removeLog = () => promisify(rm)(logPath);

  child.once('exit', (code) => {
    emitter.emit('exit', { code, logPath, removeLog });
  });

  return emitter;
}

export default runCommand;
