import * as vscode from "vscode";
const fs = require("fs");
import {
  regex,
  getCamelCaseName,
  getPascalCaseName,
  getComponentMainFileContent,
  getComponentFixturesFileContent,
  getComponentStylesFileContent,
  getComponentTestFileContent,
  getComponentIndexFileContent,
  getComponentNameFromUser,
  getDirectoryPathFromUser,
  createComponentDirectory,
  createComponentFile
} from "./utils";

export function activate(context: vscode.ExtensionContext) {
  let disposable = vscode.commands.registerCommand(
    "extension.createreactcomponent",
    async (uri: vscode.Uri) => {
      const currentlyOpenedWorkspace = vscode.workspace.workspaceFolders;
      console.log(uri);
      if (currentlyOpenedWorkspace) {
        let pathFromRoot = "";

        // Component activated via right click from explorer menu
        if (uri) {
          pathFromRoot = uri.fsPath;
        } else {
          pathFromRoot = currentlyOpenedWorkspace[0].uri.fsPath;
        }

        // Custom Configuration(s)
        const configurationFiles:
          | object[]
          | undefined = vscode.workspace
          .getConfiguration("automatereact")
          .get("files");

        if (!configurationFiles) {
        } else {
          // Default behavior (Typescript React component with styles, fixtures, test, tsx and index file)

          // Fetch and filter component Name
          const componentName = await getComponentNameFromUser();

          if (!componentName) {
            vscode.window.showErrorMessage(
              "Invalid component name! Please try again!"
            );
            return;
          }

          const componentNameSplitIntoArray =
            componentName && componentName.match(regex);
          let componentNameInCamelCase = "";
          let componentNameInPascalCase = "";
          if (componentNameSplitIntoArray) {
            componentNameInCamelCase = getCamelCaseName(
              componentNameSplitIntoArray
            );
            componentNameInPascalCase = getPascalCaseName(
              componentNameSplitIntoArray
            );
          }

          // Fetch and create component directory
          const componentParentDirectoryPath = pathFromRoot;
          if (!uri) {
            const componentParentDirectoryPath = getDirectoryPathFromUser(
              componentName,
              pathFromRoot
            );
          }

          const componentDirectoryPath = vscode.Uri.parse(
            `${componentParentDirectoryPath}/${componentName}`
          );

          await createComponentDirectory(componentDirectoryPath);

          // Create component files

          const componentMainFilePath = vscode.Uri.parse(
            componentDirectoryPath.fsPath + `/${componentName}.tsx`
          );
          const componentTestFilePath = vscode.Uri.parse(
            componentDirectoryPath.fsPath + `/${componentName}.test.tsx`
          );
          const componentFixturesFilePath = vscode.Uri.parse(
            componentDirectoryPath.fsPath + `/${componentName}.fixtures.ts`
          );
          const componentStylesFilePath = vscode.Uri.parse(
            componentDirectoryPath.fsPath + `/${componentName}.styles.ts`
          );
          const componentIndexFilePath = vscode.Uri.parse(
            componentDirectoryPath.fsPath + `/index.ts`
          );

          await createComponentFile(
            componentMainFilePath,
            getComponentMainFileContent(
              componentNameInPascalCase,
              componentName
            )
          );
          await createComponentFile(
            componentTestFilePath,
            getComponentTestFileContent(
              componentNameInCamelCase,
              componentNameInPascalCase,
              componentName
            )
          );
          await createComponentFile(
            componentFixturesFilePath,
            getComponentFixturesFileContent(componentNameInCamelCase)
          );
          await createComponentFile(
            componentStylesFilePath,
            getComponentStylesFileContent(componentNameInPascalCase)
          );
          await createComponentFile(
            componentIndexFilePath,
            getComponentIndexFileContent(componentName)
          );
          vscode.window.showInformationMessage(
            `${componentName} created successfully under ${componentDirectoryPath.fsPath}!`
          );
        }
      } else {
        vscode.window.showErrorMessage("Open workspace/project and try again!");
      }
    }
  );
  context.subscriptions.push(disposable);
}
export function deactivate() {}
