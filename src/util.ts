import assert from 'assert';

export type SetState<T> = React.SetStateAction<React.Dispatch<T>>;

export const deepEqual = (a: any, b: any) => {
	try {
		assert.deepStrictEqual(a, b);
		return true;
	} catch {
		return false;
	}
};
