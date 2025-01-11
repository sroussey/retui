import {describe, it, expect} from 'vitest';
import {KeyMap} from '../../src/index.js';
import {DefaultStdin} from '../../src/stdin/Stdin.js';
import {ASCII} from '../../src/stdin/AsciiMap.js';

const ctrl_plus_letters = {
	ctrlA: {key: 'ctrl', input: 'a'},
	ctrlB: {key: 'ctrl', input: 'b'},
	ctrlC: {key: 'ctrl', input: 'c'},
	ctrlD: {key: 'ctrl', input: 'd'},
	ctrlE: {key: 'ctrl', input: 'e'},
	ctrlF: {key: 'ctrl', input: 'f'},
	ctrlG: {key: 'ctrl', input: 'g'},
	ctrlH: {key: 'ctrl', input: 'h'},
	ctrlI: {key: 'ctrl', input: 'i'},
	ctrlJ: {key: 'ctrl', input: 'j'},
	ctrlK: {key: 'ctrl', input: 'k'},
	ctrlL: {key: 'ctrl', input: 'l'},
	ctrlM: {key: 'ctrl', input: 'm'},
	ctrlN: {key: 'ctrl', input: 'n'},
	ctrlO: {key: 'ctrl', input: 'o'},
	ctrlP: {key: 'ctrl', input: 'p'},
	ctrlQ: {key: 'ctrl', input: 'q'},
	ctrlR: {key: 'ctrl', input: 'r'},
	ctrlS: {key: 'ctrl', input: 's'},
	ctrlT: {key: 'ctrl', input: 't'},
	ctrlU: {key: 'ctrl', input: 'u'},
	ctrlV: {key: 'ctrl', input: 'v'},
	ctrlW: {key: 'ctrl', input: 'w'},
	ctrlX: {key: 'ctrl', input: 'x'},
	ctrlY: {key: 'ctrl', input: 'y'},
	ctrlZ: {key: 'ctrl', input: 'z'},
} satisfies KeyMap;

// The Stdin class encodes data into a hex string
const hex = (s: string) => Buffer.from(s).toString('hex');

