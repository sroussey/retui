import React from "react";
import { Window, WindowProps } from "../Window.js";

type ListSpecificProps<BatchItem = any> = {
	listView: WindowProps<BatchItem>["viewState"];
};

type Props<BatchItem extends any> = ListSpecificProps<BatchItem> &
	React.PropsWithChildren &
	Pick<
		WindowProps,
		| "alignItems"
		| "justifyContent"
		| "flexDirection"
		| "gap"
		// | 'wordList' TODO
		| "scrollbar"
		// | 'batchMap' // Pass 'BatchItem' generic to batchMap below (forward to Window component)
	> & {
		fitX?: boolean;
		fitY?: boolean;
	} & {
		batchMap?: WindowProps<BatchItem>["batchMap"];
	};

export function List<BatchItem extends any>({
	...props
}: Props<BatchItem>): React.ReactNode {
	props.fitX = props.fitX ?? false;
	props.fitY = props.fitY ?? false;

	const windowProps = {
		...props,
		viewState: props.listView,
		type: "ITEMS",
	} satisfies WindowProps<BatchItem>;

	return <Window {...windowProps}>{props.children}</Window>;
}
