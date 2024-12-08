import EventEmitter = require('events');
import {SpecialKeys, newSpecialKeyRegister} from './AsciiMap.js';
import {EVENT} from './Stdin.js';
import {ASCII} from './AsciiMap.js';

export type KeyInput = {
	key?: Key;
	notKey?: Key[];
	input?: string;
	notInput?: string[];
};

export type KeyMap = {
	[eventName: string]: KeyInput | KeyInput[];
};

export type Key = keyof SpecialKeys;

export default class Keyboard {
	private Emitter: EventEmitter;
	private StateEmitter: EventEmitter;
	private state: {
		chars: string;
		specialKeys: SpecialKeys;
		ctrlKeys: string;
		listening: boolean;
		event: string | null;
		eventSet: boolean;
		eventEmitted: boolean;
		registerSize: number;
		isTextInput: boolean;
	};

	public static StateUpdate = 'STATE_UPDATE';

	constructor() {
		this.Emitter = new EventEmitter();
		this.StateEmitter = new EventEmitter();
		this.Emitter.setMaxListeners(Infinity);
		this.state = {
			chars: '',
			specialKeys: newSpecialKeyRegister(),
			ctrlKeys: '',
			listening: false,
			event: null,
			eventSet: false,
			eventEmitted: false,
			registerSize: 2,
			isTextInput: false,
		};
	}

	public getChars = (): string => {
		return this.state.chars;
	};

	private clearChars = (): void => {
		this.state.chars = '';
	};

	public setMaxChars = (n: number): void => {
		this.state.registerSize = Math.max(1, n);
	};

	private setSpecialKeys = (mapping: SpecialKeys): void => {
		this.state.specialKeys = mapping;
	};

	public getEvent = (): string | null => {
		return this.state.event;
	};

	private setEvent = (event: string | number): void => {
		// Only allow one event to be set per EVENT.keypress event
		if (this.state.eventSet) return;
		this.state.eventSet = true;

		this.state.event = typeof event === 'string' ? event : String(event);
		this.state.chars = '';
		this.StateEmitter.emit(Keyboard.StateUpdate, this.state);
	};

	private appendChar = (c: string): void => {
		if (c === '') return;

		if (this.state.chars.length >= this.state.registerSize) {
			this.state.chars = '';
		}

		this.state.chars += c;

		this.StateEmitter.emit(Keyboard.StateUpdate, this.state);
	};

	public emitEvent = (event: string | null, stdin: string): void => {
		if (this.state.eventEmitted || event === null) return;

		this.Emitter.emit(event, stdin);
		this.state.eventEmitted = true;
	};

	public setTextInputMode = (b: boolean) => {
		this.state.isTextInput = b;
	};

	public respondToKeypress(cb: (stdin: string) => unknown): void {
		this.Emitter.once(EVENT.keypress, cb);
	}

	public handleStdin = (buffer: Buffer): void => {
		if (buffer[0] === undefined) return;
		const char = buffer.toString('utf-8');

		this.state.eventSet = false;
		this.state.eventEmitted = false;
		this.state.event = null;
		this.state.ctrlKeys = '';

		// Handle sigint before all else
		if (char === ASCII.sigint) {
			this.Emitter.removeAllListeners();
			process.stdin.pause();
			process.exit();
		}

		let dirtySpecKey = false;
		const match = (code: string) => {
			if (char === code) {
				dirtySpecKey = true;
			}
			return char === code;
		};
		const map = {
			backspace: match(ASCII.backspace),
			delete: match(ASCII.delete),
			esc: match(ASCII.esc),
			insert: match(ASCII.insert),
			return: match(ASCII.return),
			tab: match(ASCII.tab),
			up: match(ASCII.up),
			down: match(ASCII.down),
			right: match(ASCII.right),
			left: match(ASCII.left),
			f1: match(ASCII.f1),
			f2: match(ASCII.f2),
			f3: match(ASCII.f3),
			f4: match(ASCII.f4),
			f5: match(ASCII.f5),
			f6: match(ASCII.f6),
			f7: match(ASCII.f7),
			f8: match(ASCII.f8),
			f9: match(ASCII.f9),
			f10: match(ASCII.f10),
			f11: match(ASCII.f11),
			f12: match(ASCII.f12),

			// ctrl will not be triggered on its own.  It can only read ctrl + letter
			ctrl: false,
		};

		this.setSpecialKeys(map);

		// Special key press always clears char register
		dirtySpecKey && this.clearChars();

		// Ctrl + lowercase letter.  Unfortunately, I don't believe there is any way
		// within Nodejs to recognize other combinations of special keys.
		const charCode = char.charCodeAt(0);
		if (charCode >= 1 && charCode <= 26) {
			const letter = String.fromCharCode(charCode + 96);
			this.state.ctrlKeys = letter;
			this.state.chars = '';

			map.ctrl = true;
			dirtySpecKey = true;
			this.setSpecialKeys(map);
		} else {
			if (!dirtySpecKey) {
				char && this.appendChar(char);
			} else {
				this.clearChars();
			}
		}

		// Notify useKeymap hooks
		this.Emitter.emit(EVENT.keypress, char);
	};

