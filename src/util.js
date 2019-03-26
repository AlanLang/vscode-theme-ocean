const vscode = require('vscode');
const os = require("os");
const window = vscode.window;
const workspace = vscode.workspace;
const defaultIcon = '$(checklist)';
const zapIcon = '$(zap)';
const defaultMsg = '0';

function searchAnnotations(){
  const statusMsg = ` Searching...`;
  window.processing = true;
  setStatusMsg(zapIcon, statusMsg);
}

module.exports = {
  searchAnnotations
}