import React from 'react';
import {Box, BoxProps} from '../index.js';

export type VerticalProps = {
	color?: BoxProps['borderColor'];
	hidden?: boolean;
} & Pick<
	BoxProps,
	| 'flexShrink'
	| 'flexGrow'
	| 'flexBasis'
	| 'height'
	| 'minHeight'
	| 'padding'
	| 'paddingX'
	| 'paddingY'
	| 'paddingTop'
	| 'paddingLeft'
	| 'paddingRight'
	| 'paddingBottom'
	| 'position'
	| 'margin'
	| 'marginX'
	| 'marginY'
	| 'marginTop'
	| 'marginLeft'
	| 'marginRight'
	| 'marginBottom'
>;

export function VerticalLine(props: VerticalProps): React.ReactNode {
	const left = props.hidden ? ' ' : '▕';
	const right = props.hidden ? ' ' : '▏';

	return (
		<Box
			{...props}
			flexShrink={0}
			borderColor={props.color}
			borderStyle={{
				left: left,
				right: right,
				topLeft: left,
				topRight: right,
				bottomLeft: left,
				bottomRight: right,
				top: '',
				bottom: '',
			}}
		></Box>
	);
}

export type HorizontalProps = Omit<VerticalProps, 'height' | 'minHeight'> &
	Pick<BoxProps, 'width' | 'minWidth'> & {
		linePosition?: 'top' | 'bottom';
	};

export function HorizontalLine(props: HorizontalProps): React.ReactNode {
	const linePosition = props.linePosition ?? 'top';

	let borderTop: boolean = false;
	let borderBottom: boolean = false;
	if (!props.hidden && linePosition === 'top') {
		borderTop = true;
	}
	if (!props.hidden && linePosition === 'bottom') {
		borderBottom = true;
	}

	return (
		<Box
			{...props}
			flexShrink={0}
			borderColor={props.color}
			borderStyle="single"
			borderTop={borderTop}
			borderBottom={borderBottom}
			borderLeft={false}
			borderRight={false}
			width={props.width ?? '100'}
		></Box>
	);
}
