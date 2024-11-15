import {randomUUID} from 'crypto';
import {EffectCallback, useEffect, useRef, useState} from 'react';
import {
	NavController,
	NavControllerAPI,
	NavigationMap,
} from './NavController.js';
import assert from 'assert';
import {KeyMap, useEvent, useKeymap} from '../index.js';
import {ARROW_KEYMAP, ID_NAV_EVENTS, VI_KEYMAP} from './constants.js';

type Opts<T extends string = string> = {
	initialFocus?: T;
	keymap: 'vi' | 'arrow' | 'none';
};

export type FocusMap<T extends string = string> = {
	[P in T]: boolean;
};

type Return<T extends string = string> = {
	node: T;
	focusMap: FocusMap<T>;
	util: NavControllerAPI;
	navigationState: Readonly<{
		node: T;
		focusMap: FocusMap<T>;
	}>;
};

export function useNavigator<T extends string = string>(
	navigationMap: NavigationMap,
	opts: Opts<T> = {keymap: 'arrow'},
): Return<T> {
	const controller = useRef<NavController>(
		new NavController(navigationMap, opts.initialFocus),
	);

	const [ID] = useState(randomUUID());
	const [node, setNode] = useState<string>(controller.current.getLocation());

	// NavController accepts an initial focus, but if the initial focus does
	// not exist in the initializer map, then the focus defaults to the first
	// node.  If a new navigation map cuts off focus, it makes more sense to try
	// to keep the focus at the same iteration, or as close to the same iteration
	// as possible
	useDeepEffect(() => {
		const previousIteration = controller.current.getIteration();
		controller.current = new NavController(navigationMap, previousIteration);

		const nextIteration = controller.current.getIteration();
		const nextSize = controller.current.getSize();

		if (previousIteration === nextIteration) {
			return setNode(controller.current.getLocation());
		}

		// navigationMap size has decreased AND shifted previousIteration out of
		// range. Shift focus to the last node in the new map
		if (nextSize <= previousIteration) {
			return setNode(controller.current.goTo(nextSize - 1));
		}
	}, [navigationMap]);

	function getFocusMap(): FocusMap {
		const possibleNodes: string[] = navigationMap
			.flatMap(i => i.map(j => (j ? j : null)))
			.filter(i => i !== null);

		return Object.fromEntries(
			possibleNodes.map(_node => {
				if (_node === node) {
					return [_node, true];
				} else {
					return [_node, false];
				}
			}),
		);
	}

	let keymap: KeyMap = {};
	// prettier-ignore
	if (opts.keymap === undefined, opts.keymap === 'arrow') {
		keymap = ARROW_KEYMAP(ID);
	}
	if (opts.keymap === 'vi') {
		keymap = VI_KEYMAP(ID);
	}

	const set = (cb: () => string) => () => {
		const node = cb();
		setNode(node);
		return node;
	};

	useKeymap(keymap, {
		priority: opts.keymap === 'none' ? 'never' : 'default',
	});
	useEvent(ID_NAV_EVENTS.up(ID), set(controller.current.up));
	useEvent(ID_NAV_EVENTS.down(ID), set(controller.current.down));
	useEvent(ID_NAV_EVENTS.left(ID), set(controller.current.left));
	useEvent(ID_NAV_EVENTS.right(ID), set(controller.current.right));
	useEvent(ID_NAV_EVENTS.next(ID), set(controller.current.next));
	useEvent(ID_NAV_EVENTS.prev(ID), set(controller.current.prev));

	const util: NavControllerAPI = {
		goTo: (nodeName: string | number) => {
			const node = controller.current.goTo(nodeName);
			setNode(node);
			return node;
		},
		getLocation: set(controller.current.getLocation),
		up: set(controller.current.up),
		down: set(controller.current.down),
		left: set(controller.current.left),
		right: set(controller.current.right),
		next: set(controller.current.next),
		prev: set(controller.current.prev),
	};

	const focusMap = getFocusMap();

	return {
		node: node as T,
		focusMap,
		util,
		navigationState: {
			node: node as T,
			focusMap,
		},
	};
}

export function useDeepEffect(cb: EffectCallback, deps: any[]) {
	const changes = useRef(0);
	const lastDeps = useRef(deps);

	for (let i = 0; i < deps.length; ++i) {
		try {
			assert.deepStrictEqual(deps[i], lastDeps.current[i]);
		} catch {
			++changes.current;
		}
	}

	lastDeps.current = deps;

	useEffect(cb, [changes.current]);
}