describe('ctrl + lowercase a - z', () => {
	it(`ctrl + a`, () => {
		DefaultStdin.handleStdin(hex('\u0001'));
		DefaultStdin.Keyboard.processConfig(ctrl_plus_letters);
		expect(DefaultStdin.Keyboard.getEvent()).toBe('ctrlA');
	});
	it('ctrl + b', () => {
		DefaultStdin.handleStdin(hex('\u0002'));
		DefaultStdin.Keyboard.processConfig(ctrl_plus_letters);
		expect(DefaultStdin.Keyboard.getEvent()).toBe('ctrlB');
	});
	// ------ This will trigger a SIGINT -----
	// it("ctrl + c", () => {
	//     DefaultStdin.handleStdin(hex("\u0003"));
	//     DefaultStdin.Keyboard.processConfig(ctrl_plus_letters);
	//     console.log(DefaultStdin.Keyboard.getEvent());
	//     expect(DefaultStdin.Keyboard.getEvent()).toBe("ctrlC");
	// });
	it('ctrl + d', () => {
		DefaultStdin.handleStdin(hex('\u0004'));
		DefaultStdin.Keyboard.processConfig(ctrl_plus_letters);
		expect(DefaultStdin.Keyboard.getEvent()).toBe('ctrlD');
	});
	it('ctrl + e', () => {
		DefaultStdin.handleStdin(hex('\u0005'));
		DefaultStdin.Keyboard.processConfig(ctrl_plus_letters);
		expect(DefaultStdin.Keyboard.getEvent()).toBe('ctrlE');
	});
	it('ctrl + f', () => {
		DefaultStdin.handleStdin(hex('\u0006'));
		DefaultStdin.Keyboard.processConfig(ctrl_plus_letters);
		expect(DefaultStdin.Keyboard.getEvent()).toBe('ctrlF');
	});
	it('ctrl + g', () => {
		DefaultStdin.handleStdin(hex('\u0007'));
		DefaultStdin.Keyboard.processConfig(ctrl_plus_letters);
		expect(DefaultStdin.Keyboard.getEvent()).toBe('ctrlG');
	});
	it('ctrl + h', () => {
		DefaultStdin.handleStdin(hex('\u0008'));
		DefaultStdin.Keyboard.processConfig(ctrl_plus_letters);
		expect(DefaultStdin.Keyboard.getEvent()).toBe('ctrlH');
	});
	it('ctrl + i', () => {
		DefaultStdin.handleStdin(hex('\u0009'));
		DefaultStdin.Keyboard.processConfig(ctrl_plus_letters);
		expect(DefaultStdin.Keyboard.getEvent()).toBe('ctrlI');
	});
	it('ctrl + j', () => {
		DefaultStdin.handleStdin(hex('\u000A'));
		DefaultStdin.Keyboard.processConfig(ctrl_plus_letters);
		expect(DefaultStdin.Keyboard.getEvent()).toBe('ctrlJ');
	});
	it('ctrl + k', () => {
		DefaultStdin.handleStdin(hex('\u000B'));
		DefaultStdin.Keyboard.processConfig(ctrl_plus_letters);
		expect(DefaultStdin.Keyboard.getEvent()).toBe('ctrlK');
	});
	it('ctrl + l', () => {
		DefaultStdin.handleStdin(hex('\u000C'));
		DefaultStdin.Keyboard.processConfig(ctrl_plus_letters);
		expect(DefaultStdin.Keyboard.getEvent()).toBe('ctrlL');
	});
	it('ctrl + m', () => {
		DefaultStdin.handleStdin(hex('\u000D'));
		DefaultStdin.Keyboard.processConfig(ctrl_plus_letters);
		expect(DefaultStdin.Keyboard.getEvent()).toBe('ctrlM');
	});
	it('ctrl + n', () => {
		DefaultStdin.handleStdin(hex('\u000E'));
		DefaultStdin.Keyboard.processConfig(ctrl_plus_letters);
		expect(DefaultStdin.Keyboard.getEvent()).toBe('ctrlN');
	});
	it('ctrl + o', () => {
		DefaultStdin.handleStdin(hex('\u000F'));
		DefaultStdin.Keyboard.processConfig(ctrl_plus_letters);
		expect(DefaultStdin.Keyboard.getEvent()).toBe('ctrlO');
	});
	it('ctrl + p', () => {
		DefaultStdin.handleStdin(hex('\u0010'));
		DefaultStdin.Keyboard.processConfig(ctrl_plus_letters);
		expect(DefaultStdin.Keyboard.getEvent()).toBe('ctrlP');
	});
	it('ctrl + q', () => {
		DefaultStdin.handleStdin(hex('\u0011'));
		DefaultStdin.Keyboard.processConfig(ctrl_plus_letters);
		expect(DefaultStdin.Keyboard.getEvent()).toBe('ctrlQ');
	});
	it('ctrl + r', () => {
		DefaultStdin.handleStdin(hex('\u0012'));
		DefaultStdin.Keyboard.processConfig(ctrl_plus_letters);
		expect(DefaultStdin.Keyboard.getEvent()).toBe('ctrlR');
	});
	it('ctrl + s', () => {
		DefaultStdin.handleStdin(hex('\u0013'));
		DefaultStdin.Keyboard.processConfig(ctrl_plus_letters);
		expect(DefaultStdin.Keyboard.getEvent()).toBe('ctrlS');
	});
	it('ctrl + t', () => {
		DefaultStdin.handleStdin(hex('\u0014'));
		DefaultStdin.Keyboard.processConfig(ctrl_plus_letters);
		expect(DefaultStdin.Keyboard.getEvent()).toBe('ctrlT');
	});
	it('ctrl + u', () => {
		DefaultStdin.handleStdin(hex('\u0015'));
		DefaultStdin.Keyboard.processConfig(ctrl_plus_letters);
		expect(DefaultStdin.Keyboard.getEvent()).toBe('ctrlU');
	});
	it('ctrl + v', () => {
		DefaultStdin.handleStdin(hex('\u0016'));
		DefaultStdin.Keyboard.processConfig(ctrl_plus_letters);
		expect(DefaultStdin.Keyboard.getEvent()).toBe('ctrlV');
	});
	it('ctrl + w', () => {
		DefaultStdin.handleStdin(hex('\u0017'));
		DefaultStdin.Keyboard.processConfig(ctrl_plus_letters);
		expect(DefaultStdin.Keyboard.getEvent()).toBe('ctrlW');
	});
	it('ctrl + x', () => {
		DefaultStdin.handleStdin(hex('\u0018'));
		DefaultStdin.Keyboard.processConfig(ctrl_plus_letters);
		expect(DefaultStdin.Keyboard.getEvent()).toBe('ctrlX');
	});
	it('ctrl + y', () => {
		DefaultStdin.handleStdin(hex('\u0019'));
		DefaultStdin.Keyboard.processConfig(ctrl_plus_letters);
		expect(DefaultStdin.Keyboard.getEvent()).toBe('ctrlY');
	});
	it('ctrl + z', () => {
		DefaultStdin.handleStdin(hex('\u001A'));
		DefaultStdin.Keyboard.processConfig(ctrl_plus_letters);
		expect(DefaultStdin.Keyboard.getEvent()).toBe('ctrlZ');
	});
});

