import React from 'react';
import {BaseProps} from '../baseProps.js';
import {TextProps} from '../index.js';

export type LineStyleOptions = Pick<
	TextProps,
	'color' | 'bold' | 'dimColor' | 'backgroundColor'
>;

export type IntrinsicLineProps = BaseProps & {
	direction: 'horizontal' | 'vertical';
	char?: string;
};
export function Line({...props}: IntrinsicLineProps): React.ReactNode {
	if (props.direction === 'horizontal') {
		props.width = props.width ?? '100';
	} else {
		props.height = props.height ?? '100';
	}

	props.position = 'relative';
	props.flexGrow = props.flexGrow ?? 0;
	props.flexShrink = props.flexShrink ?? 1;

	return <ink-line style={{...props}} />;
}

type Props = {
	length?: BaseProps['height'];
	minLength?: BaseProps['minHeight'];
	char?: string;
} & LineStyleOptions;

export function VerticalLine(props: Props): React.ReactNode {
	const {length, minLength, ...rest} = props;

	const lineProps: IntrinsicLineProps = {
		height: length,
		minHeight: minLength,
		width: 1,
		direction: 'vertical',
		...rest,
	};

	return <Line {...lineProps} />;
}

export function HorizontalLine(props: Props): React.ReactNode {
	const {length, minLength, ...rest} = props;

	const lineProps: IntrinsicLineProps = {
		width: length,
		minWidth: minLength,
		height: 1,
		direction: 'horizontal',
		...rest,
	};

	return <Line {...lineProps} />;
}
