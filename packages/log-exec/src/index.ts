import { spawn } from 'child_process'
import { createWriteStream, rm } from 'fs'
import { EventEmitter } from 'stream'
import { promisify } from 'util'

type InitParams = {
    logPrefix?: string
    command: string
    args?: string[]
}

type ExitOptions = {
  code: number;
  logPath: string;
  removeLog: () => Promise<void>;
}

type Emitter = EventEmitter & {
    emit(eventName: 'exit', options: ExitOptions);
    on(
        event: 'exit',
        listener: (options: ExitOptions) => void
    )
}

function runCommand({
    logPrefix = 'log',
    command: rawCommand,
    args: extraArgs = [],
}: InitParams) {
    const emitter: Emitter = new EventEmitter()
    const logPath = `/tmp/${logPrefix}-${Date.now()}`
    const logStream = createWriteStream(logPath)

    const [command, ...args] = rawCommand.split(' ')

    const child = spawn(command, [...args, ...extraArgs], {
        env: { ...process.env, FORCE_COLOR: 'true' },
        shell: '/bin/bash',
        stdio: ['inherit'],
    })

    child.stdout.pipe(process.stdout, { end: false })
    child.stdout.pipe(logStream, { end: false })

    child.stderr.pipe(process.stderr, { end: false })
    child.stderr.pipe(logStream, { end: false })

    const removeLog = () => promisify(rm)(logPath)

    child.once('exit', (code) => {
        emitter.emit('exit', {code, logPath, removeLog})
    });

    return emitter
}

export default runCommand
