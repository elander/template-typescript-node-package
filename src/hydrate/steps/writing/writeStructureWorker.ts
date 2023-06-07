import * as fs from "node:fs/promises";

import * as path from "path";
import prettier from "prettier";

import { Structure } from "./types.js";

export async function writeStructureWorker(
	structure: Structure,
	basePath: string
) {
	await fs.mkdir(basePath, { recursive: true });

	for (const [fileName, contents] of Object.entries(structure)) {
		if (typeof contents === "string") {
			await fs.writeFile(
				path.join(basePath, fileName),
				format(fileName, contents)
			);
		} else {
			await writeStructureWorker(contents, path.join(basePath, fileName));
		}
	}
}

function format(fileName: string, text: string) {
	const parser = inferParser(fileName, text);
	if (!parser) {
		return text;
	}

	return prettier.format(text, {
		useTabs: true,
		parser,
	});
}

function inferParser(fileName: string, text: string) {
	if (text.startsWith("{")) {
		return "json";
	}

	switch (fileName.split(".").at(-1)) {
		case "cjs":
		case "js":
			return "babel";
		case "json":
			return "json";
		case "md":
			return "markdown";
		case "yml":
			return "yaml";
	}

	return undefined;
}