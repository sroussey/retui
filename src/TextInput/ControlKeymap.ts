import {Binding, Key, KeyMap} from '../index.js';

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

export const EVENTS: {[K in InsertEvents]: string} = {
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
		return: postFixWithId('return', ID),
		left: postFixWithId('left', ID),
		right: postFixWithId('right', ID),
		up: postFixWithId('up', ID),
		down: postFixWithId('down', ID),
		backspace: postFixWithId('backspace', ID),
		tab: postFixWithId('tab', ID),
		keypress: postFixWithId('keypress', ID),
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
	const ScopedEnterEvent = `ENTER_${ID}`;
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
		defaultInsert[postFixWithId(key, ID)] = value;
	}

	const ScopedExitEvent = postFixWithId('exit', ID);
	defaultInsert[ScopedExitEvent] = exitBinding;

	return [defaultInsert, ScopedExitEvent];
}

function postFixWithId(event: string, ID: string = ''): string {
	if (ID === '') return event;
	return `${event}_${ID}`;
}

export default {
	postFixWithId,
	getInsertKeymap,
	getNormalKeymap,
	defaultEnter,
	defaultExit,
	getScopedEvents,
};
