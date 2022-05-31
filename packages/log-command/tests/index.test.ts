import runCommand from '../src';

describe('runCommand', () => {
  // TODO: mock spawn, mock createWriteStream

  it('runs', () => {
    runCommand('nonexistentcommand', [], { logPrefix: 'test' });
    // TODO expect what's sent from mocked spawn stdout + stderr is the same as what's sent
    // to the write stream from mocked createWriteStream
    expect(true);
  });
});
