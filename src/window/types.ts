import { ScrollAPIPublicFns } from "./ScrollAPI.js";
import { Except } from "type-fest";
import { Opts as UseWindowOpts } from "./useWindow.js";
import { SetState } from "../utility/types.js";

export type WindowControl = ScrollAPIPublicFns & {
	currentIndex: number;
};

export type PublicWindowControl = Except<WindowControl, "modifyWinSize">;

/* Used within the Window component */
export type ViewState = Readonly<{
	_start: number;
	_end: number;
	_idx: number;
	_winSize: number;
	_itemsLen: number;
	_control: WindowControl;
	_items: any;
	_setItems: SetState;
	_unitSize: UseWindowOpts["unitSize"];
	_explicitWindowSize?: number;
}>;

export type Listener = {
	event: string;
	handler: (...args: any[]) => unknown;
};
