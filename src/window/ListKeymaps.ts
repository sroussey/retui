import {KeyMap} from '../stdin/Keyboard.js';
import InternalEvents from '../utility/InternalEvents.js';

export const CMDS = {
	increment: 'USE_KEYBINDS_INCREMENT',
	decrement: 'USE_KEYBINDS_DECREMENT',
	scrollUp: 'USE_KEYBINDS_SCROLL_UP',
	scrollDown: 'USE_KEYBINDS_SCROLL_DOWN',
	goToTop: 'USE_KEYBINDS_GO_TO_TOP',
	goToBottom: 'USE_KEYBINDS_GO_TO_BOTTOM',
} as const;

const arrowVertical = {
	[CMDS.increment]: [{key: 'down'}, {key: 'tab'}],
	[CMDS.decrement]: [{key: 'up'}],
} satisfies KeyMap;

const arrowHorizontal = {
	[CMDS.increment]: [{key: 'right'}, {key: 'tab'}],
	[CMDS.decrement]: [{key: 'left'}],
} satisfies KeyMap;

const vimVertical = {
	[CMDS.increment]: [{input: 'j'}, {key: 'down'}, {key: 'tab'}],
	[CMDS.decrement]: [{input: 'k'}, {key: 'up'}],
	[CMDS.scrollUp]: {key: 'ctrl', input: 'u'},
	[CMDS.scrollDown]: {key: 'ctrl', input: 'd'},
	[CMDS.goToTop]: {input: 'gg'},
	[CMDS.goToBottom]: {input: 'G'},
} satisfies KeyMap;

const vimHorizontal = {
	...vimVertical,
	[CMDS.increment]: [{input: 'l'}, {key: 'right'}, {key: 'tab'}],
	[CMDS.decrement]: [{input: 'h'}, {key: 'left'}],
} satisfies KeyMap;

function prefixId(ID: string, obj: KeyMap): KeyMap {
	const next: {[key: string]: any} = {};
	for (const [key, value] of Object.entries(obj)) {
		next[InternalEvents.getInternalEvent(key, ID)] = value;
	}
	return next as KeyMap;
}

// prettier-ignore
export const LIST_CMDS = {
	increment: (ID: string) => InternalEvents.getInternalEvent(CMDS.increment, ID),
	decrement: (ID: string) => InternalEvents.getInternalEvent(CMDS.decrement, ID),
	scrollUp: (ID: string) => InternalEvents.getInternalEvent(CMDS.scrollUp, ID),
	scrollDown: (ID: string) => InternalEvents.getInternalEvent(CMDS.scrollDown, ID),
	goToTop: (ID: string) => InternalEvents.getInternalEvent(CMDS.goToTop, ID),
	goToBottom: (ID: string) => InternalEvents.getInternalEvent(CMDS.goToBottom, ID),
} as const;

export const ListKeymaps = {
	arrowVertical: (id: string) => prefixId(id, arrowVertical),
	arrowHorizontal: (id: string) => prefixId(id, arrowHorizontal),
	vimVertical: (id: string) => prefixId(id, vimVertical),
	vimHorizontal: (id: string) => prefixId(id, vimHorizontal),
};
