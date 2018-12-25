const vscode = require('vscode');

const insertText = (val) => {
    const editor = vscode.window.activeTextEditor;

    if (!editor) {
        vscode.window.showErrorMessage('Can\'t insert log because no document is open');
        return;
    }

    const selection = editor.selection;

    const range = new vscode.Range(selection.start, selection.end);

    editor.edit((editBuilder) => {
        editBuilder.replace(range, val);
    });
}

function getAllLogStatements(document, documentText) {
    let logStatements = [];

    const logRegex = /console.(log|debug|info|warn|error|assert|dir|dirxml|trace|group|groupEnd|time|timeEnd|profile|profileEnd|count)\((.*)\);?/g;
    let match;
    while (match = logRegex.exec(documentText)) {
        let matchRange =
            new vscode.Range(
                document.positionAt(match.index),
                document.positionAt(match.index + match[0].length)
            );
        if (!matchRange.isEmpty)
            logStatements.push(matchRange);
    }
    return logStatements;
}

function deleteFoundLogStatements(workspaceEdit, docUri, logs) {
    logs.forEach((log) => {
        workspaceEdit.delete(docUri, log);
    });

    vscode.workspace.applyEdit(workspaceEdit).then(() => {
        logs.length > 1
            ? vscode.window.showInformationMessage(`${logs.length} console.logs deleted`)
            : vscode.window.showInformationMessage(`${logs.length} console.log deleted`);
    });
}

function showOrOpenFile(path){
    let opened = false;
    return new Promise((resolve, reject) => {
        let opened = false;
        // vscode.workspace.textDocuments.forEach((doc) => {
        // });
    
        // try to find opened document.
        vscode.window.visibleTextEditors.forEach(textEditor => {
          if (textEditor.document.fileName === path) {
            opened = true;
            vscode.window
              .showTextDocument(textEditor.document, textEditor.viewColumn)
              .then(
                () => {
                  resolve(textEditor.document);
                },
                err => {
                  reject(err);
                }
              );
          }
        });
    
        if (!opened) {
          vscode.workspace.openTextDocument(path).then(
            doc => {
              vscode.window.showTextDocument(doc, vscode.ViewColumn).then(
                () => {
                  resolve(doc);
                },
                err => {
                  reject(err);
                }
              );
            },
            err => {
              reject(err);
            }
          );
        }
      });
}

function activate(context) {
    console.log('console-log-utils is now active');

    const insertLogStatement = vscode.commands.registerCommand('extension.insertLogStatement', () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) { return; }

        const selection = editor.selection;
        const text = editor.document.getText(selection);

        text
            ? vscode.commands.executeCommand('editor.action.insertLineAfter')
                .then(() => {
                    const str = `${text}`.replace(/\'|\"/g,'');
                    const logToInsert = `console.log('%c${str}: ','color: MidnightBlue; background: Aquamarine;',${text});`;
                    insertText(logToInsert);
                })
            : insertText('console.log();');

    });
    context.subscriptions.push(insertLogStatement);

    const deleteAllLogStatements = vscode.commands.registerCommand('extension.deleteAllLogStatements', () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) { return; }

        const document = editor.document;
        const documentText = editor.document.getText();

        let workspaceEdit = new vscode.WorkspaceEdit();

        const logStatements = getAllLogStatements(document, documentText);

        deleteFoundLogStatements(workspaceEdit, document.uri, logStatements);
    });
    context.subscriptions.push(deleteAllLogStatements);

    const switchFile = vscode.commands.registerCommand('extension.switchFile',()=>{
        if (!vscode.workspace) {
            return;
        }
        const editor = vscode.window.activeTextEditor;
        if (!editor) { 
            vscode.window.showInformationMessage('没有可切换的文件！');
            return; 
        }
        // 当前文件
        const currentFile = editor.document.fileName;
        const aFile = currentFile.split('\\');
        aFile.pop();
        const filePath = aFile.join('\\')
        // 查找工作区下面的文件
        vscode.workspace.findFiles('', '**/node_modules/**', 10).then(files=>{
            const showFiles = [];
            for(let file of files){
                if(file.fsPath.startsWith(filePath) && file.fsPath != currentFile){
                    const fs = file.fsPath.split('\\');
                    showFiles.push({
                        label:fs[fs.length - 1],
                        description:file.fsPath
                    })
                }
            }
            vscode.window.showQuickPick(showFiles)
            .then(
                command => showOrOpenFile(command.description).then(re=>{})
            );
            //vscode.window.showInformationMessage(files.fsPath)
        })
    })
    context.subscriptions.push(switchFile);
    
}
exports.activate = activate;

function deactivate() {
}

exports.deactivate = deactivate;
