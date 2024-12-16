//const vscode from 'vscode');
import * as vscode from 'vscode';
import { createCommands } from './command_creator';
import { window, Uri, ExtensionContext, commands } from 'vscode';
import { getServerRunning } from './server';
import {authentication} from 'vscode';
import { MyAuth0AuthProvider } from './Authentication/auth_provider';
import { fetchUserData } from './Authentication/user_handler';
import { SidebarViewProvider } from './Sidebar/webview_provider';

// The `activate` function does not return anything, so its return type is `void`.
export async function activate (context: vscode.ExtensionContext) {
  const authProvider = new MyAuth0AuthProvider(context);
  
  context.subscriptions.push(createCommands(context));

  const sidebarViewProvider = new SidebarViewProvider(context.extensionUri);
  context.subscriptions.push(window.registerWebviewViewProvider('code-stats.webviewProvider', sidebarViewProvider, {
      webviewOptions: {
          retainContextWhenHidden: false,
          enableScripts: true
      } as any
  }));

  getServerRunning();

  const startAuthenticationCommand = vscode.commands.registerCommand('code-stats.startAuthentication', async () => {
    // Start the authentication process after the login button is clicked
    try {
        const session = await authentication.getSession(MyAuth0AuthProvider.id, [], { createIfNone: true });
        window.showInformationMessage(`Session creation. Logged in as: ${session.account.label}`);
          
        if (session) {
          window.showInformationMessage(`Session creation succeeded. Logged in as: ${session.account.label}`);
          // Handle the authenticated user, e.g., create/save a user.
          const user = await fetchUserData(session.accessToken); // Fetch user info.
          window.showInformationMessage(`Welcome, ${user.name}!`);
          if (user) {
            await authProvider.updateSessionWithUserInfo(session.accessToken, user, session);
            window.showInformationMessage(`Globalcontext: ${context.globalState.get('currentSession')}`)
          } else { window.showErrorMessage('User is null !!'); }
      }
    }catch (error) {
      window.showErrorMessage(`Authentication failed: ${error}`);
    }
  });
  context.subscriptions.push(startAuthenticationCommand);


}

export function deactivate() {};

export async function reload() {
  // updateFlowModeStatus();

  // try {
  //   initializeWebsockets();
  // } catch (e: any) {
  //   logIt(`Failed to initialize websockets: ${e.message}`);
  // }
  
  // // re-initialize user and preferences
  // await getUser();

  // // fetch after logging on
  // SummaryManager.getInstance().updateSessionSummaryFromServer();

  // if (musicTimeExtInstalled()) {
  //   setTimeout(() => {
  //     commands.executeCommand("musictime.refreshMusicTimeView")
  //   }, 1000);
  // }

  // if (editorOpsExtInstalled()) {
  //   setTimeout(() => {
  //     commands.executeCommand("editorOps.refreshEditorOpsView")
  //   }, 1000);
  // }

  //commands.executeCommand('codetime.refreshCodeTimeView');
}