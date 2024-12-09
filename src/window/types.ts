import {Dispatch, SetStateAction} from 'react';
import {ScrollAPI} from './ScrollAPI.js';

export type ScrollState = {
	idx: number;
	start: number;
	end: number;
	_winSize: number;
};

export type UseScrollOpts = Pick<
	UseWindowOpts,
	'fallthrough' | 'centerScroll' | 'windowSize'
>;

export type UseScrollReturn = {
	scrollState: ScrollState;
	setScrollState: (nextState: ScrollState) => void;
	scrollAPI: ScrollAPIPublicFns;
	LENGTH: number;
	WINDOW_SIZE: number;
};

export type UseWindowOpts = {
	windowSize?: number | 'fit';
	centerScroll?: boolean;
	fallthrough?: boolean;
	navigation?:
		| 'none'
		| 'vi-vertical'
		| 'vi-horizontal'
		| 'arrow-vertical'
		| 'arrow-horizontal';
};

export type UseWindowControl = {
	currentIndex: number;
} & ScrollAPIPublicFns;

export type ViewState = Readonly<{
	/* Used within the Window component */
	_start: number;
	_end: number;
	_idx: number;
	_winSize: number;
	_itemsLen: number;
	_control: UseWindowControl;
	_items: any;
	_setItems: SetState<any>;
}>;

export type SetState<T> = Dispatch<SetStateAction<T>>;

export type UseWindowReturn<T extends any[] | number> = T extends any[]
	? {
			viewState: ViewState;
			control: UseWindowControl;
			items: T[number][];
			setItems: SetState<T[number][]>;
		}
	: {
			viewState: ViewState;
			control: UseWindowControl;
			items: null[];
			setItems: SetState<null[]>;
		};

export type ScrollAPIInit = {
	state: ScrollState;
	setState: (next: ScrollState) => void;
	LENGTH: number;
	WINDOW_SIZE: number;
	opts: UseScrollOpts;
	prevBounds?: {start: number; end: number};
};

// Public functions in ScrollAPIPublicFns, used as utility functions in components
export type ScrollAPIPublicFns = Omit<
	{
		[P in keyof ScrollAPI]: ScrollAPI[P] extends Function
			? ScrollAPI[P]
			: never;
	},
	'getAPI' | 'handle'
>;

export type Listener = {
	event: string;
	handler: (...args: any[]) => unknown;
};
