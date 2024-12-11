import React from 'react';
import {Window, WindowProps} from '../Window.js';

type ListSpecificProps = {
	listView: WindowProps['viewState'];
};

type Props = ListSpecificProps &
	React.PropsWithChildren &
	Pick<
		WindowProps,
		| 'alignItems'
		| 'justifyContent'
		| 'flexDirection'
		| 'gap'
		// | 'wordList' TODO
		| 'scrollbar'
	>;

export function List(props: Props): React.ReactNode {
	const windowProps = {
		...props,
		viewState: props.listView,
		type: 'ITEMS',
	} satisfies WindowProps;

	return <Window {...windowProps}>{props.children}</Window>;
}
