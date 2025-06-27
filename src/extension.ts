// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';

export function activate(context: vscode.ExtensionContext) {
	console.log('Congratulations, your extension "gemini-key-router" is now active!');

	let panel1: vscode.WebviewPanel | undefined;
	let panel2: vscode.WebviewPanel | undefined;

	context.subscriptions.push(
		vscode.commands.registerCommand('gemini-key-router.openPanel1', () => {
			if (panel1) {
				panel1.reveal(vscode.ViewColumn.One);
			} else {
				panel1 = vscode.window.createWebviewPanel(
					'panel1',
					'Panel 1',
					vscode.ViewColumn.One,
					{
						enableScripts: true,
						localResourceRoots: [vscode.Uri.joinPath(context.extensionUri, 'webview-ui', 'dist')]
					}
				);
				panel1.webview.html = getWebviewContent(context, panel1.webview, 'panel1');
				panel1.onDidDispose(() => {
					panel1 = undefined;
				}, null, context.subscriptions);
			}
		})
	);

	context.subscriptions.push(
		vscode.commands.registerCommand('gemini-key-router.openPanel2', () => {
			if (panel2) {
				panel2.reveal(vscode.ViewColumn.Two);
			} else {
				panel2 = vscode.window.createWebviewPanel(
					'panel2',
					'Panel 2',
					vscode.ViewColumn.Two,
					{
						enableScripts: true,
						localResourceRoots: [vscode.Uri.joinPath(context.extensionUri, 'webview-ui', 'dist')]
					}
				);
				panel2.webview.html = getWebviewContent(context, panel2.webview, 'panel2');
				panel2.onDidDispose(() => {
					panel2 = undefined;
				}, null, context.subscriptions);
			}
		})
	);
}

function getWebviewContent(context: vscode.ExtensionContext, webview: vscode.Webview, panelType: string) {
	const htmlPath = vscode.Uri.joinPath(context.extensionUri, 'webview-ui', 'dist', 'index.html');
	let htmlContent = fs.readFileSync(htmlPath.fsPath, 'utf8');

	const nonce = getNonce();

	// 從 index.html 中提取實際的 script 和 style 路徑
	const scriptMatch = htmlContent.match(/<script type="module" crossorigin src="(\/assets\/index-[a-zA-Z0-9]+\.js)"><\/script>/);
	const styleMatch = htmlContent.match(/<link rel="stylesheet" crossorigin href="(\/assets\/index-[a-zA-Z0-9]+\.css)">/);

	let finalHtmlContent = htmlContent;

	if (scriptMatch && scriptMatch[1]) {
		const scriptPath = scriptMatch[1]; // 例如：/assets/index-Dd6o8RYf.js
		const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(context.extensionUri, 'webview-ui', 'dist', scriptPath));
		finalHtmlContent = finalHtmlContent.replace(scriptMatch[0], `<script type="module" src="${scriptUri}" nonce="${nonce}"></script>`);
	}

	if (styleMatch && styleMatch[1]) {
		const stylePath = styleMatch[1]; // 例如：/assets/index-D8b4DHJx.css
		const styleUri = webview.asWebviewUri(vscode.Uri.joinPath(context.extensionUri, 'webview-ui', 'dist', stylePath));
		finalHtmlContent = finalHtmlContent.replace(styleMatch[0], `<link rel="stylesheet" href="${styleUri}" nonce="${nonce}">`);
	}

	finalHtmlContent = finalHtmlContent
		.replace('</head>', `<script nonce="${nonce}">window.panelType = '${panelType}';</script></head>`)
		.replace(/<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src {{cspSource}}; script-src 'nonce-{{nonce}}';">/g, `<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource}; script-src 'nonce-${nonce}';">`);

	return finalHtmlContent;

	return htmlContent;
}

function getNonce() {
	let text = '';
	const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	for (let i = 0; i < 32; i++) {
		text += possible.charAt(Math.floor(Math.random() * possible.length));
	}
	return text;
}

export function deactivate() {}
