import { Node as YogaNode } from "yoga-wasm-web";
import { DOMElement } from "../dom.js";

/*
 * Determines the position of a component on the screen in order to properly trigger
 * mouse events. The YogaNode methods provided to calculate layout only take into
 * account position relative to the parent node.  In order to get the full screen position
 * you must work backwards up to the root node.  This also means that CornerPositions
 * will not be accurate if not using viewport dimensions.
 * */

// x,y coordinates of each corner of a component as positioned within the entire screen
export type CornerPositions = {
	topLeft: [number, number];
	topRight: [number, number];
	bottomLeft: [number, number];
	bottomRight: [number, number];
};

export default class ElementPosition {
	public static getNode(ref: DOMElement): YogaNode {
		return ref.yogaNode as YogaNode;
	}

	private static getSx(node: YogaNode): number {
		return node.getComputedLeft();
	}

	private static getSy(node: YogaNode): number {
		return node.getComputedTop();
	}

	private static getDx(node: YogaNode): number {
		return node.getComputedWidth();
	}

	private static getDy(node: YogaNode): number {
		return node.getComputedHeight();
	}

	// Builds a MouseTypes.CornerPositions object based on the top-left coordinates of the
	// parent node.
	private static buildRelativePosition(
		node: YogaNode,
		sx?: number,
		sy?: number,
	): CornerPositions {
		sx = sx ?? this.getSx(node);
		sy = sy ?? this.getSy(node);
		const dx = this.getDx(node);
		const dy = this.getDy(node);

		const topLeft = [sx, sy];
		const topRight = [sx + dx, sy];
		const bottomLeft = [sx, sy + dy];
		const bottomRight = [sx + dx, sy + dy];
		return { topLeft, topRight, bottomLeft, bottomRight } as CornerPositions;
	}

	private static applyParentOffset(
		childNode: YogaNode,
		child: CornerPositions,
		parent: CornerPositions,
	): CornerPositions {
		child.topLeft[0] += parent.topLeft[0];
		child.topLeft[1] += parent.topLeft[1];
		const nextChildPosition = this.buildRelativePosition(
			childNode,
			child.topLeft[0],
			child.topLeft[1],
		);
		return nextChildPosition;
	}

	public static getScreenPosition(childNode: YogaNode): CornerPositions {
		let childPos = this.buildRelativePosition(childNode);
		let parentNode = childNode.getParent();
		while (parentNode) {
			const parentPos = this.buildRelativePosition(parentNode);
			childPos = this.applyParentOffset(childNode, childPos, parentPos);
			parentNode = parentNode.getParent();
		}

		return childPos;
	}

	public static containsPoint(x: number, y: number, pos: CornerPositions): boolean {
		if (x < pos.topLeft[0]) return false;
		if (x >= pos.topRight[0]) return false;
		if (y < pos.topLeft[1]) return false;
		if (y >= pos.bottomLeft[1]) return false;

		return true;
	}
}
