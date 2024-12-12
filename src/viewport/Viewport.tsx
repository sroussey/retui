import React, {useEffect, useState} from 'react';
import Box from '../components/Box.js';
import {BoxProps, useStdout} from '../index.js';

export type Props = Omit<
	BoxProps,
	'height' | 'width' | 'minHeight' | 'minWidth' | 'alignSelf'
> &
	React.PropsWithChildren;

type Dimensions = {height: number; width: number};

export function Viewport(props: Props): React.ReactNode {
	const {height, width} = useViewport();

	return (
		<Box {...props} height={height} width={width}>
			{props.children}
		</Box>
	);
}

function useViewport(): Dimensions {
	const {stdout} = useStdout();

	const [dimensions, setDimensions] = useState<Dimensions>({
		height: stdout.rows,
		width: stdout.columns,
	});

	useEffect(() => {
		const updateDimensions = () => {
			setDimensions({height: stdout.rows, width: stdout.columns});
		};

		stdout.on('resize', updateDimensions);

		return () => {
			stdout.off('resize', updateDimensions);
		};
	}, [stdout]);

	return dimensions;
}
