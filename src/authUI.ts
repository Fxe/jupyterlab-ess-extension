export async function buildAuthUI(mainWidget: any,
  fnGetKBaseAuth: () => Promise<any>,
  fnGetARMAuth: () => Promise<any>,
  fnSaveKBaseAuth: (t:string) => Promise<any>,
  fnSaveARMAuth: (u:string, t:string) => Promise<any>) {

  const kbaseAuthData = await fnGetKBaseAuth();
  const armAuthData = await fnGetARMAuth();

  const labelKBaseToken = document.createElement('label');
  labelKBaseToken.setAttribute('for', 'input-kbase-token')
  labelKBaseToken.textContent = 'KBase Token:'
  const inputKBaseToken = document.createElement('input');
  inputKBaseToken.setAttribute('id', 'input-kbase-token');
  inputKBaseToken.setAttribute('type', 'password');
  if (kbaseAuthData && kbaseAuthData.token) {
    inputKBaseToken.setAttribute('value', kbaseAuthData.token);
  }

  const buttonSaveKBaseToken = document.createElement('button');
  buttonSaveKBaseToken.setAttribute('type', 'button')
  buttonSaveKBaseToken.textContent = 'Save KBase Credentials'
  buttonSaveKBaseToken.addEventListener('click', function() {
    const token: string = inputKBaseToken.value;
    if (!token) {
      alert('Unable to save empty token');
    } else {
      fnSaveKBaseAuth(token).then(response => alert(JSON.stringify(response)))
    }
  });

  const labelARMUser = document.createElement('label');
  labelARMUser.setAttribute('for', 'input-arm-user')
  labelARMUser.textContent = 'ARM User:'
  const inputARMUser = document.createElement('input');
  inputARMUser.setAttribute('id', 'input-arm-user');
  if (armAuthData && armAuthData.user) {
    inputARMUser.setAttribute('value', armAuthData.user);
  }
  const labelARMToken = document.createElement('label');
  labelARMToken.setAttribute('for', 'input-arm-token')
  labelARMToken.textContent = 'ARM Token:'
  const inputARMToken = document.createElement('input');
  inputARMToken.setAttribute('id', 'input-arm-token');
  inputARMToken.setAttribute('type', 'password');
  if (armAuthData && armAuthData.token) {
    inputARMToken.setAttribute('value', armAuthData.token);
  }

  const buttonSaveARMToken = document.createElement('button');
  buttonSaveARMToken.setAttribute('type', 'button')
  buttonSaveARMToken.textContent = 'Save ARM Credentials'
  buttonSaveARMToken.addEventListener('click', function() {
    const token: string = inputARMToken.value;
    const user: string = inputARMUser.value;
    if (!token || !user) {
      alert('Requires both user and token');
    } else {
      fnSaveARMAuth(user, token).then(response => alert(JSON.stringify(response)))
    }
  });

  mainWidget.append(labelKBaseToken);
  mainWidget.append(inputKBaseToken);
  mainWidget.append(buttonSaveKBaseToken);
  mainWidget.append(labelARMUser);
  mainWidget.append(inputARMUser);
  mainWidget.append(labelARMToken);
  mainWidget.append(inputARMToken);
  mainWidget.append(buttonSaveARMToken);
}