describe('special key presses clear char register', () => {
	it('backspace', () => {
		DefaultStdin.handleStdin(hex('a'));
		DefaultStdin.handleStdin(hex(ASCII.backspace));
		expect(DefaultStdin.Keyboard.getChars()).toBe('');
	});
	it('delete', () => {
		DefaultStdin.handleStdin(hex('a'));
		DefaultStdin.handleStdin(hex(ASCII.delete));
		expect(DefaultStdin.Keyboard.getChars()).toBe('');
	});
	it('esc', () => {
		DefaultStdin.handleStdin(hex('a'));
		DefaultStdin.handleStdin(hex(ASCII.esc));
		expect(DefaultStdin.Keyboard.getChars()).toBe('');
	});
	it('insert', () => {
		DefaultStdin.handleStdin(hex('a'));
		DefaultStdin.handleStdin(hex(ASCII.insert));
		expect(DefaultStdin.Keyboard.getChars()).toBe('');
	});
	it('return', () => {
		DefaultStdin.handleStdin(hex('a'));
		DefaultStdin.handleStdin(hex(ASCII.return));
		expect(DefaultStdin.Keyboard.getChars()).toBe('');
	});
	it('tab', () => {
		DefaultStdin.handleStdin(hex('a'));
		DefaultStdin.handleStdin(hex(ASCII.tab));
		expect(DefaultStdin.Keyboard.getChars()).toBe('');
	});
	it('up', () => {
		DefaultStdin.handleStdin(hex('a'));
		DefaultStdin.handleStdin(hex(ASCII.up));
		expect(DefaultStdin.Keyboard.getChars()).toBe('');
	});
	it('down', () => {
		DefaultStdin.handleStdin(hex('a'));
		DefaultStdin.handleStdin(hex(ASCII.down));
		expect(DefaultStdin.Keyboard.getChars()).toBe('');
	});
	it('left', () => {
		DefaultStdin.handleStdin(hex('a'));
		DefaultStdin.handleStdin(hex(ASCII.left));
		expect(DefaultStdin.Keyboard.getChars()).toBe('');
	});
	it('right', () => {
		DefaultStdin.handleStdin(hex('a'));
		DefaultStdin.handleStdin(hex(ASCII.right));
		expect(DefaultStdin.Keyboard.getChars()).toBe('');
	});
	it('f1', () => {
		DefaultStdin.handleStdin(hex('a'));
		DefaultStdin.handleStdin(hex(ASCII.f1));
		expect(DefaultStdin.Keyboard.getChars()).toBe('');
	});
	it('f2', () => {
		DefaultStdin.handleStdin(hex('a'));
		DefaultStdin.handleStdin(hex(ASCII.f2));
		expect(DefaultStdin.Keyboard.getChars()).toBe('');
	});
	it('f3', () => {
		DefaultStdin.handleStdin(hex('a'));
		DefaultStdin.handleStdin(hex(ASCII.f3));
		expect(DefaultStdin.Keyboard.getChars()).toBe('');
	});
	it('f4', () => {
		DefaultStdin.handleStdin(hex('a'));
		DefaultStdin.handleStdin(hex(ASCII.f4));
		expect(DefaultStdin.Keyboard.getChars()).toBe('');
	});
	it('f5', () => {
		DefaultStdin.handleStdin(hex('a'));
		DefaultStdin.handleStdin(hex(ASCII.f5));
		expect(DefaultStdin.Keyboard.getChars()).toBe('');
	});
	it('f6', () => {
		DefaultStdin.handleStdin(hex('a'));
		DefaultStdin.handleStdin(hex(ASCII.f6));
		expect(DefaultStdin.Keyboard.getChars()).toBe('');
	});
	it('f7', () => {
		DefaultStdin.handleStdin(hex('a'));
		DefaultStdin.handleStdin(hex(ASCII.f7));
		expect(DefaultStdin.Keyboard.getChars()).toBe('');
	});
	it('f8', () => {
		DefaultStdin.handleStdin(hex('a'));
		DefaultStdin.handleStdin(hex(ASCII.f8));
		expect(DefaultStdin.Keyboard.getChars()).toBe('');
	});
	it('f9', () => {
		DefaultStdin.handleStdin(hex('a'));
		DefaultStdin.handleStdin(hex(ASCII.f9));
		expect(DefaultStdin.Keyboard.getChars()).toBe('');
	});
	it('f10', () => {
		DefaultStdin.handleStdin(hex('a'));
		DefaultStdin.handleStdin(hex(ASCII.f10));
		expect(DefaultStdin.Keyboard.getChars()).toBe('');
	});
	it('f11', () => {
		DefaultStdin.handleStdin(hex('a'));
		DefaultStdin.handleStdin(hex(ASCII.f11));
		expect(DefaultStdin.Keyboard.getChars()).toBe('');
	});
	it('f12', () => {
		DefaultStdin.handleStdin(hex('a'));
		DefaultStdin.handleStdin(hex(ASCII.f12));
		expect(DefaultStdin.Keyboard.getChars()).toBe('');
	});
});

