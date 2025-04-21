import { Node as YogaNode } from "yoga-layout";
import EventEmitter from "node:events";
import ElementPosition, { CornerPositions } from "./ElementPosition.js";
import { spawnSync } from "child_process";
import { Title } from "../renderTitles/renderTitleToOutput.js";

// Events emitted from Mouse.Emitter
export type Events =
	| "CLICK"
	| "DOUBLE_CLICK"
	| "MOUSE_DOWN"
	| "MOUSE_UP"
	| "RIGHT_CLICK"
	| "RIGHT_DOUBLE_CLICK"
	| "RIGHT_MOUSE_DOWN"
	| "RIGHT_MOUSE_UP"
	| "SCROLL_UP"
	| "SCROLL_DOWN"
	| "SCROLL_CLICK";

// Handlers that may be passed to Box components
export type HandlerProps =
	| "onClick"
	| "onDoubleClick"
	| "onMouseDown"
	| "onMouseUp"
	| "onRightClick"
	| "onRightDoubleClick"
	| "onRightMouseDown"
	| "onRightMouseUp"
	| "onScrollUp"
	| "onScrollDown"
	| "onScrollClick";

export type MouseEvent = {
	clientX: number; // x coordinate within the entire screen where the mouse event occurred
	clientY: number; // y coordinate within the entire screen where the mouse event occurred
	target: YogaNode; // component reference to its YogaNode
	targetPosition: CornerPositions; // position of a component within the entire screen
};

// The data emitted from Mouse.Emitter when reading from stdin, which will
// eventually be used to create the MouseEvent object
export type StdinData = Omit<MouseEvent, "target" | "targetPosition">;

export type Handler = (e: MouseEvent) => unknown;

export type ComponentData = {
	[ComponentId: string]: {
		target: YogaNode;
		targetPosition: CornerPositions;
		setLeftActive: (b: boolean) => void;
		setRightActive: (b: boolean) => void;
		trackLeftActive: boolean;
		trackRightActive: boolean;
		componentHandler?: Handler;
	};
};

export type TitleData = {
	[TitleId: string]: {
		isTitle: true;
		target: YogaNode;
		targetPosition: CornerPositions;
		titleHandler?: Handler;
	};
};

// Holds Registry at a certain z-index
export type ZIndexRegistry = Record<HandlerProps, ComponentData | TitleData>;

export type HandlerRegistry = {
	[zIndex: number]: ZIndexRegistry;
};

export type Buttons =
	| "LEFT_BTN_DOWN"
	| "SCROLL_BTN_DOWN"
	| "RIGHT_BTN_DOWN"
	| "RELEASE_BTN"
	| "SCROLL_UP"
	| "SCROLL_DOWN";

export const MOUSE_ESCAPE_CODES = {
	ON: "\x1b[?1000h",
	OFF: "\x1b[?1000l",
} as const;

