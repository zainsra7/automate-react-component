import * as vscode from "vscode";
const fs = require("fs");

const get_component_file_content = (
  componentNameInCamelCase: string,
  componentNameInput: string
) => {
  return `import React from 'react';
import { ${componentNameInCamelCase}Styles } from './${componentNameInput}.styles';

interface Props{
  name: string;
};

export const ${componentNameInCamelCase} = ({ name }: Props) => {
  const classes = ${componentNameInCamelCase}Styles({});

  return(
    <>\${name}</>
  );
};`;
};

const get_component_styles_content = (componentNameInCamelCase: string) => {
  return `import { createStyles, makeStyles } from '@material-ui/core';
import { COLOURS } from '../../../utils/constants';

export const ${componentNameInCamelCase}Styles = makeStyles(() => 
  createStyles({
    root: {
      display: 'flex',
    },
  }),
);`;
};

const get_component_test_content = (
  componentNameInCamelCase: string,
  componentNameInput: string
) => {
  return `import React from 'react';
import 'jest-dom/extend-expect';
import { cleanup, wait } from '@testing-library/react';
import { renderWithRouter } from '../../../../../test/utils/render-with-router';
import { MockProviders } from '../../../../../test/utils/mock-providers';
import { ${componentNameInCamelCase}Fixtures } from './${componentNameInput}.fixtures';
import { ${componentNameInCamelCase} } from './${componentNameInput}';

describe('${componentNameInput}_Test', () => {
  it('component renders correctly', () => {
    const { getByTestId, findByText } = renderWithRouter(
      <MockProviders>
        <${componentNameInCamelCase} name={${componentNameInCamelCase}Fixtures.name}/>
      </MockProviders>
    );
  });
});
`;
};

const get_component_fixtures_content = (componentNameInCamelCase: string) => {
  return `export const ${componentNameInCamelCase}Fixtures = {
    name: 'Test Component',
  };`;
};

const input_component_name = async (regex: RegExp) => {
  const componentName = await vscode.window.showInputBox({
    value: "",
    placeHolder: "Please enter component name: e.g. `test-component` ",
    validateInput: text => {
      vscode.window.showInformationMessage(`Validating: ${text}`);
      return text.length == 0 || text.match(regex) == null
        ? "Please enter a valid value"
        : null;
    },
    prompt: "Examples: `test-component`, `test_component`, `test component`"
  });
  return componentName;
};

function is_dir(path: string) {
  try {
    var stat = fs.lstatSync(path);
    return stat.isDirectory();
  } catch (e) {
    // lstatSync throws an error if path doesn't exist
    return false;
  }
}

const input_directory_path = async (componentName: string, path: string) => {
  const fileName = await vscode.window.showInputBox({
    value: "/",
    placeHolder:
      "Please enter *relative* directory path for your component: e.g. `/client/src/components/` ",
    validateInput: text => {
      vscode.window.showInformationMessage(`Validating: ${path + text}`);
      let validDirectory = is_dir(path + text);
      return validDirectory === false
        ? "Please enter a valid directory value"
        : null;
    },
    ignoreFocusOut: true,
    prompt: `Examples: client/src/components will create a folder ${componentName} and add relevant files in it`
  });
  return fileName;
};

const getCamelCaseName = (componentNameSplitArray: RegExpMatchArray) => {
  let componentCamelCaseName = "";
  componentNameSplitArray.map((name, index) => {
    if (index === 0) {
      componentCamelCaseName = name;
      return name;
    }
    let tempName = name.substr(0, 1).toUpperCase() + name.substr(1);
    componentCamelCaseName += tempName;
  });
  return componentCamelCaseName;
};

export function activate(context: vscode.ExtensionContext) {
  let disposable = vscode.commands.registerCommand(
    "extension.createreactcomponent",
    async () => {
      const currentWorkspace = vscode.workspace.workspaceFolders;

      //1. Creating component directory
      if (currentWorkspace) {
        const currentDirectory = vscode.Uri.parse(
          currentWorkspace[0].uri.fsPath + "/test-component"
        );
        //Shoutout to https://levelup.gitconnected.com/converting-a-string-to-camelcase-in-javascript-f88a646a22b4
        const regex = /[A-Z\xC0-\xD6\xD8-\xDE]?[a-z\xDF-\xF6\xF8-\xFF]+|[A-Z\xC0-\xD6\xD8-\xDE]+(?![a-z\xDF-\xF6\xF8-\xFF])|\d+/g;

        let componentName = await input_component_name(regex);
        let componentNameSplitArray =
          componentName && componentName.match(regex);
        let camelCaseComponentName = "";
        if (componentNameSplitArray) {
          camelCaseComponentName = getCamelCaseName(componentNameSplitArray);
        }

        if (!componentName) {
          vscode.window.showErrorMessage(
            "Wrong component name! Please try again!"
          );
          return;
        }

        let directoryName = await input_directory_path(
          componentName,
          currentWorkspace[0].uri.fsPath
        );

        let directoryPath = vscode.Uri.parse(
          `${currentWorkspace[0].uri.fsPath}/${directoryName}/${componentName}`
        );

        await vscode.workspace.fs.createDirectory(directoryPath);

        const componentFilePath = vscode.Uri.parse(
          directoryPath.fsPath + `/${componentName}.tsx`
        );
        const componentTestPath = vscode.Uri.parse(
          directoryPath.fsPath + `/${componentName}.test.tsx`
        );
        const componentFixturesPath = vscode.Uri.parse(
          directoryPath.fsPath + `/${componentName}.fixtures.ts`
        );
        const componentStylesPath = vscode.Uri.parse(
          directoryPath.fsPath + `/${componentName}.styles.ts`
        );
        const componentIndexPath = vscode.Uri.parse(
          directoryPath.fsPath + `/index.ts`
        );

        //2. Creating component files
        await vscode.workspace.fs.writeFile(
          componentFilePath,
          new Uint8Array([])
        );
        await vscode.workspace.fs.writeFile(
          componentTestPath,
          new Uint8Array([])
        );
        await vscode.workspace.fs.writeFile(
          componentFixturesPath,
          new Uint8Array([])
        );
        await vscode.workspace.fs.writeFile(
          componentStylesPath,
          new Uint8Array([])
        );
        await vscode.workspace.fs.writeFile(
          componentIndexPath,
          new Uint8Array([])
        );

        //3. Writing content in each file
        await fs.writeFileSync(
          componentFilePath.fsPath,
          get_component_file_content(camelCaseComponentName, componentName),
          "utf8"
        );
        await fs.writeFileSync(
          componentStylesPath.fsPath,
          get_component_styles_content(camelCaseComponentName),
          "utf8"
        );
        await fs.writeFileSync(
          componentFixturesPath.fsPath,
          get_component_fixtures_content(camelCaseComponentName),
          "utf8"
        );
        await fs.writeFileSync(
          componentTestPath.fsPath,
          get_component_test_content(camelCaseComponentName, componentName),
          "utf8"
        );
        await fs.writeFileSync(
          componentIndexPath.fsPath,
          `export * from './${componentName}';`,
          "utf8"
        );
        vscode.window.showInformationMessage(
          `${componentName} created successfully under ${directoryPath.fsPath}!`
        );
      } else {
        vscode.window.showErrorMessage("Open workspace/project and try again!");
      }
    }
  );
  context.subscriptions.push(disposable);
}
export function deactivate() {}
