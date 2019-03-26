const vscode = require('vscode');
const os = require("os");
const window = vscode.window;
const workspace = vscode.workspace;
const defaultIcon = '$(checklist)';
const zapIcon = '$(zap)';
const defaultMsg = '0';

function searchAnnotations(workspaceState){
  const statusMsg = ` Searching...`;
  const pattern = 'TODO:';
  window.processing = true;

  const includePattern = '{' + [
  "**/*.js",
  "**/*.jsx",
  "**/*.ts",
  "**/*.tsx",
  "**/*.html",
  "**/*.php",
  "**/*.css",
  "**/*.scss"
  ].join(',') + '}';
  const excludePattern = '{' + [
    "**/node_modules/**",
    "**/bower_components/**",
    "**/dist/**",
    "**/build/**",
    "**/.vscode/**",
    "**/.github/**",
    "**/_output/**",
    "**/*.min.*",
    "**/*.map",
    "**/.next/**"
  ].join(',') + '}';
  const limitationForSearch = 5120;
  setStatusMsg(zapIcon, statusMsg);
  workspace.findFiles(includePattern, excludePattern, limitationForSearch).then(function (files) {

    if (!files || files.length === 0) {
      annotationsFound({ message: 'No files found' });
      return;
    }

    var totalFiles = files.length,
        progress = 0,
        times = 0,
        annotations = {},
        annotationList = [];

    function file_iterated() {
        times++;
        progress = Math.floor(times / totalFiles * 100);

        setStatusMsg(zapIcon, progress + '% ' + statusMsg);

        if (times === totalFiles || window.manullyCancel) {
          window.processing = true;
          workspaceState.update('annotationList', annotationList);
          annotationsFound(null, annotations, annotationList);
        }
    }

    for (var i = 0; i < totalFiles; i++) {
        workspace.openTextDocument(files[i]).then(function (file) {
            searchAnnotationInFile(file, annotations, annotationList, pattern);
            file_iterated();
        }, function (err) {
            errorHandler(err);
            file_iterated();
        });

    }
  }, function (err) {
      errorHandler(err);
  });
}

function searchAnnotationInFile(file, annotations, annotationList, regexp) {
  var fileInUri = file.uri.toString();
  var pathWithoutFile = fileInUri.substring(7, fileInUri.length);

  for (var line = 0; line < file.lineCount; line++) {
      var lineText = file.lineAt(line).text;
      var match = lineText.match(regexp);
      if (match !== null) {
          if (!annotations.hasOwnProperty(pathWithoutFile)) {
              annotations[pathWithoutFile] = [];
          }
          var content = getContent(lineText, match);
          if (content.length > 500) {
              content = content.substring(0, 500).trim() + '...';
          }
          var locationInfo = getLocationInfo(fileInUri, pathWithoutFile, lineText, line, match);

          var annotation = {
              uri: locationInfo.uri,
              label: content,
              detail: locationInfo.relativePath,
              lineNum: line,
              fileName: locationInfo.absPath,
              startCol: locationInfo.startCol,
              endCol: locationInfo.endCol
          };
          annotationList.push(annotation);
          annotations[pathWithoutFile].push(annotation);
      }
  }
}

function errorHandler(err) {
  window.processing = true;
  setStatusMsg(defaultIcon, defaultMsg);
  console.log('todohighlight err:', err);
}

function setStatusMsg(icon, msg, tooltip) {
  if (window.statusBarItem) {
      window.statusBarItem.text = `${icon} ${msg}` || '';
      if (tooltip) {
          window.statusBarItem.tooltip = tooltip;
      }
      window.statusBarItem.show();
  }
}
function annotationsFound(err, annotations, annotationList) {
  if (err) {
      console.log('todohighlight err:', err);
      setStatusMsg(defaultIcon, defaultMsg);
      return;
  }

  var resultNum = annotationList.length;
  var tooltip = resultNum + ' result(s) found';
  setStatusMsg(defaultIcon, resultNum, tooltip);
  showOutputChannel(annotationList);
}

function showOutputChannel(data) {
  if (!window.outputChannel) return;
  window.outputChannel.clear();

  if (data.length === 0) {
      window.showInformationMessage('No results');
      return;
  }

  var settings = workspace.getConfiguration('todohighlight');
  var toggleURI = settings.get('toggleURI', false);

  data.forEach(function (v, i, a) {
      // due to an issue of vscode(https://github.com/Microsoft/vscode/issues/586), in order to make file path clickable within the output channel,the file path differs from platform
      var patternA = '#' + (i + 1) + '\t' + v.uri + '#' + (v.lineNum + 1);
      var patternB = '#' + (i + 1) + '\t' + v.uri + ':' + (v.lineNum + 1) + ':' + (v.startCol + 1);
      var patterns = [patternA, patternB];

      //for windows and mac
      var patternType = 0;
      if (os.platform() == "linux") {
          // for linux
          patternType = 1;
      }
      if (toggleURI) {
          //toggle the pattern
          patternType = +!patternType;
      }
      window.outputChannel.appendLine(patterns[patternType]);
      window.outputChannel.appendLine('\t' + v.label + '\n');
  });
  window.outputChannel.show();
}

function getContent(lineText, match) {
  return lineText.substring(lineText.indexOf(match[0]), lineText.length);
};

function getLocationInfo(fileInUri, pathWithoutFile, lineText, line, match) {
  var rootPath = workspace.rootPath + '/';
  var outputFile = pathWithoutFile.replace(rootPath, '');
  var startCol = lineText.indexOf(match[0]);
  var endCol = lineText.length;
  var location = outputFile + ' ' + (line + 1) + ':' + (startCol + 1);

  return {
      uri: fileInUri,
      absPath: pathWithoutFile,
      relativePath: location,
      startCol: startCol,
      endCol: endCol
  };
};

module.exports = {
  searchAnnotations
}