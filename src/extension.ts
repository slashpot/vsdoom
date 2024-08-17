import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";

export function activate(context: vscode.ExtensionContext) {
  let panel: vscode.WebviewPanel | undefined = undefined;
  context.subscriptions.push(
    vscode.commands.registerCommand("vsdoom.start", () => {
      // Create and show a new webview
      panel = vscode.window.createWebviewPanel(
        "vsdoom", // Identifies the type of the webview. Used internally
        "VsDoom", // Title of the panel displayed to the user
        vscode.ViewColumn.One, // Editor column to show the new webview panel in.
        {
          enableScripts: true,
          retainContextWhenHidden: true,
          // Only allow the webview to access resources in our extension's media directory
          localResourceRoots: [
            vscode.Uri.joinPath(context.extensionUri, "src", "doom"),
          ],
        } // Webview options. More on these later.
      );

      const htmlPath = vscode.Uri.joinPath(
        context.extensionUri,
        "src",
        "doom",
        "index.html"
      );
      let htmlContent = fs.readFileSync(htmlPath.fsPath, "utf8");

      const jsPath = vscode.Uri.joinPath(
        context.extensionUri,
        "src",
        "doom",
        "websockets-doom.js"
      );
      const jsSrc = panel.webview.asWebviewUri(jsPath);

      const wadPath = vscode.Uri.joinPath(
        context.extensionUri,
        "src",
        "doom",
        "doom1.wad"
      );
      const wadSrc = panel.webview.asWebviewUri(wadPath);

      const cfgPath = vscode.Uri.joinPath(
        context.extensionUri,
        "src",
        "doom",
        "default.cfg"
      );
      const cfgSrc = panel.webview.asWebviewUri(cfgPath);

      // Replace any instances of ${webview.cspSource} with the actual CSP source
      htmlContent = htmlContent.replace(
        /\$\{webview\.cspSource\}/g,
        panel.webview.cspSource
      );

      htmlContent = htmlContent
        .replace("{{jsSrc}}", jsSrc.toString())
        .replace("{{wad}}", wadSrc.toString())
        .replace("{{cfg}}", cfgSrc.toString());

      panel.webview.html = htmlContent;

      panel.webview.onDidReceiveMessage(
        async (message) => {
          switch (message.command) {
            case "saveGame":
              const storagePath = context.globalStorageUri.fsPath;
              if (!fs.existsSync(storagePath)) {
                fs.mkdir(storagePath, { recursive: true }, (err) => {
                  if (err) {
                    vscode.window.showErrorMessage(err.message);
                  }
                });
              }

              const filePath = path.join(storagePath, message.fileName);
              fs.writeFile(
                filePath,
                Buffer.from(message.data, "base64"),
                (err) => {
                  if (err) {
                    vscode.window.showErrorMessage(err.message);
                  }
                }
              );

              vscode.window.showInformationMessage("Game saved successfully.");
              break;
          }
        },
        undefined,
        context.subscriptions
      );
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("vsdoom.savegame", () => {
      if (!panel) {
        return;
      }
      panel.webview.postMessage({ command: "save game" });
    })
  );
}

export function deactivate() {}
