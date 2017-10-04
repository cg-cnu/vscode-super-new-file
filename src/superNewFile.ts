'use strict';
import * as vscode from 'vscode';
import { lstatSync, existsSync } from 'fs';
import { dirname, join, normalize } from 'path';
import * as mkdfp from 'node-mkdirfilep';


const trimSpecialChars = (inputPath: string) => {
    // remove special characters from the selected path
    const specialChars = ["'", '"', '(', ')', '[', ']', '*', '+', '!', '@', '#', '%', '^', '&', '=', '<', '>', '?', '`', ':', ';', '?']
    specialChars.forEach(char => inputPath = inputPath.replace(char, ""))
    // remove spaces from the begining and end of the path
    inputPath = inputPath.trim()
    return inputPath
}

const expandVscodeVariables = (text: string) => {
    // ${workspaceRoot}
    text.replace('${workspaceRoot}', '')
    return text;
}

const expandPath = (inputPath: string) => {

    let finalPath: string;
    // get final path
    if (inputPath.startsWith('./') || inputPath.startsWith('../')) {
        // if the selected path starts with . or ..; it as relative path
        const currentFilePath: string = dirname(vscode.window.activeTextEditor.document.uri.fsPath);
        if (currentFilePath === '.') {
            vscode.window.showWarningMessage("File not saved. Can't create relative path.");
            return;
        }
        finalPath = normalize(join(currentFilePath, inputPath));

    } else if (inputPath.startsWith('~/')) {
        // if the selected path start with ~; resolve it cross platform way
        inputPath = inputPath.replace('~/', '')
        let homedir = process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'];
        finalPath = normalize(join(homedir, inputPath));

    } else {
        // else assume that the selected string is a full path;
        finalPath = normalize(inputPath);
    }
    return finalPath;
}

export function activate(context: vscode.ExtensionContext) {

    let superNewFile = vscode.commands.registerCommand('superNewFile.create', () => {

        // get the active text editor
        const editor: vscode.TextEditor = vscode.window.activeTextEditor;
        // if no active text editor
        if (!editor) {
            vscode.window.showErrorMessage("No file open.");
            return;
        }

        // get the selection 
        var selectedPath: string = editor.document.getText(editor.selection);
        // if no selcted path
        if (!selectedPath) {
            vscode.window.showErrorMessage("No selected path");
            return;
        }

        // FIXME: refactor; looking ugly
        selectedPath = trimSpecialChars(selectedPath);
        selectedPath = expandPath(selectedPath);
        if(!selectedPath){
            return;
        }
        selectedPath = expandVscodeVariables(selectedPath);

        vscode.window.showInputBox({
            value: selectedPath,
            ignoreFocusOut: true,
            prompt: "Create ?",
            valueSelection: [-1, -1]
        }).then((modifiedPath) => {
            // create the file or folder
            if (modifiedPath) {
                if (existsSync(modifiedPath)) {
                    vscode.window.showWarningMessage("Path already exists.");
                    return;
                }
                mkdfp.create(modifiedPath);
                // TODO: Needed a callback from mkdfp
                if (lstatSync(modifiedPath).isFile()) {
                    vscode.workspace.openTextDocument(modifiedPath)
                        .then((textDocument) => {
                            if (textDocument) {
                                vscode.window.showTextDocument(textDocument);
                            }
                            else {
                                vscode.window.showErrorMessage("Couldn't open the document!");
                            }
                        });
                }
            }
        })
    });

    context.subscriptions.push(superNewFile);
}

export function deactivate() {
}