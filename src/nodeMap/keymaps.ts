import { KeyMap } from "../index.js";

const BASE_EVENTS = {
	up: "NAV_UP",
	down: "NAV_DOWN",
	left: "NAV_LEFT",
	right: "NAV_RIGHT",
	next: "NAV_NEXT",
	prev: "NAV_PREV",
};

// Build events scoped to a given ID to prevent overlap if there are multiple
// instances of the useNavigation hook.  Non-focused useEvent hooks shouldn't
// respond to events anyways, but this is another barrier
export const ID_NAV_EVENTS = {
	up: (ID: string) => `${ID}-${BASE_EVENTS.up}`,
	down: (ID: string) => `${ID}-${BASE_EVENTS.down}`,
	left: (ID: string) => `${ID}-${BASE_EVENTS.left}`,
	right: (ID: string) => `${ID}-${BASE_EVENTS.right}`,
	next: (ID: string) => `${ID}-${BASE_EVENTS.next}`,
	prev: (ID: string) => `${ID}-${BASE_EVENTS.prev}`,
};

export const VI_KEYMAP = (ID: string): KeyMap => {
	return {
		[ID_NAV_EVENTS.up(ID)]: [{ key: "up" }, { input: "k" }],
		[ID_NAV_EVENTS.down(ID)]: [{ key: "down" }, { input: "j" }],
		[ID_NAV_EVENTS.left(ID)]: [{ key: "left" }, { input: "h" }],
		[ID_NAV_EVENTS.right(ID)]: [{ key: "right" }, { input: "l" }],
		[ID_NAV_EVENTS.next(ID)]: [{ key: "right" }, { key: "tab" }],
		[ID_NAV_EVENTS.prev(ID)]: [{ key: "left" }],
	};
};

export const ARROW_KEYMAP = (ID: string): KeyMap => {
	return {
		[ID_NAV_EVENTS.up(ID)]: { key: "up" },
		[ID_NAV_EVENTS.down(ID)]: { key: "down" },
		[ID_NAV_EVENTS.left(ID)]: { key: "left" },
		[ID_NAV_EVENTS.right(ID)]: { key: "right" },
		[ID_NAV_EVENTS.next(ID)]: [{ key: "right" }, { key: "tab" }],
		[ID_NAV_EVENTS.prev(ID)]: [{ key: "left" }],
	};
};
