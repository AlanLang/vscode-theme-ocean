const vscode = require('vscode');
const window = vscode.window;
let statusBarItem = null;
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
  const replaceType = currentFile.indexOf('/') >= 0?'/':'\\';

  const aFile = currentFile.split(replaceType);
  aFile.pop();
  const filePath = aFile.join(replaceType)
  // 查找工作区下面的文件
  const filter = new vscode.RelativePattern(filePath,'*');
  setStatusMsg("开始搜索");
  vscode.workspace.findFiles(filter,'**/node_modules/**', 100)
  .then(files=>{
      const showFiles = [];
      for(let file of files){
          if(file.fsPath.startsWith(filePath) && file.fsPath != currentFile){
              const fs = file.fsPath.split(replaceType);
              showFiles.push({
                  label:fs[fs.length - 1],
                  description:file.fsPath
              })
          }
      }
      closeStatusMsg();
      vscode.window.showQuickPick(showFiles)
      .then(
          command => showOrOpenFile(command.description).then(re=>{})
      );
      //vscode.window.showInformationMessage(files.fsPath)
  })
})

function setStatusMsg(msg) {
  if(!statusBarItem){
    statusBarItem = window.createStatusBarItem(vscode.StatusBarAlignment.Left)
  }
  statusBarItem.text = `$(zap) ${msg}` || '';
  statusBarItem.show();
}

function closeStatusMsg(){
  if(statusBarItem){
    statusBarItem.hide();
  }
}

module.exports = switchFile;