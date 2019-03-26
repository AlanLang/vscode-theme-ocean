const vscode = require('vscode');
const util = require('./util');

// TODO: 123
const listTodo = () => {
  return vscode.commands.registerCommand('extension.listTodo', (workspaceState) => {
    util.searchAnnotations(workspaceState);
    console.log(123)
  })
}

module.exports = listTodo;