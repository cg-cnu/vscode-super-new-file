'use strict';
import * as vscode from 'vscode';
import { dirname, join, normalize } from 'path';
import * as mkdfp from 'node-mkdirfilep';

export function activate(context: vscode.ExtensionContext) {

    let superNewFile = vscode.commands.registerCommand('superNewFile.create', () => {

        // get the active text editor
        const editor: vscode.TextEditor = vscode.window.activeTextEditor;
        // if no active text editor
        if (!editor){
            vscode.window.showWarningMessage("No file open.");
            return;
        }
        // get the selection 
        var selectedText: string = editor.document.getText(editor.selection);
        // if no selected text
        if (!selectedText) {
            vscode.window.showWarningMessage("No valid text selected.");
            return;
        }

        // get the current file
        const filePath: string = dirname(vscode.window.activeTextEditor.document.uri.fsPath);
        // remove special characters
        const specialChars = ["'", '"', '{', '}', '(', ')', '[', ']', '*', '+', '!', '@', '#', '$', '%', '^', '&', '=', '<', '>', '?', '`', '~']
        specialChars.forEach(char => selectedText = selectedText.replace(char, ""))
        // combine it with the file path
        const finalPath: string = normalize(join(filePath, selectedText));

        vscode.window.showInputBox({
            value: finalPath,
            ignoreFocusOut: true,
            prompt: "You want to create this folder ?",
            // TODO: select only folders to be created ? 
            // get the workspace name and select everything after that ?
            valueSelection: [-1, -1]
        }).then((modifiedPath) => {
            // create the file or folder
            mkdfp.create(modifiedPath);
        })
    });

    context.subscriptions.push(superNewFile);
}

export function deactivate() {
}