import {useWindow} from '../useWindow.js';

type Args<T extends any[] | readonly any[] | number> = Parameters<
	typeof useWindow<T>
>;
type UseWindowReturn<T extends any[] | readonly any[] | number> = ReturnType<
	typeof useWindow<T>
>;
type UseListReturn<T extends any[] | readonly any[] | number> = {
	listView: UseWindowReturn<T>['viewState'];
	control: UseWindowReturn<T>['control'];
	items: UseWindowReturn<T>['items'];
	setItems: UseWindowReturn<T>['setItems'];
};

export function useList<T extends readonly any[] | any[] | number>(
	...args: Args<T>
): UseListReturn<T> {
	const list = useWindow(...args);
	return {
		listView: list.viewState,
		control: list.control,
		items: list.items,
		setItems: list.setItems,
	};
}
