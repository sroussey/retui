import {Node as YogaNode} from 'yoga-wasm-web';
import EventEmitter = require('events');
import ElementPosition from './ElementPosition.js';
import {spawnSync} from 'child_process';

export namespace T {
	// Events emitted from Mouse.Emitter
	export type Events =
		| 'CLICK'
		| 'DOUBLE_CLICK'
		| 'MOUSE_DOWN'
		| 'MOUSE_UP'
		| 'RIGHT_CLICK'
		| 'RIGHT_DOUBLE_CLICK'
		| 'RIGHT_MOUSE_DOWN'
		| 'RIGHT_MOUSE_UP'
		| 'SCROLL_UP'
		| 'SCROLL_DOWN'
		| 'SCROLL_CLICK';

	// Handlers that may be passed to Box components
	export type HandlerProps =
		| 'onClick'
		| 'onDoubleClick'
		| 'onMouseDown'
		| 'onMouseUp'
		| 'onRightClick'
		| 'onRightDoubleClick'
		| 'onRightMouseDown'
		| 'onRightMouseUp'
		| 'onScrollUp'
		| 'onScrollDown'
		| 'onScrollClick';

	// x,y coordinates of each corner of a component as positioned within the entire screen
	export type Position = {
		topLeft: [number, number];
		topRight: [number, number];
		bottomLeft: [number, number];
		bottomRight: [number, number];
	};

	export type Event = {
		clientX: number; // x coordinate within the entire screen where the mouse event occurred
		clientY: number; // y coordinate within the entire screen where the mouse event occurred
		target: YogaNode; // component reference to its YogaNode
		targetPosition: Position; // position of a component within the entire screen
	};

	// The data emitted from Mouse.Emitter when reading from stdin, which will
	// eventually be used to create the Event object
	export type StdinData = Omit<Event, 'target' | 'targetPosition'>;

	export type Handler = (e: Event) => unknown;

	export type ComponentData = {
		[ComponentId: string]: {
			target: YogaNode;
			targetPosition: Position;
			setLeftActive: (b: boolean) => void;
			setRightActive: (b: boolean) => void;
			trackLeftActive: boolean;
			trackRightActive: boolean;
			componentHandler?: Handler;
		};
	};

	export type HandlerRegistry = Record<T.HandlerProps, T.ComponentData>;

	export type Buttons =
		| 'LEFT_BTN_DOWN'
		| 'SCROLL_BTN_DOWN'
		| 'RIGHT_BTN_DOWN'
		| 'RELEASE_BTN'
		| 'SCROLL_UP'
		| 'SCROLL_DOWN';
}

export type {T as MouseTypes};

export const MOUSE_ESCAPE_CODES = {
	ON: '\x1b[?1000h',
	OFF: '\x1b[?1000l',
} as const;

export default class Mouse {
	// Ensure consistent naming for Events and Handler Props
	private PropsToEvents: Record<T.HandlerProps, T.Events>;
	private Emitter: EventEmitter;
	private Handlers: T.HandlerRegistry;
	private unsubscribers: (() => void)[];
	private btnDownState: {
		left: boolean;
		scroll: boolean;
		right: boolean;
	};
	private dblClickState: {
		left: boolean;
		right: boolean;
	};
	private listening: boolean;
	private hasSetExitHandler: boolean;

	constructor() {
		this.Emitter = new EventEmitter();
		this.Emitter.setMaxListeners(Infinity);
		this.PropsToEvents = {
			onClick: 'CLICK',
			onDoubleClick: 'DOUBLE_CLICK',
			onMouseDown: 'MOUSE_DOWN',
			onMouseUp: 'MOUSE_UP',
			onRightClick: 'RIGHT_CLICK',
			onRightDoubleClick: 'RIGHT_DOUBLE_CLICK',
			onRightMouseDown: 'RIGHT_MOUSE_DOWN',
			onRightMouseUp: 'RIGHT_MOUSE_UP',
			onScrollUp: 'SCROLL_UP',
			onScrollDown: 'SCROLL_DOWN',
			onScrollClick: 'SCROLL_CLICK',
		};
		this.Handlers = {
			onClick: {},
			onDoubleClick: {},
			onMouseDown: {},
			onMouseUp: {},
			onRightClick: {},
			onRightDoubleClick: {},
			onRightMouseDown: {},
			onRightMouseUp: {},
			onScrollUp: {},
			onScrollDown: {},
			onScrollClick: {},
		};
		this.unsubscribers = [];
		this.btnDownState = {
			left: false,
			scroll: false,
			right: false,
		};
		this.dblClickState = {
			left: false,
			right: false,
		};
		this.listening = false;
		this.hasSetExitHandler = false;
	}

