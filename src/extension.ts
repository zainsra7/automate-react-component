import * as vscode from "vscode";
import {
  regex,
  getCamelCaseName,
  getPascalCaseName,
  getComponentNameFromUser,
  getDirectoryPathFromUser,
  createComponentDirectory,
  createComponentFile
} from "./utils";

interface FileProps {
  fileName: string;
  content: string;
}
export function activate(context: vscode.ExtensionContext) {
  let disposable = vscode.commands.registerCommand(
    "extension.createreactcomponent",
    async (uri: vscode.Uri) => {
      const currentlyOpenedWorkspace = vscode.workspace.workspaceFolders;
      if (currentlyOpenedWorkspace) {
        let pathFromRoot = "";
        let componentCreatedSuccessfully = false;

        // Custom Configuration(s)
        const configurationFiles:
          | FileProps[]
          | undefined = vscode.workspace
          .getConfiguration("automatereact")
          .get("files");

        // Component activated via right click from explorer menu
        if (uri) {
          pathFromRoot = uri.fsPath + "/";
        } else {
          pathFromRoot = currentlyOpenedWorkspace[0].uri.fsPath + "/";
        }
        // Fetch and filter component Name
        const componentName = await getComponentNameFromUser();

        if (!componentName) {
          vscode.window.showErrorMessage(
            "Invalid component name! Please try again!"
          );
          return;
        }

        const componentNameSplitIntoArray = componentName.match(regex);
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

        let componentDirectoryPath = vscode.Uri.parse(
          `${pathFromRoot}${componentName}`
        );
        // Fetch and create component directory
        if (!uri) {
          const componentParentDirectoryPath = await getDirectoryPathFromUser(
            componentName,
            pathFromRoot
          );
          componentDirectoryPath = vscode.Uri.parse(
            `${componentParentDirectoryPath}${componentName}`
          );
        }

        try {
          await createComponentDirectory(componentDirectoryPath);
        } catch (err) {
          vscode.window.showInformationMessage(err);
        }

        // Create individual component files
        if (configurationFiles && configurationFiles.length) {
          configurationFiles.map(async file => {
            let fileName = file.fileName
              ? file.fileName.replace(/fn\$/gi, componentName)
              : componentName + ".tsx";

            let fileContent = file.content
              ? file.content
                  .replace(/cN\$/g, componentNameInCamelCase)
                  .replace(/Cn\$/g, componentNameInPascalCase)
                  .replace(/fn\$/gi, componentName)
              : "";

            const componentFilePath = vscode.Uri.parse(
              componentDirectoryPath.fsPath + `/${fileName}`
            );
            await createComponentFile(componentFilePath, fileContent);
          });
          componentCreatedSuccessfully = true;
        }
        if (componentCreatedSuccessfully) {
          vscode.window.showInformationMessage(
            `${componentName} created successfully under ${componentDirectoryPath.fsPath}!`
          );
        }
      } else {
        vscode.window.showErrorMessage(
          "Open a workspace/project and try again!"
        );
      }
    }
  );
  context.subscriptions.push(disposable);
}
export function deactivate() {}
