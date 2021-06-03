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
      editBuilder.insert(selection.start, val)
  });
}

const insertLogStatement = vscode.commands.registerCommand('extension.insertLogStatement', () => {
  const editor = vscode.window.activeTextEditor;
  if (!editor) { return; }

  const selection = editor.selection;
  const text = editor.document.getText(selection);

  text
      ? vscode.commands.executeCommand('editor.action.insertLineAfter')
          .then(() => {
              const str = `${text}`.replace(/\'|\"/g,'');
              const logToInsert = `console.log('%c${str}: ', 'color: MidnightBlue; background: Aquamarine;', ${text});`;
              insertText(logToInsert);
          })
      : insertText('console.log();');

});

module.exports = insertLogStatement;
