import EventEmitter from 'node:events';
import {spy} from 'sinon';

// Fake process.stdout
type FakeStdout = {
	get: () => string;
} & NodeJS.WriteStream;

const createStdout = (columns?: number): FakeStdout => {
	const stdout = new EventEmitter() as unknown as FakeStdout;
	stdout.columns = columns ?? 100;

	const write = spy();
	stdout.write = write;

	// If there is no last call, thats because outputs are hashed and compared
	// between renders and output only writes if the hashes aren't matching. For tests
	// that expect '' as the last call arg passed to stdout.write, there will be
	// no last call arg since the app hashes '' as the starting output.
	stdout.get = () => write.lastCall?.args?.[0] ?? ('' as string);

	return stdout;
};

export default createStdout;
