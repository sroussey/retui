import {Binding, KeyMap} from '../index.js';
import {Key} from '../Stdin/Keyboard.js';
import InternalEvents from '../utility/InternalEvents.js';

type InsertEvents =
	| 'return'
	| 'left'
	| 'right'
	| 'up'
	| 'down'
	| 'backspace'
	| 'tab'
	| 'keypress';

const defaultEnter: Binding[] = [{key: 'return'}, {input: 'i'}];
const defaultExit: Binding[] = [{key: 'return'}, {key: 'esc'}];

const EVENTS: {[K in InsertEvents]: string} = {
	return: 'return',
	left: 'left',
	right: 'right',
	up: 'up',
	down: 'down',
	backspace: 'backspace',
	tab: 'tab',
	keypress: 'keypress',
} as const;

function getScopedEvents(ID: string): {[K in InsertEvents]: string} {
	return {
		return: InternalEvents.getInternalEvent('return', ID),
		left: InternalEvents.getInternalEvent('left', ID),
		right: InternalEvents.getInternalEvent('right', ID),
		up: InternalEvents.getInternalEvent('up', ID),
		down: InternalEvents.getInternalEvent('down', ID),
		backspace: InternalEvents.getInternalEvent('backspace', ID),
		tab: InternalEvents.getInternalEvent('tab', ID),
		keypress: InternalEvents.getInternalEvent('keypress', ID),
	};
}

function getDefaultInsertKeymap(): KeyMap {
	return {
		[EVENTS.return]: {key: 'return'},
		[EVENTS.left]: {key: 'left'},
		[EVENTS.right]: {key: 'right'},
		[EVENTS.up]: {key: 'up'},
		[EVENTS.down]: {key: 'down'},
		[EVENTS.backspace]: {key: 'backspace'},
		[EVENTS.tab]: {key: 'tab'},
		[EVENTS.keypress]: {
			notKey: ['return', 'left', 'right', 'up', 'down', 'backspace', 'tab'],
			notInput: [],
		},
	};
}

function getNormalKeymap(
	ID: string,
	enterBinding: Binding | Binding[],
): [KeyMap, string] {
	const ScopedEnterEvent = InternalEvents.getInternalEvent('enter', ID);
	return [{[ScopedEnterEvent]: enterBinding}, ScopedEnterEvent];
}

/*
 * Removes conflicting entries from the provided exitBinding
 * */
function getInsertKeymap(
	ID: string,
	exitBinding: Binding | Binding[],
): [KeyMap, string] {
	const defaultInsert = getDefaultInsertKeymap();
	exitBinding = [...(Array.isArray(exitBinding) ? exitBinding : [exitBinding])];

	const notKey: Key[] = [];
	const notInput: string[] = [];

	for (const b of exitBinding) {
		b.key && notKey.push(b.key);
		b.input && notInput.push(b.input);

		if (b.key && defaultInsert[b.key]) {
			delete defaultInsert[b.key];
		}

		if (b.notKey) {
			for (const kk in defaultInsert) {
				for (const bk in b.notKey) {
					if (bk === kk) continue;
					delete defaultInsert[kk];
				}
			}
		}
	}

	for (const [key, value] of Object.entries(defaultInsert)) {
		delete defaultInsert[key];

		const scopedKey = InternalEvents.getInternalEvent(key, ID);

		if (key === EVENTS.keypress) {
			defaultInsert[scopedKey] = {
				...(value as Binding),
				notKey: [...notKey, ...((value as Binding).notKey as any)],
				notInput: [...notInput, ...((value as Binding).notInput as any)],
			};
		} else {
			defaultInsert[scopedKey] = value;
		}
	}

	const ScopedExitEvent = InternalEvents.getInternalEvent('exit', ID);
	defaultInsert[ScopedExitEvent] = exitBinding;

	return [defaultInsert, ScopedExitEvent];
}

export default {
	getInsertKeymap,
	getNormalKeymap,
	defaultEnter,
	defaultExit,
	getScopedEvents,
};
