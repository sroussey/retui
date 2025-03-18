type Console = { enabled: boolean; path: string };

export const Console: Console = {
	enabled: false,
	path: "console.log",
};

export function setConsole(file: string): void;
export function setConsole(enabled: boolean): void;
export function setConsole(config: Console): void;
export function setConsole(fileEnabledOrConfig: string | boolean | Console): void {
	if (typeof fileEnabledOrConfig === "string") {
		if (fileEnabledOrConfig) {
			Console.path = fileEnabledOrConfig;
			Console.enabled = true;
		}
		return;
	}

	if (typeof fileEnabledOrConfig === "boolean") {
		Console.enabled = fileEnabledOrConfig;
	}

	if (typeof fileEnabledOrConfig === "object") {
		Console.enabled = fileEnabledOrConfig.enabled ?? Console.enabled;
		if (fileEnabledOrConfig.path) {
			Console.path = fileEnabledOrConfig.path;
		}
	}
}
