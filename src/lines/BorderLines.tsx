import React from 'react';
import Box from '../components/Box.js';
import {BoxProps} from '../index.js';

type BorderProps = Omit<
	BoxProps,
	| 'borderTop'
	| 'borderBottom'
	| 'borderLeft'
	| 'borderRight'
	| 'flexShrink'
	| 'flexGrow'
	| 'flexBasis'
> &
	React.PropsWithChildren;

function Abstract(
	props: BorderProps & {
		borders: {t: boolean; b: boolean; l: boolean; r: boolean};
	},
): React.ReactNode {
	let {borderStyle, width, justifyContent, ...rest} = props;

	borderStyle = borderStyle ?? 'single';
	width = width ?? '100';
	justifyContent = justifyContent ?? 'center';

	return (
		<Box
			{...rest}
			borderStyle={borderStyle}
			width={width}
			justifyContent={justifyContent}
			flexShrink={0}
			borderTop={props.borders.t}
			borderBottom={props.borders.b}
			borderLeft={props.borders.l}
			borderRight={props.borders.r}
		>
			{props.children}
		</Box>
	);
}

export function Underline(props: BorderProps): React.ReactNode {
	const borders = {
		t: false,
		b: true,
		l: false,
		r: false,
	};

	return (
		<Abstract {...props} borders={borders}>
			{props.children}
		</Abstract>
	);
}

export function Overline(props: BorderProps): React.ReactNode {
	const borders = {
		t: true,
		b: false,
		l: false,
		r: false,
	};

	return (
		<Abstract {...props} borders={borders}>
			{props.children}
		</Abstract>
	);
}
