import {BoxProps} from '../index.js';

type BorderStyleHelper = Exclude<BoxProps['borderStyle'], undefined>;
export type BorderStyle = keyof Omit<
	{
		[P in BorderStyleHelper as P extends string ? P : never]: string;
	},
	'inherit'
>;
export type BorderConfiguration = {
	topLeft: string;
	top: string;
	topRight: string;
	left: string;
	bottomLeft: string;
	bottom: string;
	bottomRight: string;
	right: string;
};
type StyleUnits = {
	[P in BorderStyle]: string;
};
type Map = {[P in keyof BorderConfiguration]: StyleUnits};
type Return = {
	top: BorderConfiguration;
	bottom: BorderConfiguration;
};

const MAP: Map = {
	top: {
		round: '─',
		bold: '━',
		single: '─',
		double: '═',
		doubleSingle: '═',
		singleDouble: '─',
		arrow: '↓',
		classic: '-',
	},
	bottom: {
		round: '─',
		bold: '━',
		single: '─',
		double: '═',
		doubleSingle: '═',
		singleDouble: '─',
		arrow: '↑',
		classic: '-',
	},
	left: {
		round: '│',
		bold: '┃',
		single: '│',
		double: '║',
		doubleSingle: '│',
		singleDouble: '║',
		arrow: '→',
		classic: '|',
	},
	right: {
		round: '│',
		bold: '┃',
		single: '│',
		double: '║',
		doubleSingle: '│',
		singleDouble: '║',
		arrow: '←',
		classic: '|',
	},
	topLeft: {
		round: '╭',
		bold: '┏',
		single: '┌',
		double: '╔',
		doubleSingle: '╒',
		singleDouble: '╓',
		arrow: '↘',
		classic: '+',
	},
	topRight: {
		round: '╮',
		bold: '┓',
		single: '┐',
		double: '╗',
		doubleSingle: '╕',
		singleDouble: '╖',
		arrow: '↙',
		classic: '+',
	},
	bottomLeft: {
		round: '╰',
		bold: '┗',
		single: '└',
		double: '╚',
		doubleSingle: '╘',
		singleDouble: '╙',
		arrow: '↗',
		classic: '+',
	},
	bottomRight: {
		round: '╯',
		bold: '┛',
		single: '┘',
		double: '╝',
		doubleSingle: '╛',
		singleDouble: '╜',
		arrow: '↖',
		classic: '+',
	},
};

function shallow(borderStyle: BorderStyle): Return {
	const top = {} as BorderConfiguration;
	const bottom = {} as BorderConfiguration;

	for (const key in MAP) {
		(top as any)[key] = (MAP as any)[key][borderStyle];
		(bottom as any)[key] = (MAP as any)[key][borderStyle];
	}

	// overwrite bottom
	bottom.left = bottom.topRight;
	bottom.right = bottom.topLeft;
	bottom.top = ' ';
	bottom.topLeft = ' ';
	bottom.topRight = ' ';

	// overwrite top
	top.left = top.bottomRight;
	top.right = top.bottomLeft;
	top.bottom = ' ';
	top.bottomLeft = ' ';
	top.bottomRight = ' ';

	return {top, bottom};
}

function deep(borderStyle: BorderStyle): Return {
	const top = {} as BorderConfiguration;
	const bottom = {} as BorderConfiguration;

	for (const key in MAP) {
		(top as any)[key] = (MAP as any)[key][borderStyle];
		(bottom as any)[key] = (MAP as any)[key][borderStyle];
	}

	// overwrite bottom
	bottom.topLeft = MAP.topRight[borderStyle];
	bottom.topRight = MAP.topLeft[borderStyle];
	bottom.top = ' ';

	// overwrite top
	top.bottomLeft = MAP.bottomRight[borderStyle];
	top.bottomRight = MAP.bottomLeft[borderStyle];
	top.bottom = ' ';

	return {top, bottom};
}

export default {
	shallow,
	deep,
};