	public setMouseReporting = (on: boolean): void => {
		const escapeSequence = on ? MOUSE_ESCAPE_CODES.ON : MOUSE_ESCAPE_CODES.OFF;

		const set = (escapeSequence: string) => {
			spawnSync('echo', ['-e', escapeSequence], {
				stdio: ['inherit', 'inherit', 'inherit'],
			});
		};

		set(escapeSequence);

		if (!this.hasSetExitHandler) {
			process.on('exit', () => {
				set(MOUSE_ESCAPE_CODES.OFF);
			});
			this.hasSetExitHandler = true;
		}
	};

	// Parse the this.Handler[prop] object which contains a store IDs from Box
	// components and determine if their click event handlers should be executed
	public handleEvent = (prop: T.HandlerProps) => (event: T.StdinData) => {
		const {clientX, clientY} = event;
		const propData = this.Handlers[prop] as T.ComponentData;
		for (const ID in propData) {
			const componentPosition = propData[ID]!.targetPosition;
			const componentHandler = propData[ID]!.componentHandler;
			const componentNode = propData[ID]!.target;
			const setLeftActive = propData[ID]!.setLeftActive;
			const trackLeftActive = propData[ID]!.trackLeftActive;
			const setRightActive = propData[ID]!.setRightActive;
			const trackRightActive = propData[ID]!.trackRightActive;

			if (!ElementPosition.containsPoint(clientX, clientY, componentPosition)) {
				return;
			}

			const event: T.Event = {
				clientX,
				clientY,
				targetPosition: componentPosition,
				target: componentNode,
			};

			const eventType = this.PropsToEvents[prop];

			if (trackLeftActive && eventType === this.PropsToEvents.onMouseDown) {
				setLeftActive(true);
				this.Emitter.once(this.PropsToEvents.onMouseUp, () => {
					setLeftActive(false);
				});
			}
			// prettier-ignore
			if (trackRightActive && eventType === this.PropsToEvents.onRightMouseDown) {
						setRightActive(true);
						this.Emitter.once(this.PropsToEvents.onRightMouseUp, () => {
							setRightActive(false);
						})
					}

			componentHandler?.(event);
		}
	};

	// Allow processing of this.Handlers object when mouse input events are recieved
	public listen = (): void => {
		if (this.listening) return;

		for (const prop in this.PropsToEvents) {
			const eventString = this.PropsToEvents[prop as T.HandlerProps];
			const handler = this.handleEvent(prop as T.HandlerProps);

			// console.log(`eventstring: ${eventString}`);

			this.Emitter.on(eventString, handler);
			this.unsubscribers.push(() => {
				this.Emitter.off(eventString, handler);
			});
		}

		this.listening = true;
	};

	// Used to exit the entire app, or to temporarily pause mouse input for any reason
	public pause = (): void => {
		this.Emitter.removeAllListeners();
		this.listening = false;
	};

	// Update this.Handlers object from within a Box component
	public subscribeComponent = <T extends {[P in T.HandlerProps]?: any}>({
		props,
		ID,
		target,
		targetPosition,
		setLeftActive,
		setRightActive,
		trackLeftActive,
		trackRightActive,
	}: {
		props: T;
		ID: string;
		target: YogaNode;
		targetPosition: T.Position;
		setLeftActive: (b: boolean) => void;
		setRightActive: (b: boolean) => void;
		trackLeftActive: boolean;
		trackRightActive: boolean;
	}): void => {
		const componentData = {
			ID,
			target,
			targetPosition,
			setLeftActive,
			setRightActive,
			trackLeftActive,
			trackRightActive,
		};

		for (const prop in this.PropsToEvents) {
			this.Handlers[prop as T.HandlerProps][ID] = {
				...componentData,
				componentHandler: props[prop as T.HandlerProps],
			};
		}

		// this.Handlers.onClick[ID] = {
		// 	...componentData,
		// 	componentHandler: props.onClick,
		// };
	};

