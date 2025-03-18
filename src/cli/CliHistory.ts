class CliHistoryBuilder {
	private history: { [idx: number]: string };
	private set: Set<string>;
	private idx: number;

	constructor() {
		this.history = {};
		this.set = new Set();
		this.idx = 0;
	}

	/*
	 * history indexes start at 1 because they are based on set size
	 * */
	public push = (cliInput: string): void => {
		if (!cliInput) return;

		if (!this.set.has(cliInput)) {
			this.set.add(cliInput);
			this.history[this.set.size - 1] = cliInput;
		}
	};

	public current = (): string => {
		const current = this.history[this.idx];
		return current ?? "";
	};

	public next = (): string => {
		if (this.idx < this.set.size - 1) {
			++this.idx;
		} else {
			this.idx = 0;
		}

		return this.current();
	};

	public prev = (): string => {
		if (this.idx > 0) {
			--this.idx;
		} else {
			this.idx = this.set.size - 1;
		}

		return this.current();
	};

	public resetIdx = (): void => {
		this.idx = 0;
	};
}

export const CliHistory = new CliHistoryBuilder();