const foobar = {
	foo: [{input: 'f'}, {input: 'F'}, {input: '!@'}, {input: '#$'}],
	bar: [{key: 'ctrl', input: 'b'}, {input: 'bb'}, {input: '%^'}],
	baz: [{key: 'f1'}, {input: 'Ba'}],
	quz: [{input: 'qQ'}, {input: 'QQ'}],
} satisfies KeyMap;

describe('Keybinds trigger commands correctly and clear char register after', () => {
	// foo
	it("'f' triggers 'foo'", () => {
		DefaultStdin.handleStdin(hex('f'));
		DefaultStdin.Keyboard.processConfig(foobar);
		expect(DefaultStdin.Keyboard.getEvent()).toBe('foo');
	});
	it("'F' triggers 'foo'", () => {
		DefaultStdin.handleStdin(hex('F'));
		DefaultStdin.Keyboard.processConfig(foobar);
		expect(DefaultStdin.Keyboard.getEvent()).toBe('foo');
	});
	it("'!@' triggers 'foo'", () => {
		DefaultStdin.handleStdin(hex('!'));
		DefaultStdin.handleStdin(hex('@'));
		DefaultStdin.Keyboard.processConfig(foobar);
		expect(DefaultStdin.Keyboard.getEvent()).toBe('foo');
	});
	it("'#$' triggers 'foo'", () => {
		DefaultStdin.handleStdin(hex('#'));
		DefaultStdin.handleStdin(hex('$'));
		DefaultStdin.Keyboard.processConfig(foobar);
		expect(DefaultStdin.Keyboard.getEvent()).toBe('foo');
	});

	// bar
	it("'ctrl + b' triggers 'bar'", () => {
		DefaultStdin.handleStdin(hex('\u0002'));
		DefaultStdin.Keyboard.processConfig(foobar);
		expect(DefaultStdin.Keyboard.getEvent()).toBe('bar');
	});
	it("'bb' triggers 'bar'", () => {
		DefaultStdin.handleStdin(hex('b'));
		DefaultStdin.handleStdin(hex('b'));
		DefaultStdin.Keyboard.processConfig(foobar);
		expect(DefaultStdin.Keyboard.getEvent()).toBe('bar');
	});
	it("'%^' triggers 'bar'", () => {
		DefaultStdin.handleStdin(hex('%'));
		DefaultStdin.handleStdin(hex('^'));
		DefaultStdin.Keyboard.processConfig(foobar);
		expect(DefaultStdin.Keyboard.getEvent()).toBe('bar');
	});

	// baz
	it("'f1' triggers 'baz'", () => {
		DefaultStdin.handleStdin(hex(ASCII.f1));
		DefaultStdin.Keyboard.processConfig(foobar);
		expect(DefaultStdin.Keyboard.getEvent()).toBe('baz');
	});
	it("'Ba' triggers 'baz'", () => {
		DefaultStdin.handleStdin(hex('B'));
		DefaultStdin.handleStdin(hex('a'));
		DefaultStdin.Keyboard.processConfig(foobar);
		expect(DefaultStdin.Keyboard.getEvent()).toBe('baz');
	});

	// quz
	it("'qQ' triggers 'quz'", () => {
		DefaultStdin.handleStdin(hex('q'));
		DefaultStdin.handleStdin(hex('Q'));
		DefaultStdin.Keyboard.processConfig(foobar);
		expect(DefaultStdin.Keyboard.getEvent()).toBe('quz');
	});
	it("'QQ' triggers 'quz'", () => {
		DefaultStdin.handleStdin(hex('Q'));
		DefaultStdin.handleStdin(hex('Q'));
		DefaultStdin.Keyboard.processConfig(foobar);
		expect(DefaultStdin.Keyboard.getEvent()).toBe('quz');
	});
});

