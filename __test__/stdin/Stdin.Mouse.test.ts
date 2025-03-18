import { describe, it, expect, test } from "vitest";
import { DefaultStdin } from "../../src/stdin/Stdin.js";

describe("Stdin.Mouse.isMouseEvent", () => {
	test("true", () => {
		const result = DefaultStdin.Mouse.isMouseEvent(Buffer.from("\x1b[M"));
		expect(result).toBe(true);
	});
	test("false", () => {
		const result = DefaultStdin.Mouse.isMouseEvent(Buffer.from("\x1b[A"));
		expect(result).toBe(false);
	});
});
