import React, {useEffect} from 'react';
import useKeymap from '../Stdin/KeyboardInputHooks/useKeymap.js';
import Text from '../components/Text.js';

/*
 * Should be able to do RegisterState.Text to style the output
 * */

export function RegisterState(): React.ReactNode {
	const {event, register} = useKeymap(
		{},
		{trackState: true, priority: 'always'},
	);

	useEffect(() => {
		//
	}, []);

	const text = event ? event : register;
	return <Text>{text}</Text>;
}
