import {produce} from 'immer';
import assert from 'node:assert';
import {ScrollAPIInit, ScrollAPIPublicFns} from './types.js';

type State = ScrollAPIInit['state'];
type SetState = ScrollAPIInit['setState'];

export class ScrollAPI {
	private readonly state: State;
	private readonly setState: SetState;
	private readonly LENGTH: ScrollAPIInit['LENGTH'];
	private readonly WINDOW_SIZE: ScrollAPIInit['WINDOW_SIZE'];
	private readonly centerScroll: boolean;
	private readonly fallthrough: boolean;

	constructor({state, setState, LENGTH, WINDOW_SIZE, opts}: ScrollAPIInit) {
		this.state = state;
		this.setState = (nextState: ScrollAPIInit['state']) => {
			try {
				assert.deepStrictEqual(this.state, nextState);
			} catch {
				setState(nextState);
				return;
			}
		};
		this.LENGTH = LENGTH;
		this.WINDOW_SIZE = WINDOW_SIZE;
		this.centerScroll = opts.centerScroll ?? false;
		this.fallthrough = opts.fallthrough ?? false;
	}

	public getAPI = (): ScrollAPIPublicFns => {
		return {
			nextItem: this.nextItem,
			prevItem: this.prevItem,
			goToIndex: this.goToIndex,
			modifyWinSize: this.modifyWinSize,
			scrollUp: this.scrollUp,
			scrollDown: this.scrollDown,
		};
	};

	public handle = (nextIdx: number = this.state.idx): void => {
		nextIdx = Math.floor(nextIdx);

		if (this.centerScroll) {
			const nextState = this.getCenterScrollChanges(nextIdx);
			return this.setState(nextState);
		} else {
			const nextState = this.getNormalScrollChanges(nextIdx);
			return this.setState(nextState);
		}
	};

	public goToIndex = (nextIdx: number): void => {
		nextIdx = Math.floor(nextIdx);

		if (nextIdx >= this.LENGTH || nextIdx < 0) return;

		// getCenterScrollChanges instead
		const nextState = this.getCenterScrollChanges(nextIdx);
		this.setState(nextState);
	};

	public nextItem = (): void => {
		// List is hidden
		if (this.state.start === this.state.end) return;

		// At the end of the list and fallthrough scroll is on, go to beginning
		if (this.fallthrough && this.state.idx === this.LENGTH - 1) {
			return this.handle(0);
		}

		// At the end of the list, can't go any further
		if (this.state.idx >= this.LENGTH - 1) return;

		this.handle(this.state.idx + 1);
	};

	public prevItem = (): void => {
		// List is hidden
		if (this.state.start === this.state.end) return;

		// At beginning of the list and fallthrough scroll is on, go to the end
		if (this.fallthrough && this.state.idx <= 0) {
			return this.handle(this.LENGTH - 1);
		}

		// At beginning of the list, can't go back any further
		if (this.state.idx <= 0) return;

		this.handle(this.state.idx - 1);
	};

	public scrollDown = (): void => {
		const half = Math.floor(this.WINDOW_SIZE / 2);
		const nextIdx = this.state.idx + half;

		if (this.fallthrough && nextIdx >= this.LENGTH) {
			const diff = this.LENGTH - this.state.idx - 1;
			return this.goToIndex(half - diff - 1);
		}

		this.goToIndex(Math.min(this.LENGTH - 1, nextIdx));
	};

	public scrollUp = (): void => {
		const half = Math.floor(this.WINDOW_SIZE / 2);
		const nextIdx = this.state.idx - half;

		if (this.fallthrough && nextIdx < 0) {
			const diff = half - this.state.idx;
			return this.goToIndex(this.LENGTH - diff);
		}

		this.goToIndex(Math.max(0, nextIdx));
	};

	private getNormalScrollChanges = (nextIdx: number = this.state.idx) => {
		nextIdx = Math.floor(nextIdx);

		const LENGTH = this.LENGTH;
		const WINDOW_SIZE = this.WINDOW_SIZE;

		return produce(this.state, draft => {
			// Handle window size is zero
			if (LENGTH === 0) return;
			if (draft.start === 0 && draft.end === 0) return;
			if (draft.start === draft.end) return;

			let trueWindowSize = this.getTrueWindowSize(draft.start, draft.end);
			while (trueWindowSize < WINDOW_SIZE && trueWindowSize < LENGTH) {
				--draft.start;
				--draft.end;
				trueWindowSize = this.getTrueWindowSize(draft.start, draft.end);
				this.rangeCheck(draft, 'getNormalScrollChanges');
			}

			this.constrainWindow({draft, LENGTH});
			draft.idx = Math.min(nextIdx, LENGTH - 1);
			draft.idx = Math.max(0, draft.idx);

			// next idx greater than range (goToIndex)
			while (draft.idx >= draft.end && draft.end < LENGTH) {
				++draft.end;
				++draft.start;
				this.rangeCheck(draft, 'getNormalScrollChanges');
			}

			//  next idx less than range (goToIndex)
			while (draft.idx < draft.start && draft.start >= 0) {
				--draft.end;
				--draft.start;
				this.rangeCheck(draft, 'getNormalScrollChanges');
			}

			// next idx 'bumps' into end position, forcing new window
			if (draft.idx === draft.end && draft.end < LENGTH) {
				++draft.start;
				++draft.end;
				this.rangeCheck(draft, 'getNormalScrollChanges');
				return;
			}

			// next idx 'bumps' into start position, forcing new window
			if (draft.idx === draft.end && draft.end < LENGTH) {
				--draft.start;
				--draft.end;
				this.rangeCheck(draft, 'getNormalScrollChanges');
				return;
			}
		});
	};

