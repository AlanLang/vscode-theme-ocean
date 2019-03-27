const vscode = require('vscode');
const util = require('./util');

// TODO: 123
const listTodo = (workspaceState) => {
  return vscode.commands.registerCommand('extension.listTodo', () => {
    util.searchAnnotations(workspaceState);
  })
}

module.exports = listTodo;