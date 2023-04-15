export async function buildAuthUI(mainWidget: any,
  fnGetKBaseAuth: () => Promise<any>,
  fnGetARMAuth: () => Promise<any>,
  fnSaveKBaseToken: (t:string) => Promise<any>,
  fnSaveARMUser: (t:string) => Promise<any>,
  fnSaveARMToken: (t:string) => Promise<any>) {

  const kbaseAuthData = await fnGetKBaseAuth();
  const armAuthData = await fnGetARMAuth();

  const labelKBaseToken = document.createElement('label');
  labelKBaseToken.setAttribute('for', 'input-kbase-token')
  labelKBaseToken.textContent = 'KBase Token:'
  const inputKBaseToken = document.createElement('input');
  inputKBaseToken.setAttribute('id', 'input-kbase-token');
  inputKBaseToken.setAttribute('type', 'password');

  const buttonSaveKBaseToken = document.createElement('button');
  buttonSaveKBaseToken.setAttribute('type', 'button')
  buttonSaveKBaseToken.textContent = 'Save'
  buttonSaveKBaseToken.addEventListener('click', function() {
    const token: string = inputKBaseToken.value;
    if (!token) {
      alert('Unable to save empty token');
    } else {
      fnSaveKBaseToken(token).then(response => alert(response))
    }
  });

  const labelARMUser = document.createElement('label');
  labelARMUser.setAttribute('for', 'input-arm-user')
  labelARMUser.textContent = 'ARM User:'
  const inputARMUser = document.createElement('input');
  inputARMUser.setAttribute('id', 'input-arm-user');

  const buttonSaveARMUser = document.createElement('button');
  buttonSaveARMUser.setAttribute('type', 'button')
  buttonSaveARMUser.textContent = 'Save'
  buttonSaveARMUser.addEventListener('click', function() {
    const token: string = inputARMUser.value;
    if (!token) {
      alert('Unable to save empty token');
    } else {
      fnSaveARMUser(token).then(response => alert(response))
    }
  });

  const labelARMToken = document.createElement('label');
  labelARMToken.setAttribute('for', 'input-arm-token')
  labelARMToken.textContent = 'ARM Token:'
  const inputARMToken = document.createElement('input');
  inputARMToken.setAttribute('id', 'input-arm-token');
  inputARMToken.setAttribute('type', 'password');

  const buttonSaveARMToken = document.createElement('button');
  buttonSaveARMToken.setAttribute('type', 'button')
  buttonSaveARMToken.textContent = 'Save'
  buttonSaveARMToken.addEventListener('click', function() {
    const token: string = inputARMToken.value;
    if (!token) {
      alert('Unable to save empty token');
    } else {
      fnSaveARMToken(token).then(response => alert(response))
    }
  });

  mainWidget.append(labelKBaseToken);
  mainWidget.append(inputKBaseToken);
  mainWidget.append(buttonSaveKBaseToken);
  mainWidget.append(labelARMUser);
  mainWidget.append(inputARMUser);
  mainWidget.append(buttonSaveARMUser);
  mainWidget.append(labelARMToken);
  mainWidget.append(inputARMToken);
  mainWidget.append(buttonSaveARMToken);
}