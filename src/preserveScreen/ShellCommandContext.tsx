import React, { createContext, useContext, PropsWithChildren, useState } from "react";
import { executeShellCommand } from "./executeShellCommand.js";
import assert from "assert";

export type ShellCommandContext = {
	render: () => void;
};

export const ShellCommandContext = createContext<ShellCommandContext | null>(null);

export function useShellCommand() {
	const ctx = useContext(ShellCommandContext);
	assert(ctx);

	return {
		exec: (
			...args: Parameters<typeof executeShellCommand>
		): Promise<number | null> => {
			const [cmd, message] = args;
			return executeShellCommand(cmd, message)(ctx.render);
		},
	};
}

export function ShellCommmandProvider(props: PropsWithChildren): React.ReactNode {
	const [count, setCount] = useState(0);

	const render = () => setCount(count + 1);

	return (
		<ShellCommandContext.Provider value={{ render }}>
			{props.children}
		</ShellCommandContext.Provider>
	);
}
