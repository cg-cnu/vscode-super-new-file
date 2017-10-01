'use strict';
import * as vscode from 'vscode';
import { dirname, join, normalize } from 'path';

export function activate(context: vscode.ExtensionContext) {

    let superNewFile = vscode.commands.registerCommand('extension.sayHello', () => {
        // get the current file
        const filePath: string = dirname(vscode.window.activeTextEditor.document.uri.fsPath);
        // get the active text editor
        const editor: vscode.TextEditor = vscode.window.activeTextEditor;
        // get the selection 
        var selectedText: string = editor.document.getText(editor.selection);

        // remove special characters
        const specialChars = ["'", '"', '{', '}', '(', ')', '[', ']', '*', '+', '!', '@', '#', '$', '%', '^', '&', '=', '<', '>', '?', '`', '~']
        specialChars.forEach(char => selectedText = selectedText.replace(char, ""))
        // return if no selected text
        if (!selectedText) {
            vscode.window.showWarningMessage("No valid text selected!");
            return;
        }
        // combine it with the file path
        const finalPath: string = normalize(join(filePath, selectedText));

        // regex the path from it ?
        // Display a message box to the user ?
        // vscode.window.showInformationMessage(finalPath);
        vscode.window.showInputBox({
            value: finalPath,
            ignoreFocusOut: true,
            prompt: "You want to create this folder ?",
            // TODO: select only the to be created ? 
            // get the workspace name and select everything after that ?
            valueSelection: [-1, -1]
        }).then(() => {
            console.log("creating the folder");
        })
        // create the file or folder
        // mkdirp(text);
    });

    context.subscriptions.push(superNewFile);
}

// this method is called when your extension is deactivated
export function deactivate() {
}