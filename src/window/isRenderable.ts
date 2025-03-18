import React from "react";

/*
 * This won't catch boolean, string, number types but that way errors will
 * fall through and be easier to trace
 * */
export function isRenderable(val: Function | React.ReactNode): boolean {
	if (React.isValidElement(val)) {
		return true;
	} else if (val === null) {
		return true;
	} else if (typeof val !== "object" && typeof val !== "function") {
		return true;
	} else {
		return false;
	}
}
