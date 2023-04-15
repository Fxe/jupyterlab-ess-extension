import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';

import { ICommandPalette, MainAreaWidget } from '@jupyterlab/apputils';
import { Widget } from '@lumino/widgets';
import { ILauncher } from '@jupyterlab/launcher';
import { requestAPI } from './handler';
import { EssFileBrowserExtension } from './essFileBrowser';
import { EssDataAPI } from './essDataAPI';
import { buildAuthUI } from './authUI';


const ICON_CLASS = 'jp-LauncherCard';

/**
 * Initialization data for the test_server extension.
 */
const plugin: JupyterFrontEndPlugin<void> = {
  id: 'test_server:plugin',
  autoStart: true,
  optional: [ILauncher, ICommandPalette],
  //requires: [ICommandPalette],
  activate: async (
    app: JupyterFrontEnd, 
    launcher: ILauncher | null, 
    palette: ICommandPalette
  ) => {
    console.log('JupyterLab extension test_server is activated!');
    
    const newWidget = async () => {
      // Create a blank content widget inside of a MainAreaWidget
      const content = new Widget();
      const widget = new MainAreaWidget({ content });
      widget.id = 'ess-data-browser';
      widget.title.label = 'Data Browser';
      widget.title.closable = true;
      const mainWidget = document.createElement('div');
      let token_kbase = null;
      let token_arm = null;
      let user_arm = null;
      try {
        const auth_kbase = await requestAPI<any>('token_kbase')
        token_kbase = auth_kbase['token']
        const auth_arm = await requestAPI<any>('token_arm')
        token_arm = auth_arm['token']
        user_arm = auth_arm['user']
      } catch (whatisthis) {
        console.log(whatisthis)
      }
      
      const api = new EssDataAPI();
      const saveFile = async (data: any, filename: string): Promise<string> => {
        let kind = 'json'
        if (filename.endsWith('.cdf')) {
          kind = 'hex_str'
        } else if (kind == 'json' && !filename.endsWith('.json')) {
          filename = filename + '.json'
        }
        
        const dataToSend = { data: data,  filename: filename, kind: kind};
        try {
          const reply = await requestAPI<any>('save_file', {
            body: JSON.stringify(dataToSend),
            method: 'POST',
          });
          console.log('POST save_file', dataToSend, '=>', reply);
          return JSON.stringify(reply);
          
        } catch (reason) {
          return 'error'
        }
        
      }
      const browser = new EssFileBrowserExtension(mainWidget, api, saveFile, user_arm, token_arm, token_kbase);

      browser.changePath([]).then(x => console.log('changed path!'));

      content.node.appendChild(mainWidget);
      return widget;
    }

    const authWidget = async () => {
      const content = new Widget();
      const widget = new MainAreaWidget({ content });
      widget.id = 'ess-settings-auth';
      widget.title.label = 'Settings Auth';
      widget.title.closable = true;
      const mainWidget = document.createElement('div');
      const fnSaveARMAuth = (user:string, token: string): Promise<any> => {
        return requestAPI<any>('token_arm', {
          body: JSON.stringify({ user: user, token: token}),
          method: 'POST',
        });
      }
      const fnSaveKBaseAuth = (token: string): Promise<any> => {
        return requestAPI<any>('token_kbase', {
          body: JSON.stringify({ token: token}),
          method: 'POST',
        });
      }
      const fnGetKBaseAuth = (): Promise<any> => {
        return requestAPI<any>('token_kbase');
      }
      const fnGetARMAuth = (): Promise<any> => {
        return requestAPI<any>('token_arm');
      }
      buildAuthUI(mainWidget, fnGetKBaseAuth, fnGetARMAuth, fnSaveKBaseAuth, fnSaveARMAuth);

      content.node.appendChild(mainWidget);
      return widget;
    }
    
    const { commands } = app;
    
    let widget = await newWidget();
    let widgetAuth = await authWidget();
    const command: string = 'ess:datax';
    const commandAuthWidget: string = 'ess:auth';
    commands.addCommand(command, {
      label: 'ESS Data Browser',
      iconClass: args => (args['isPalette'] ? '' : ICON_CLASS),
      execute: async () => {
        // Regenerate the widget if disposed
        if (widget.isDisposed) {
          widget = await newWidget();
        }
        if (!widget.isAttached) {
          // Attach the widget to the main work area if it's not there
          app.shell.add(widget, 'main');
        }
        // Activate the widget
        app.shell.activateById(widget.id);
      }
    });
    commands.addCommand(commandAuthWidget, {
      label: 'ESS Settings Auth',
      iconClass: args => (args['isPalette'] ? '' : ICON_CLASS),
      execute: async () => {
        // Regenerate the widget if disposed
        if (widgetAuth.isDisposed) {
          widgetAuth = await authWidget();
        }
        if (!widgetAuth.isAttached) {
          // Attach the widget to the main work area if it's not there
          app.shell.add(widgetAuth, 'main');
        }
        // Activate the widget
        app.shell.activateById(widgetAuth.id);
      }
    });
    
    if (launcher) {
      console.log(launcher)
      launcher.add({command: command, category: 'ESS', rank: 1});
      launcher.add({command: commandAuthWidget, category: 'ESS', rank: 1});
      //launcher.add({command, category: 'ESS', rank: 1});
    }
    
    if (palette) {
      console.log('addItem')
      console.log(palette)
      palette.addItem({command: command, category: 'ESS' });
      palette.addItem({command: commandAuthWidget, category: 'ESS' });
    }
    /*
    requestAPI<any>('token_kbase')
      .then(data => {
        console.log('GET token_kbase', data);
      })
      .catch(reason => {
        console.error(
          `The test_server server extension appears to be missing.\n${reason}`
        );
      });*/
    
    

    
    
    /*
    const dataToSend = { token: 'SECRET' };
    try {
      const reply = await requestAPI<any>('token_kbase', {
        body: JSON.stringify(dataToSend),
        method: 'POST',
      });
      console.log('POST token_kbase', dataToSend, '=>', reply);
    } catch (reason) {
      console.error("bad error");
    }
    */
  }
};

export default plugin;
