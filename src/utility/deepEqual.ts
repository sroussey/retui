import assert from "assert";

export const deepEqual = (a: any, b: any) => {
	try {
		assert.deepStrictEqual(a, b);
		return true;
	} catch {
		return false;
	}
};