describe('notKey, notInput, and empty object', () => {
	it('empty object should trigger on any key press', () => {
		DefaultStdin.handleStdin(hex('a'));
		DefaultStdin.Keyboard.processConfig({press_any_key: {}});
		expect(DefaultStdin.Keyboard.getEvent()).toBe('press_any_key');
	});

	const cfg1 = {
		not_esc_or_return: {notKey: ['esc', 'return']},
		esc_or_return: [{key: 'esc'}, {key: 'return'}],
	} satisfies KeyMap;

	it('anything but escape or return triggers command', () => {
		DefaultStdin.handleStdin(hex('b'));
		DefaultStdin.Keyboard.processConfig(cfg1);
		expect(DefaultStdin.Keyboard.getEvent()).toBe('not_esc_or_return');
	});

	it('esc or return triggers command', () => {
		DefaultStdin.handleStdin(hex(ASCII.esc));
		DefaultStdin.Keyboard.processConfig(cfg1);
		expect(DefaultStdin.Keyboard.getEvent()).toBe('esc_or_return');
	});

	it("any key but 'a'", () => {
		DefaultStdin.handleStdin(hex('b'));
		DefaultStdin.Keyboard.processConfig({not_a: {notInput: ['a']}});
		expect(DefaultStdin.Keyboard.getEvent()).toBe('not_a');
	});
});
