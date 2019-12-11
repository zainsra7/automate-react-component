import * as vscode from "vscode";
const fs = require("fs");

//Shoutout to https://levelup.gitconnected.com/converting-a-string-to-camelcase-in-javascript-f88a646a22b4
export const regex = /[A-Z\xC0-\xD6\xD8-\xDE]?[a-z\xDF-\xF6\xF8-\xFF]+|[A-Z\xC0-\xD6\xD8-\xDE]+(?![a-z\xDF-\xF6\xF8-\xFF])|\d+/g;

export const getComponentMainFileContent = (
  componentNameInPascalCase: string,
  componentNameInput: string
) => {
  return `import React from 'react';
import { ${componentNameInPascalCase}Styles } from './${componentNameInput}.styles';

interface Props{
  name: string;
};

export const ${componentNameInPascalCase} = ({ name }: Props) => {
  const classes = ${componentNameInPascalCase}Styles({});

  return(
    <>\${name}</>
  );
};`;
};

export const getComponentStylesFileContent = (
  componentNameInPascalCase: string
) => {
  return `import { createStyles, makeStyles } from '@material-ui/core';
import { COLOURS } from '../../../utils/constants';

export const ${componentNameInPascalCase}Styles = makeStyles(() => 
  createStyles({
    root: {
      display: 'flex',
    },
  }),
);`;
};

export const getComponentTestFileContent = (
  componentNameInCamelCase: string,
  componentNameInPascalCase: string,
  componentNameInput: string
) => {
  return `import React from 'react';
import 'jest-dom/extend-expect';
import { cleanup, wait } from '@testing-library/react';
import { renderWithRouter } from '../../../../../test/utils/render-with-router';
import { MockProviders } from '../../../../../test/utils/mock-providers';
import { ${componentNameInCamelCase}Fixtures } from './${componentNameInput}.fixtures';
import { ${componentNameInPascalCase} } from './${componentNameInput}';

describe('${componentNameInput} Tests', () => {
  it('component renders correctly', () => {
    const { getByTestId, findByText } = renderWithRouter(
      <MockProviders>
        <${componentNameInPascalCase} name={${componentNameInCamelCase}Fixtures.name}/>
      </MockProviders>
    );
  });
});
`;
};

export const getComponentFixturesFileContent = (
  componentNameInCamelCase: string
) => {
  return `export const ${componentNameInCamelCase}Fixtures = {
    name: 'Test Component',
  };`;
};

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
export const getComponentIndexFileContent = (componentName: string) => {
  return `export * from './${componentName}';`;
};

function isDir(path: string) {
  try {
    var stat = fs.lstatSync(path);
    return stat.isDirectory();
  } catch (e) {
    return false;
  }
}

export const getDirectoryPathFromUser = async (
  componentName: string,
  path: string
) => {
  const fileName = await vscode.window.showInputBox({
    value: "/",
    placeHolder:
      "Please enter *relative* directory path for your component: e.g. `/client/src/components/` ",
    validateInput: text => {
      vscode.window.showInformationMessage(`Validating: ${path + text}`);
      let validDirectory = isDir(path + text);
      return validDirectory === false
        ? "Please enter a valid directory value"
        : null;
    },
    ignoreFocusOut: true,
    prompt: `Examples: client/src/components will create a folder ${componentName} and add relevant files in it`
  });
  return path + fileName;
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
  vscode.workspace.fs.createDirectory(componentDirectoryPath);
};
export const createComponentFile = async (
  componentFilePath: vscode.Uri,
  content: string
) => {
  await vscode.workspace.fs.writeFile(componentFilePath, new Uint8Array([]));
  fs.writeFileSync(componentFilePath.fsPath, content, "utf8");
};
