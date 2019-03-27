const vscode = require('vscode');
const window = vscode.window;
const util = require('./src/util');

const deleteAllLogStatements = require('./src/log/removeLog');
const insertLogStatement = require('./src/log/insertLog');
const listTodo = require('./src/todo');
const switchFile = require('./src/switchFile');

function activate(context) {
    if (!window.statusBarItem) {
      window.statusBarItem = util.createStatusBarItem();
    }
    if (!window.outputChannel) {
        window.outputChannel = window.createOutputChannel('todoList');
    }
    context.subscriptions.push(insertLogStatement);

    context.subscriptions.push(deleteAllLogStatements);

    context.subscriptions.push(switchFile);
    
    context.subscriptions.push(listTodo(context.workspaceState));

    context.subscriptions.push(vscode.commands.registerCommand('todoList.showTodo', function () {
      var annotationList = context.workspaceState.get('annotationList', []);
      util.showOutputChannel(annotationList);
    }));
    
}
exports.activate = activate;

function deactivate() {
}

exports.deactivate = deactivate;
