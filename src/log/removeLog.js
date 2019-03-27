const vscode = require('vscode');

const deleteAllLogStatements = vscode.commands.registerCommand('extension.deleteAllLogStatements', () => {
  const editor = vscode.window.activeTextEditor;
  if (!editor) { return; }

  const document = editor.document;
  const documentText = editor.document.getText();

  let workspaceEdit = new vscode.WorkspaceEdit();

  const logStatements = getAllLogStatements(document, documentText);

  deleteFoundLogStatements(workspaceEdit, document.uri, logStatements);
});

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

module.exports = deleteAllLogStatements;
