import React from 'react';
import {Window, WindowProps} from '../Window.js';
import {useList} from './useList.js';

type ListSpecificProps = {
	listView: WindowProps['viewState'];
};

type Props = Omit<WindowProps, 'type' | 'viewState'> & ListSpecificProps;

export function List(props: Props): React.ReactNode {
	const windowProps = {
		...props,
		viewState: props.listView,
		type: 'ITEMS',
	} satisfies WindowProps;

	return <Window {...windowProps}>{props.children}</Window>;
}