export default class Mouse {
	// Ensure consistent naming for Events and Handler Props
	private PropsToEvents: Record<HandlerProps, Events>;
	private Emitter: EventEmitter;
	private Handlers: HandlerRegistry;
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
			onClick: "CLICK",
			onDoubleClick: "DOUBLE_CLICK",
			onMouseDown: "MOUSE_DOWN",
			onMouseUp: "MOUSE_UP",
			onRightClick: "RIGHT_CLICK",
			onRightDoubleClick: "RIGHT_DOUBLE_CLICK",
			onRightMouseDown: "RIGHT_MOUSE_DOWN",
			onRightMouseUp: "RIGHT_MOUSE_UP",
			onScrollUp: "SCROLL_UP",
			onScrollDown: "SCROLL_DOWN",
			onScrollClick: "SCROLL_CLICK",
		};
		this.Handlers = {};
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

	public resetHandlers(): void {
		this.Handlers = {};
	}

	private newZIndexRegistry(): ZIndexRegistry {
		return {
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
	}

	public setMouseReporting = (on: boolean): void => {
		const escapeSequence = on ? MOUSE_ESCAPE_CODES.ON : MOUSE_ESCAPE_CODES.OFF;

		const set = (escapeSequence: string) => {
			spawnSync("echo", ["-e", escapeSequence], {
				stdio: ["inherit", "inherit", "inherit"],
			});
		};

		set(escapeSequence);

		if (!this.hasSetExitHandler) {
			process.on("exit", () => {
				set(MOUSE_ESCAPE_CODES.OFF);
			});
			this.hasSetExitHandler = true;
		}
	};

	// Parse the this.Handler[prop] object which contains a store IDs from Box
	// components and determine if their click event handlers should be executed
	public handleEvent = (prop: HandlerProps) => (event: StdinData) => {
		const { clientX, clientY } = event;

		// Sort zIndex highest to lowest to highest
		// If an event is clicked inside one of the components on one level, the
		// lower levels will not be checked.
		const zIndexes: number[] = [];
		const zIndexListeners: (ZIndexRegistry | undefined)[] = Object.keys(this.Handlers)
			.sort((a, b) => Number(b) - Number(a))
			.map((zIndex) => {
				zIndexes.push(Number(zIndex));
				return this.Handlers[Number(zIndex) as number];
			});

		let eventHappened = false;

		const batchedHandlers: (() => void)[] = [];

		for (const level of zIndexListeners) {
			if (eventHappened) break;

			if (!level) {
				continue;
			}

			const propData = level[prop] as ComponentData | TitleData;

			for (const ID in propData) {
				const targetPosition = propData[ID]!.targetPosition;
				const componentNode = propData[ID]!.target;

				if (!ElementPosition.containsPoint(clientX, clientY, targetPosition)) {
					continue;
				}

				eventHappened = true;
				const event: MouseEvent = {
					clientX,
					clientY,
					targetPosition: targetPosition,
					target: componentNode,
				};

				if ("isTitle" in propData[ID]!) {
					const titleHandler = (propData as TitleData)[ID]?.titleHandler;
					if (titleHandler) {
						batchedHandlers.push(() => {
							titleHandler(event);
						});
					}
				} else {
					const componentHandler = propData[ID]!.componentHandler;
					const setLeftActive = propData[ID]!.setLeftActive;
					const trackLeftActive = propData[ID]!.trackLeftActive;
					const setRightActive = propData[ID]!.setRightActive;
					const trackRightActive = propData[ID]!.trackRightActive;

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

					if (componentHandler) {
						batchedHandlers.push(() => {
							componentHandler(event);
						});
					}
				}
			}
		}

		batchedHandlers.forEach((batchedHandler) => {
			batchedHandler();
		});
	};

	// Allow processing of this.Handlers object when mouse input events are recieved
	public listen = (): void => {
		if (this.listening) return;

		for (const prop in this.PropsToEvents) {
			const eventString = this.PropsToEvents[prop as HandlerProps];
			const handler = this.handleEvent(prop as HandlerProps);

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

	public subscribeTitle({
		ID,
		target,
		targetPosition,
		zIndex,
		title,
	}: {
		ID: string;
		target: YogaNode;
		targetPosition: CornerPositions;
		zIndex: number;
		title: Title;
	}): void {
		for (const prop in this.PropsToEvents) {
			if (!this.Handlers[zIndex]) {
				this.Handlers[zIndex] = this.newZIndexRegistry();
			}

			this.Handlers[zIndex][prop as HandlerProps][ID] = {
				isTitle: true,
				target: target,
				targetPosition: targetPosition,
				titleHandler: title[prop as HandlerProps],
			};
		}
	}

	// Update this.Handlers object from within a Box component
	public subscribeComponent = <T extends { [P in HandlerProps]?: any }>({
		props,
		ID,
		target,
		targetPosition,
		setLeftActive,
		setRightActive,
		trackLeftActive,
		trackRightActive,
		zIndex,
	}: {
		props: T;
		ID: string;
		target: YogaNode;
		targetPosition: CornerPositions;
		setLeftActive: (b: boolean) => void;
		setRightActive: (b: boolean) => void;
		trackLeftActive: boolean;
		trackRightActive: boolean;
		zIndex: number;
	}): void => {
		const componentData = {
			ID,
			target,
			targetPosition,
			setLeftActive,
			setRightActive,
			trackLeftActive,
			trackRightActive,
			zIndex,
		};

		for (const prop in this.PropsToEvents) {
			if (!this.Handlers[zIndex]) {
				this.Handlers[zIndex] = this.newZIndexRegistry();
			}

			this.Handlers[zIndex][prop as HandlerProps][ID] = {
				...componentData,
				componentHandler: props[prop as HandlerProps],
			};
		}
	};

	// Ensure listeners are removed after a Box component is unmounted
	public unsubscribeComponent = (ID: string): void => {
		for (const zIndex in this.Handlers) {
			for (const prop in this.PropsToEvents) {
				delete this.Handlers[zIndex]?.[prop as HandlerProps][ID];
			}
		}
	};

	private getButtonType = (n: number): Buttons | null => {
		switch (n) {
			case 0:
				return "LEFT_BTN_DOWN";
			case 1:
				return "SCROLL_BTN_DOWN";
			case 2:
				return "RIGHT_BTN_DOWN";
			case 3:
				return "RELEASE_BTN";
			case 64:
				return "SCROLL_UP";
			case 65:
				return "SCROLL_DOWN";
			default:
				return null;
		}
	};

	/*
	 * man console-codes
	 * https://www.xfree86.org/current/ctlseqs.html#Mouse%20Tracking
	 *
	 * Sending "\033[?1000h" and "\033[?1000l" to stdin turns on/off mouse
	 * tracking respectively.  Mouse events start with \033[M which is 0x1b, 0x5b,
	 * and 0x4d
	 * */
	public isMouseEvent = (buffer: Buffer): boolean => {
		let codes: any[] = [];
		for (let i = 0; i < buffer.length; ++i) {
			// Convert byte to hex string.
			codes.push(`${buffer[i]?.toString(16)}`);
		}

		if (codes[0] === "1b" && codes[1] === "5b" && codes[2] === "4d") {
			return true;
		} else {
			return false;
		}
	};

	public handleStdin = (buffer: Buffer): void => {
		// xterm offsets the codes by 32 so that control chars like \n aren't sent
		// - 1 on x and y because xterm does not send 0 based coordinates
		const buttonCode = buffer[3]! - 32;
		let x = buffer[4]! - 32 - 1;
		let y = buffer[5]! - 32 - 1;

		const event: StdinData = { clientX: x, clientY: y };
		const button = this.getButtonType(buttonCode);

		if (button === "LEFT_BTN_DOWN") {
			this.btnDownState.left = true;
			this.Emitter.emit(this.PropsToEvents.onMouseDown, event);
		}

		if (button === "RIGHT_BTN_DOWN") {
			this.btnDownState.right = true;
			this.Emitter.emit(this.PropsToEvents.onRightMouseDown, event);
		}

		if (button === "SCROLL_BTN_DOWN") {
			this.btnDownState.scroll = true;
		}

		if (button === "SCROLL_UP") {
			this.Emitter.emit(this.PropsToEvents.onScrollUp, event);
		}

		if (button === "SCROLL_DOWN") {
			this.Emitter.emit(this.PropsToEvents.onScrollDown, event);
		}

		if (button !== "RELEASE_BTN") return;

		if (this.btnDownState.left) {
			this.Emitter.emit(this.PropsToEvents.onClick, event);
			this.Emitter.emit(this.PropsToEvents.onMouseUp, event);
			if (this.dblClickState.left) {
				this.Emitter.emit(this.PropsToEvents.onDoubleClick, event);
			} else {
				this.beginDoubleClickTimer("LEFT");
			}
		}

		if (this.btnDownState.right) {
			this.Emitter.emit(this.PropsToEvents.onRightClick, event);
			this.Emitter.emit(this.PropsToEvents.onRightMouseUp, event);
			if (this.dblClickState.right) {
				this.Emitter.emit(this.PropsToEvents.onRightDoubleClick, event);
			} else {
				this.beginDoubleClickTimer("RIGHT");
			}
		}

		if (this.btnDownState.scroll) {
			this.Emitter.emit(this.PropsToEvents.onScrollClick, event);
		}

		this.btnDownState = { left: false, scroll: false, right: false };
	};

	private beginDoubleClickTimer = (btn: "RIGHT" | "LEFT"): void => {
		const CLICK_INTERVAL = 500;

		setTimeout(() => {
			if (btn === "LEFT") {
				this.dblClickState.left = false;
			}

			if (btn === "RIGHT") {
				this.dblClickState.right = false;
			}
		}, CLICK_INTERVAL);

		if (btn === "LEFT" && !this.dblClickState.left) {
			this.dblClickState.left = true;
		}
		if (btn === "RIGHT" && !this.dblClickState.right) {
			this.dblClickState.right = true;
		}
	};
}
