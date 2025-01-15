export function toArray<T = any>(obj: T): T[] {
	if (Array.isArray(obj)) {
		return obj;
	} else {
		return [obj];
	}
}