	// Cleanup after a Box component is unmounted
	public unsubscribeComponent = (ID: string): void => {
		for (const prop in this.PropsToEvents) {
			delete this.Handlers[prop as T.HandlerProps][ID];
		}
	};

	private getButtonType = (n: number): T.Buttons | null => {
		switch (n) {
			case 0:
				return 'LEFT_BTN_DOWN';
			case 1:
				return 'SCROLL_BTN_DOWN';
			case 2:
				return 'RIGHT_BTN_DOWN';
			case 3:
				return 'RELEASE_BTN';
			case 64:
				return 'SCROLL_UP';
			case 65:
				return 'SCROLL_DOWN';
			default:
				return null;
		}
	};

	public isMouseEvent = (buffer: Buffer): boolean => {
		let codes: any[] = [];
		for (let i = 0; i < buffer.length; i += 2) {
			codes.push(`${buffer[i]}${buffer[i + 1]}`);
		}

		// Mouse event ESC[M
		if (codes[0] === '1b' && codes[1] === '5b' && codes[2] === '4d') {
			return true;
		} else {
			return false;
		}
	};

	public handleStdin = (buffer: Buffer): void => {
		const buttonCode = buffer[3]! - 0x20;
		let x = buffer[4]! - 0x20 - 1;
		let y = buffer[5]! - 0x20 - 1;

		const event: T.StdinData = {clientX: x, clientY: y};
		const button = this.getButtonType(buttonCode);

		if (button === 'LEFT_BTN_DOWN') {
			this.btnDownState.left = true;
			this.Emitter.emit(this.PropsToEvents.onMouseDown, event);
		}

		if (button === 'RIGHT_BTN_DOWN') {
			this.btnDownState.right = true;
			this.Emitter.emit(this.PropsToEvents.onRightMouseDown, event);
		}

		if (button === 'SCROLL_BTN_DOWN') {
			this.btnDownState.scroll = true;
		}

		if (button === 'SCROLL_UP') {
			this.Emitter.emit(this.PropsToEvents.onScrollUp, event);
		}

		if (button === 'SCROLL_DOWN') {
			this.Emitter.emit(this.PropsToEvents.onScrollDown, event);
		}

		if (button !== 'RELEASE_BTN') return;

		if (this.btnDownState.left) {
			this.Emitter.emit(this.PropsToEvents.onClick, event);
			this.Emitter.emit(this.PropsToEvents.onMouseUp, event);
			if (this.dblClickState.left) {
				this.Emitter.emit(this.PropsToEvents.onDoubleClick, event);
			} else {
				this.beginDoubleClickTimer('LEFT');
			}
		}

		if (this.btnDownState.right) {
			this.Emitter.emit(this.PropsToEvents.onRightClick, event);
			this.Emitter.emit(this.PropsToEvents.onRightMouseUp, event);
			if (this.dblClickState.right) {
				this.Emitter.emit(this.PropsToEvents.onRightDoubleClick, event);
			} else {
				this.beginDoubleClickTimer('RIGHT');
			}
		}

		if (this.btnDownState.scroll) {
			this.Emitter.emit(this.PropsToEvents.onScrollClick, event);
		}

		this.btnDownState = {left: false, scroll: false, right: false};
	};

	private beginDoubleClickTimer = (btn: 'RIGHT' | 'LEFT'): void => {
		const CLICK_INTERVAL = 500;

		setTimeout(() => {
			if (btn === 'LEFT') {
				this.dblClickState.left = false;
			}

			if (btn === 'RIGHT') {
				this.dblClickState.right = false;
			}
		}, CLICK_INTERVAL);

		if (btn === 'LEFT' && !this.dblClickState.left) {
			this.dblClickState.left = true;
		}
		if (btn === 'RIGHT' && !this.dblClickState.right) {
			this.dblClickState.right = true;
		}
	};
}
