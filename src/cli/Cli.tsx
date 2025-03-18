import React from "react";
import { AbstractCli, CliProps } from "./AbstractCli.js";

export function Cli(props: CliProps): React.ReactNode {
	return <AbstractCli {...props} autoEnter={false} />;
}
