import * as vscode from "vscode";
const fs = require("fs");

//Shoutout to https://levelup.gitconnected.com/converting-a-string-to-camelcase-in-javascript-f88a646a22b4
export const regex = /[A-Z\xC0-\xD6\xD8-\xDE]?[a-z\xDF-\xF6\xF8-\xFF]+|[A-Z\xC0-\xD6\xD8-\xDE]+(?![a-z\xDF-\xF6\xF8-\xFF])|\d+/g;

export const getComponentNameFromUser = async () => {
  const componentName = await vscode.window.showInputBox({
    value: "",
    placeHolder: "Please enter component name: e.g. `test-component` ",
    validateInput: text => {
      vscode.window.showInformationMessage(`Validating: ${text}`);
      return text.length === 0 || text.match(regex) === null
        ? "Please enter a valid value"
        : null;
    },
    prompt: "Examples: `test-component`, `test_component`, `test component`"
  });
  return componentName ? componentName.toLowerCase() : componentName;
};

export const getDirectoryPathFromUser = async (
  componentName: string,
  pathFormRoot: string
) => {
  const directoryName = await vscode.window.showInputBox({
    value: pathFormRoot,
    placeHolder:
      "Please enter *relative* directory path for your component: e.g. `/client/src/components/` ",
    ignoreFocusOut: true,
    prompt: `Examples: client/src/components will create a folder ${componentName} and add relevant files in it`,
    valueSelection: [pathFormRoot.length, pathFormRoot.length]
  });
  return directoryName
    ? directoryName.endsWith("/")
      ? directoryName
      : directoryName + "/"
    : "";
};

export const getCamelCaseName = (componentNameSplitArray: RegExpMatchArray) => {
  let componentCamelCaseName = "";
  componentNameSplitArray.map((name, index) => {
    if (index === 0) {
      componentCamelCaseName += name.toLowerCase();
    } else {
      let tempName =
        name
          .toLowerCase()
          .substr(0, 1)
          .toUpperCase() + name.toLowerCase().substr(1);
      componentCamelCaseName += tempName;
    }
  });
  return componentCamelCaseName;
};
export const getPascalCaseName = (
  componentNameSplitArray: RegExpMatchArray
) => {
  let ComponentPascalCaseName = "";
  componentNameSplitArray.map((name, index) => {
    let tempName =
      name
        .toLowerCase()
        .substr(0, 1)
        .toUpperCase() + name.toLowerCase().substr(1);
    ComponentPascalCaseName += tempName;
  });
  return ComponentPascalCaseName;
};

export const createComponentDirectory = async (
  componentDirectoryPath: vscode.Uri
) => {
  await vscode.workspace.fs.createDirectory(componentDirectoryPath);
};
export const createComponentFile = async (
  componentFilePath: vscode.Uri,
  content: string
) => {
  await vscode.workspace.fs.writeFile(componentFilePath, new Uint8Array([]));
  await fs.writeFileSync(componentFilePath.fsPath, content, "utf8");
};
