// Remove symbol keyof an object and converts numbers to strings
export type KeyOf<T extends object> = T extends object
	? PropertyKeyToString<keyof T>
	: never;

export type PropertyKeyToString<T> = T extends number
	? `${T}`
	: T extends string
		? T
		: never;
