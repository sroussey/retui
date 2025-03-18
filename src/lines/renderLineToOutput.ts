import chalk from "chalk";
import colorize from "../colorize.js";
import { DOMElement } from "../index.js";
import Output from "../output.js";

export function renderLineToOutput(
	x: number,
	y: number,
	node: DOMElement,
	output: Output,
): void {
	const height = node.yogaNode!.getComputedHeight();
	const width = node.yogaNode!.getComputedWidth();

	const rowChar = "─";
	const colChar = "│";

	let outputLine = "";

	if (node.style.direction === "horizontal") {
		outputLine += rowChar.repeat(width);
	}

	if (node.style.direction === "vertical") {
		outputLine += `${colChar}\n`.repeat(height);
	}

	if (node.style.color) {
		outputLine = colorize(outputLine, node.style.color, "foreground");
	}
	if (node.style.dimColor) {
		outputLine = chalk.dim(outputLine);
	}
	if (node.style.bold) {
		outputLine = chalk.bold(outputLine);
	}

	output.write(x, y, outputLine, { transformers: [] });
}
