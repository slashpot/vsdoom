import * as vscode from 'vscode';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	context.subscriptions.push(
		vscode.commands.registerCommand('vsdoom.start', () => {
		  // Create and show a new webview
		  const panel = vscode.window.createWebviewPanel(
			'vsdoom', // Identifies the type of the webview. Used internally
			'VsDoom', // Title of the panel displayed to the user
			vscode.ViewColumn.One, // Editor column to show the new webview panel in.
			{} // Webview options. More on these later.
		  );
		})
	  );
}

// This method is called when your extension is deactivated
export function deactivate() {}
