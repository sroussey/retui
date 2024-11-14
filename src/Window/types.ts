import {Dispatch, SetStateAction} from 'react';
import {T as Keyboard} from '../Stdin/Keyboard.js';
import {ScrollAPI} from './ScrollAPI.js';

export type KeyMap = Keyboard.KeyMap;

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
	navigation?:
		| 'none'
		| 'vi-vertical'
		| 'vi-horizontal'
		| 'arrow-vertical'
		| 'arrow-horizontal';
	centerScroll?: boolean;
	fallthrough?: boolean;
};

export type UseWindowUtil = {
	currentIndex: number;
} & ScrollAPIPublicFns;

export type ViewState = Readonly<{
	/* Used within the Window component */
	_start: number;
	_end: number;
	_idx: number;
	_winSize: number;
	_itemsLen: number;
	_util: UseWindowUtil;
	_items: any;
	_setItems: SetState<any>;
	_fitWindow: boolean;
}>;

export type SetState<T> = Dispatch<SetStateAction<T>>;

export type UseWindowReturn<T extends any[] | number> = T extends any[]
	? {
			viewState: ViewState;
			util: UseWindowUtil;
			items: T[number][];
			setItems: SetState<T[number][]>;
		}
	: {
			viewState: ViewState;
			util: UseWindowUtil;
			items: null[];
			setItems: SetState<null[]>;
		};

export type ScrollAPIInit = {
	state: ScrollState;
	setState: (next: ScrollState) => void;
	LENGTH: number;
	WINDOW_SIZE: number;
	opts: UseScrollOpts;
};

// Public functions in ScrollAPIPublicFns, used as utility functions in components
export type ScrollAPIPublicFns = Omit<
	{
		[P in keyof ScrollAPI]: ScrollAPI[P] extends Function
			? ScrollAPI[P]
			: never;
	},
	'getAPI'
>;

export type Listener = {
	event: string;
	handler: (...args: any[]) => unknown;
};
