import { normalize } from "node:path";

import * as vscode from "vscode";

export function activate(context: vscode.ExtensionContext) {
	const is_windows = process.platform === "win32";

	let disposable = vscode.commands.registerCommand(
		"extension.insertPathCommand",
		is_windows ? insert_path_windows : insert_path_raw,
	);
	context.subscriptions.push(disposable);

	disposable = vscode.commands.registerCommand(
		"extension.insertFolderPathCommand",
		is_windows ? insert_folder_path_windows : insert_folder_path_raw,
	);
	context.subscriptions.push(disposable);

	disposable = vscode.commands.registerCommand(
		"extension.insertPath",
		is_windows ? insert_path_windows : insert_path_raw,
	);
	context.subscriptions.push(disposable);

	disposable = vscode.commands.registerCommand(
		"extension.insertFolderPath",
		is_windows ? insert_folder_path_windows : insert_folder_path_raw,
	);
	context.subscriptions.push(disposable);

	if (is_windows) {
		disposable = vscode.commands.registerCommand(
			"extension.insertPathEscaped",
			insert_path_escaped,
		);
		context.subscriptions.push(disposable);

		disposable = vscode.commands.registerCommand(
			"extension.insertFolderPathEscaped",
			insert_folder_path_escaped,
		);
		context.subscriptions.push(disposable);

		disposable = vscode.commands.registerCommand(
			"extension.insertPathRaw",
			insert_path_raw,
		);
		context.subscriptions.push(disposable);

		disposable = vscode.commands.registerCommand(
			"extension.insertFolderPathRaw",
			insert_folder_path_raw,
		);
		context.subscriptions.push(disposable);
	}
}

export function deactivate() {}

async function insert_path_raw() {
	insert_text(await get_path());
}

async function insert_folder_path_raw() {
	insert_text(await get_path(true));
}

async function insert_path_windows() {
	insert_text(normalize_windows_path(await get_path()));
}

async function insert_folder_path_windows() {
	insert_text(normalize_windows_path(await get_path(true)));
}

async function insert_path_escaped() {
	const path = normalize_windows_path(await get_path());

	if (path) insert_text(path.replace(/\\/g, "\\\\"));
}

async function insert_folder_path_escaped() {
	const path = normalize_windows_path(await get_path(true));

	if (path) insert_text(path.replace(/\\/g, "\\\\"));
}

function normalize_windows_path(path: string | null) {
	let the_path = path;

	if (the_path) {
		if (the_path.match(/^\/[a-z]:/i)) the_path = the_path.substring(1);
		the_path = normalize(the_path);
	}

	return the_path;
}

async function get_path(folder = false) {
	return (
		(
			await vscode.window.showOpenDialog({
				canSelectFiles: !folder,
				canSelectFolders: folder,
				canSelectMany: false,
			})
		)?.[0]?.path ?? null
	);
}

function insert_text(text: string | null) {
	if (text) {
		const editor = vscode.window.activeTextEditor;

		if (editor) {
			editor.edit((editBuilder) => {
				editBuilder.insert(editor.selection.active, text);
			});
		}
	}
}
