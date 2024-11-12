import React, {forwardRef, PropsWithChildren} from 'react';
import Box from '../components/Box.js';
import {Props as BoxProps} from '../components/Box.js';
import {DOMElement, Text} from '../index.js';
import {useResponsiveDimensions} from '../useResponsiveDimensions/useResponsiveDimensions.js';

export type Props = BoxProps & {
	backgroundColor?: BoxProps['borderColor'];
} & PropsWithChildren;

const BoxWithBg = forwardRef<DOMElement, Props>(
	(props, ref): React.ReactNode => {
		return (
			<Box {...props} ref={ref}>
				<FillBg backgroundColor={props.backgroundColor} />
				{props.children}
			</Box>
		);
	},
);

function FillBg({
	backgroundColor,
}: {
	backgroundColor: BoxProps['borderColor'];
}): React.ReactNode {
	const {height, width, ref} = useResponsiveDimensions();

	return (
		<Box
			ref={ref as any}
			position="absolute"
			height="100"
			width="100"
			flexDirection="column"
		>
			{backgroundColor &&
				height &&
				width &&
				new Array(height).fill(null).map((_, idx) => {
					return (
						<Text key={idx} backgroundColor={backgroundColor}>
							{' '.repeat(width)}
						</Text>
					);
				})}
		</Box>
	);
}

export {BoxWithBg as Box};
