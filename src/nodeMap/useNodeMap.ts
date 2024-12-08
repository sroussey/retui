import {randomUUID} from 'crypto';
import {EffectCallback, useEffect, useRef, useState} from 'react';
import {NavController, NavControllerAPI} from './NavController.js';
import assert from 'assert';
import {KeyMap, useEvent, useKeymap} from '../index.js';
import {ARROW_KEYMAP, ID_NAV_EVENTS, VI_KEYMAP} from './keymaps.js';

type NodeMap<T extends string = string> = T[][];
type Nodes<T extends string> = Exclude<T, ''>;

export type NodesView<T extends string> = Readonly<{
	_node: Nodes<T>;
	_focusMap: FocusMap;
	_control: NavControllerAPI;
}>;

export type FocusMap = {
	[node: string]: boolean;
};

export interface RegisterNode<T extends string = string> {
	(nodeName: Nodes<T>): {name: Nodes<T>; nodesView: NodesView<T>};
}

type Return<T extends string = string> = {
	node: Nodes<T>;
	control: NavControllerAPI;
	nodesView: NodesView<T>;
	register: RegisterNode<T>;
};

type Opts<T extends string = string> = {
	initialFocus?: T;
	navigation?: 'vi' | 'arrow' | 'none';
};

export function useNodeMap<T extends string = string>(
	nodeMap: NodeMap<T>,
	opts: Opts<T> = {},
): Return<T> {
	const controller = useRef<NavController>(
		new NavController(nodeMap, opts.initialFocus),
	);

	const [ID] = useState(randomUUID());
	const [node, setNode] = useState<string>(controller.current.getLocation());

	// NavController accepts an initial focus, but if the initial focus does
	// not exist in the initializer map, then the focus defaults to the first
	// node.  If a new navigation map cuts off focus, it makes more sense to try
	// to keep the focus at the same iteration, or as close to the same iteration
	// as possible.  In this case, the iteration refers to the index at the focused
	// node where indexes are determined from reading the matrix left to right,
	// line by line
	useDeepEffect(() => {
		const previousIteration = controller.current.getIteration();
		controller.current = new NavController(nodeMap, previousIteration);

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
	}, [nodeMap]);

	let keymap: KeyMap = {};
	// prettier-ignore
	if (opts.navigation === 'vi' || opts.navigation === undefined) {
		keymap = VI_KEYMAP(ID);
	}
	if (opts.navigation === 'arrow') {
		keymap = ARROW_KEYMAP(ID);
	}

	// For adding the internal event listeners, we only care about updating state,
	// but for some of the utility functions that this hook exposes, it could be limiting
	// if they did not also return the output of the function.
	const set = (cb: () => string) => () => {
		const node = cb();
		setNode(node);
		return node;
	};

	useKeymap(keymap, {
		priority: opts.navigation === 'none' ? 'never' : 'default',
	});
	useEvent(ID_NAV_EVENTS.up(ID), set(controller.current.up));
	useEvent(ID_NAV_EVENTS.down(ID), set(controller.current.down));
	useEvent(ID_NAV_EVENTS.left(ID), set(controller.current.left));
	useEvent(ID_NAV_EVENTS.right(ID), set(controller.current.right));
	useEvent(ID_NAV_EVENTS.next(ID), set(controller.current.next));
	useEvent(ID_NAV_EVENTS.prev(ID), set(controller.current.prev));

	const control: NavControllerAPI = {
		goTo: (nodeName: string | number) => {
			const node = controller.current.goTo(nodeName);
			setNode(node);
			return node;
		},
		getIteration: controller.current.getIteration,
		getSize: controller.current.getSize,
		getLocation: controller.current.getLocation,
		up: set(controller.current.up),
		down: set(controller.current.down),
		left: set(controller.current.left),
		right: set(controller.current.right),
		next: set(controller.current.next),
		prev: set(controller.current.prev),
	};

	function getFocusMap(): FocusMap {
		const possibleNodes: string[] = nodeMap
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

	const focusMap = getFocusMap();
	const nodesView = Object.freeze({
		_node: node as Nodes<T>,
		_focusMap: focusMap,
		_control: control,
	});

	const register: RegisterNode<T> = (nodeName: Nodes<T>) => {
		return {
			name: nodeName,
			nodesView: nodesView,
		};
	};

	return {
		node: node as Nodes<T>,
		control,
		register,
		nodesView,
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