	private getCenterScrollChanges = (
		nextIdx: number = this.state.idx,
	): State => {
		nextIdx = Math.floor(nextIdx);

		const LENGTH = this.LENGTH;
		const WINDOW_SIZE = this.WINDOW_SIZE;
		const noIdxChange = nextIdx === this.state.idx;

		return produce(this.state, draft => {
			if (LENGTH === 0) return;
			if (draft.start === 0 && draft.end === 0) return;
			if (draft.start === draft.end) return;

			let trueWindowSize = this.getTrueWindowSize(draft.start, draft.end);
			while (trueWindowSize < WINDOW_SIZE && trueWindowSize < LENGTH) {
				--draft.start;
				--draft.end;
				trueWindowSize = this.getTrueWindowSize(draft.start, draft.end);
				this.rangeCheck(draft, 'getCenterScrollChanges');
			}

			this.constrainWindow({draft, LENGTH});
			draft.idx = Math.min(nextIdx, LENGTH - 1);
			draft.idx = Math.max(0, draft.idx);

			if (noIdxChange) return;

			while (draft.idx >= draft.end && draft.end < LENGTH) {
				++draft.end;
				++draft.start;
				this.rangeCheck(draft, 'getCenterScrollChanges');
			}

			while (draft.idx < draft.start && draft.start >= 0) {
				--draft.end;
				--draft.start;
				this.rangeCheck(draft, 'getCenterScrollChanges');
			}

			// If possible, center idx in viewing window
			this.centerIdx({draft, LENGTH});

			const mid = Math.floor((draft.start + draft.end) / 2);
			if (draft.idx > mid && draft.end !== LENGTH) {
				++draft.start;
				++draft.end;
			}
			if (draft.idx < mid && draft.start > 0) {
				--draft.start;
				--draft.end;
			}
		});
	};

	private centerIdx = ({
		draft,
		LENGTH,
	}: {
		draft: State;
		LENGTH: number;
	}): void => {
		const getMid = (s: number, e: number) => Math.floor((s + e) / 2);
		while (draft.idx > getMid(draft.start, draft.end) && draft.end < LENGTH) {
			++draft.start;
			++draft.end;
			this.rangeCheck(draft, 'centerIdx');
		}
		while (draft.idx < getMid(draft.start, draft.end) && draft.start > 0) {
			--draft.start;
			--draft.end;
			this.rangeCheck(draft, 'centerIdx');
		}
	};

	private getTrueWindowSize = (start: number, end: number): number => {
		return Math.min(this.LENGTH, end) - start;
	};

	// Make sure calculations haven't pushed window out of possible range
	private constrainWindow = ({
		draft,
		LENGTH,
	}: {
		draft: State;
		LENGTH: number;
	}): void => {
		draft.start = Math.max(draft.start, 0);
		draft.end = Math.min(draft.end, LENGTH);

		if (this.WINDOW_SIZE !== 0) {
			draft.idx = Math.min(draft.idx, draft.end - 1);
			draft.idx = Math.max(draft.idx, draft.start);
		}
	};

	public modifyWinSize = (nextSize: number): void => {
		nextSize = Math.floor(nextSize);

		const LENGTH = this.LENGTH;
		const WINDOW_SIZE = this.WINDOW_SIZE;

		if (LENGTH === 0) return;
		const nextState = produce(this.state, draft => {
			nextSize = Math.abs(nextSize);
			nextSize = Math.min(nextSize, LENGTH);

			if (nextSize === 0) {
				draft.start = draft.end = draft.idx;
			}

			let target = nextSize === 0 ? 0 : nextSize - WINDOW_SIZE;
			while (target) {
				/* Increase window size
				 * nextSize is greater than current size. */
				if (target > 0) {
					if (draft.end < LENGTH) {
						++draft.end;
					} else if (draft.start > 0) {
						--draft.start;
					} else {
						throw new Error('modifyWinSize (inc win size)');
					}

					--target;
				} else {
					/* Decrease window size
					 * nextSize is less than current size. */
					if (draft.idx < draft.end - 1) {
						--draft.end;
					} else if (draft.idx === draft.end - 1) {
						++draft.start;
					} else {
						throw new Error('modifyWinSize (dec win size)');
					}

					++target;
				}
			}

			draft._winSize = nextSize;

			if (this.centerScroll) {
				this.centerIdx({draft, LENGTH});
			}
		});

		this.setState(nextState);
	};

	private rangeCheck = (draft: State, msg: string): void => {
		if (
			draft.start >= 0 &&
			draft.start <= draft.end &&
			draft.end <= this.LENGTH
		) {
			return;
		}

		throw new Error(`Out of range: ${msg}`);
	};
}
