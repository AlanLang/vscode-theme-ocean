const vscode = require('vscode');
const execa = require('execa');
const config = vscode.workspace.getConfiguration('commitizen');
const hasEmoji = config.get("hasEmoji");

const DEFAULT_TYPES = [
  {
    label: hasEmoji? '✨feat': 'feat',
    description: '新增功能'
  },
  {
    label: hasEmoji?'🐛fix':'fix',
    description: '修复bug'
  },
  {
    label: hasEmoji?'📝docs':'docs',
    description: '修改文档'
  },
  {
    label: hasEmoji?'🎨style':'style',
    description: '调整代码格式, 不改变代码逻辑 (空格, 布局, 缩进, 等等...)'
  },
  {
    label: hasEmoji?'🔨refactor':'refactor',
    description: '代码重构，未新增任何功能和修复任何bug'
  },
  {
    label: hasEmoji?'⚡perf':'perf',
    description: '改善性能和体现'
  },
  {
    label: hasEmoji?'✅test':'test',
    description: '增加或修改测试用例'
  },
  {
    label: hasEmoji?'🚧build':'build',
    description: '改变构建流程，新增依赖库、工具等'
  },
  {
    label: hasEmoji?'👷ci':'ci',
    description: '自动化流程配置修改'
  },
  {
    label: hasEmoji?'🔧chore':'chore',
    description: '非src和test的修改'
  },
  {
    label: hasEmoji?'⏱️revert':'revert',
    description: '回滚到上一个版本'
  }
];

const DEFAULT_MESSAGES = {
  type: '请选择提交的类型',
  scope: '说明commit的影响范围 [可空]',
  subject: '请简短清晰得描述本次提交的内容',
  body: '对本次提交的详细描述，使用 "|" 换行 [可空]',
  breaking: '列出所有破坏性的变动 [可空]',
  footer: '列出本次提交关闭的issues E.g.: #31, #34 [可空]'
};

const COMMIT_VALUE = {
  type: '',
  scope: '',
  subject: '',
  body: '',
  breaking: '',
  footer: ''
};
const commitizen = vscode.commands.registerCommand('extension.commitizen', () => {
  vscode.window.showQuickPick(DEFAULT_TYPES, getOption(DEFAULT_MESSAGES.type))
  .then(command => {
    if(command === undefined) {
      throw null;
    }
    COMMIT_VALUE.type = command.label;
    const options = {
      placeHolder: DEFAULT_MESSAGES.scope,
      ignoreFocusOut: true
    };
    return vscode.window.showInputBox(options)
  }).then(command => {
    if(command === undefined) {
      throw null;
    }
    COMMIT_VALUE.scope = command;
    const options = {
      placeHolder: DEFAULT_MESSAGES.subject,
      ignoreFocusOut: true,
      validateInput : input => {
        const maxLenght = 50;
        if (input.length === 0 || input.length > maxLenght) {
          return `提交内容为必填且必须小于50个字符`;
        }
        return '';
      }
    };
    return vscode.window.showInputBox(options)
  }).then(command => {
    if(command === undefined) {
      throw null;
    }
    COMMIT_VALUE.subject = command;
    const options = {
      placeHolder: DEFAULT_MESSAGES.body,
      ignoreFocusOut: true
    };
    return vscode.window.showInputBox(options)
  }).then(command => {
    if(command === undefined) {
      throw null;
    }
    COMMIT_VALUE.body = command;
    const options = {
      placeHolder: DEFAULT_MESSAGES.breaking,
      ignoreFocusOut: true
    };
    return vscode.window.showInputBox(options)
  }).then(command => {
    if(command === undefined) {
      throw null;
    }
    COMMIT_VALUE.breaking = command;
    const options = {
      placeHolder: DEFAULT_MESSAGES.footer,
      ignoreFocusOut: true
    };
    return vscode.window.showInputBox(options)

  }).then(command => {
    if(command === undefined) {
      throw null;
    }
    COMMIT_VALUE.footer = command;
    let message = COMMIT_VALUE.type;
    const cwd = vscode.workspace.workspaceFolders[0].uri.fsPath;

    if(COMMIT_VALUE.scope){
      message += `(${COMMIT_VALUE.scope})`
    }
    message += `: ${COMMIT_VALUE.subject}`
    if(COMMIT_VALUE.body){
      message += `
      ${COMMIT_VALUE.body}
      `
    }
    if(COMMIT_VALUE.breaking){
      message += `
      BREAKING CHANGE: ${COMMIT_VALUE.breaking}
      `
    }
    if(COMMIT_VALUE.footer){
      message += `
      Closes: ${COMMIT_VALUE.footer}
      `
    }

    execa('git', ['diff', '--name-only', '--cached'], {cwd}).then(res => {
      if(res && res.stdout){
        execa('git', ['commit', '-m', message], {cwd}).then(re => {
          vscode.commands.executeCommand('git.refresh');
        })
      }else{
        vscode.commands.executeCommand('git.stageAll').then(re => {
          return execa('git', ['commit', '-m', message], {cwd})
        })
        .then(re => {
          vscode.commands.executeCommand('git.refresh');
        })
      }
    })
  })
});

function getOption(msg){
  return {
    placeHolder: msg,
    ignoreFocusOut: true,
    matchOnDescription: true,
    matchOnDetail: true
  }
}

module.exports = commitizen;