	public pause = (): void => {
		this.Emitter.removeAllListeners(EVENT.keypress);
		this.Emitter.removeAllListeners(Keyboard.StateUpdate);
	};

	public addComponentListener = (
		processKeymapHandler: (stdin: string) => unknown,
	): void => {
		this.Emitter.on(EVENT.keypress, processKeymapHandler);
	};

	public removeComponentListener = (
		processKeymapHandler: (stdin: string) => unknown,
	): void => {
		this.Emitter.off(EVENT.keypress, processKeymapHandler);
	};

	public subscribeComponentToStateChanges = (
		cb: (s: Keyboard['state']) => unknown,
	): void => {
		this.StateEmitter.on(Keyboard.StateUpdate, cb);
	};

	public unsubscribeComponentToStateChanges = (
		cb: (s: Keyboard['state']) => unknown,
	): void => {
		this.StateEmitter.off(Keyboard.StateUpdate, cb);
	};

	public addEventListener = (
		event: string,
		handler: (stdin: string) => unknown,
	): void => {
		this.Emitter.on(event, handler);
	};

	public removeEventListener = (
		event: string,
		handler: (stdin: string) => unknown,
	): void => {
		this.Emitter.off(event, handler);
	};

	public processConfig = (config: KeyMap): void => {
		if (this.state.eventSet) return;

		/* Is there a non alphanumeric keypress?  We need to know so that bindings
		 * such as just "f" should not trigger ctrl + f for example. */
		const hasNonAlphaKey = Object.values(this.state.specialKeys).some(b => b);

		for (const event in config) {
			const binding = config[event] as KeyInput | KeyInput[];

			let match = false;
			if (Array.isArray(binding)) {
				match = binding.some(b => this.checkMatch(b, hasNonAlphaKey));
			} else {
				match = this.checkMatch(binding, hasNonAlphaKey);
			}

			if (match) this.setEvent(event);
		}
	};

	private checkMatch = (
		binding: KeyInput,
		hasNonAlphakey: boolean,
	): boolean => {
		// Empty object triggers any key press
		if (!Object.keys(binding).length) {
			return true;
		}

		// notKey and notInput match anything that is not in their array of values
		if ((binding.notKey || binding.notInput) && this.checkNotMatch(binding)) {
			return true;
		}

		// key + char input
		if (binding.key && binding.input) {
			if (binding.key === 'ctrl') {
				return this.state.ctrlKeys === binding.input;
			}
			// This should always evaluate to false
			return (
				this.state.specialKeys[binding.key] &&
				this.state.chars === binding.input
			);
		}

		// key only
		if (binding.key && !binding.input) {
			return this.state.specialKeys[binding.key];
		}

		// char input only
		if (!binding.key && binding.input) {
			if (hasNonAlphakey) return false;

			return this.state.chars === binding.input;
		}

		return false;
	};

	private checkNotMatch = (binding: KeyInput): boolean => {
		const notKey = binding.notKey || [];
		const notInput = binding.notInput || [];

		for (const k of notKey) {
			if (this.state.specialKeys[k]) {
				return false;
			}
		}

		for (const s of notInput) {
			if (this.state.chars === s) {
				return false;
			}
		}

		return true;
	};
}
