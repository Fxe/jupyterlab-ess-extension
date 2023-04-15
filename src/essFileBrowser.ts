import {IEssDataAPI} from './essDataAPI';

export namespace EssData {
  export interface IDataItem {
    id: string,
    type: string,
    d?: string;
    owner?: string;
    t?: string;
    path: string[],
    data?: any
  }

  export interface IListResult {
    items: IDataItem[];
  }

  export interface IDataSource {
    id: string,
  }

  export interface IDataSourceList {
    items: IDataSource[];
  }
}

export namespace ModelSEED {
  export interface IReaction {
    id: string,
    name: string,
    abbreviation: string,
    definition: string,
    equation: string,
    stoichiometry: string,
    code: string,
    deltag: number,
    deltagerr: number,
    direction: string,
    reversibility: string,
    ec_numbers: string,
    source: string,
  }
}

export class MockDataSource implements EssData.IDataSource {

  private _id: string;

  constructor(i: string) {
    this._id = i
  }

  get id(): string {
    return this._id;
  }
}

export class MockIDataSourceList implements EssData.IDataSourceList {
  
  private _items: EssData.IDataSource[];

  constructor() {
    this._items = [];
    this._items.push(new MockDataSource("kbase"))
    this._items.push(new MockDataSource("arm"))
    this._items.push(new MockDataSource("etc"))
    this._items.push(new MockDataSource("chatgpt"))
  }

  get items(): EssData.IDataSource[] {
    return this._items;
  }
}

export interface IEssFileBrowserExtension {
  //ready: Promise<void>;
  //listDataSources: Promise<EssData.IDataSourceList>;
}

function createElement(e: string, text = "", clazz?:string): HTMLElement {
  const element = document.createElement(e);
  element.textContent = text
  if (clazz) {
    element.setAttribute("class", clazz);
  }
  return element;
}

function createDivElement(text = "", clazz?:string): HTMLDivElement {
  const element = document.createElement('div');
  element.textContent = text
  if (clazz) {
    element.setAttribute("class", clazz);
  }
  return element;
}

export class EssFileBrowserExtension implements IEssFileBrowserExtension {

  private selectedItem: any | null;
  private dataAPI: IEssDataAPI;
  private currentPath: string[] | null;
  private currentItems: string[];
  private mainWidget: HTMLDivElement;
  private mainDiv: HTMLDivElement;
  private fileBrowserCrumbsDiv: HTMLDivElement;
  private dirListingDiv: HTMLDivElement;
  private filterBoxDiv: HTMLDivElement;
  private dirItems: EssData.IDataItem[];
  private armUser?: string;
  private armToken?: string;
  private kbaseToken?: string;
  private fnSaveFile?: (d:any, f:string) => Promise<string>;

  constructor(mainWidget: HTMLDivElement, api: IEssDataAPI, fnSaveFile: (d:any, f:string) => Promise<string>, armUser?: string, armToken?: string, kbaseToken?: string) {
    this.fnSaveFile = fnSaveFile;
    this.dataAPI = api;
    this.dirItems = [];
    this.currentPath = null;
    this.currentItems = [];
    this.mainWidget = mainWidget;
    this.mainDiv = document.createElement('div')
    this.filterBoxDiv = createDivElement('', 'lm-Widget p-Widget jp-FileBrowser-filterBox')
    this.initFilterBox(this.filterBoxDiv);
    this.fileBrowserCrumbsDiv = createDivElement('', 'lm-Widget p-Widget jp-BreadCrumbs jp-FileBrowser-crumbs')
    this.dirListingDiv = createDivElement('', 'lm-Widget p-Widget jp-DirListing jp-FileBrowser-listing jp-mod-selected')

    this.mainDiv.append(this.filterBoxDiv)
    this.mainDiv.append(this.fileBrowserCrumbsDiv);
    this.mainDiv.append(this.dirListingDiv);

    mainWidget?.append(this.mainDiv);

    if (armUser) {
      this.dataAPI.setAuth('ARM', 'Username', armUser);
    }
    if (armToken) {
      this.dataAPI.setAuth('ARM', 'Auth-Token', armToken);
    }
    if (kbaseToken) {
      this.dataAPI.setAuth('KBase', 'Auth-Token', kbaseToken);
    }
  }

  initFilterBox(el: HTMLDivElement) {
    const filterInputDiv = createDivElement('', 'bp3-input-group jp-FilterBox jp-InputGroup')
    filterInputDiv.setAttribute('data-form-type', 'other')
    const filterInput = createElement('input', '', 'bp3-input')
    filterInput.setAttribute('type', 'text')
    filterInput.setAttribute('placeholder', 'Filter files by name')
    filterInput.setAttribute('data-form-type', 'other')
    filterInputDiv.append(filterInput)
    const filterInputRightIcon = createElement('span', '', 'bp3-input-action')
    filterInputDiv.append(filterInputRightIcon)
    el.append(filterInputDiv)
  }

  render() {

  }

  listPath() {
    this.updateDirListing
  }

  changePath = async(path: string[]): Promise<void> => {
    if (path.length == 1 && path[0] == 'ARM') {
      const el = this.dirListingDiv;
      el.textContent = ''

      //render ARM datastream timestamp UI
      const inputDatastream = document.createElement('input')
      const inputStart = document.createElement('input')
      inputStart.setAttribute('type', 'datetime-local')
      inputStart.setAttribute('step', '1')
      const inputEnd = document.createElement('input')
      inputEnd.setAttribute('type', 'datetime-local')
      inputEnd.setAttribute('step', '1')
      const buttonBrowse = document.createElement('button')
      buttonBrowse.setAttribute('type', 'button')
      buttonBrowse.textContent = 'Browse'
      el.append(inputDatastream);
      el.append(inputStart);
      el.append(inputEnd);
      el.append(buttonBrowse);
      var self = this;
      buttonBrowse.addEventListener('click', function() {
        if (inputDatastream.value) {
          console.log(inputDatastream.value)
          console.log(inputStart.value)
          console.log(inputEnd.value)
          const armPath = ['ARM', inputDatastream.value]
          console.log('query', armPath)
          const body: any = {}
          if (inputStart.value) {
            body['date_start'] = inputStart.value
          }
          if (inputEnd.value) {
            body['date_end'] = inputEnd.value
          }
          const p = self.dataAPI.listDatasourceContent(armPath, body);
          p.then((items) => self.updateDirListing(items));
        }
      })

    } else if (path.length == 0) {
      const items = await this.dataAPI.listDatasources();
      this.updateDirListing(items);
    } else {
      const datasource = path[0];
      console.log('query', datasource, path)
      const items = await this.dataAPI.listDatasourceContent(path, {});
      this.updateDirListing(items);
    }
    await this.updateBrowserCrumbs(this.fileBrowserCrumbsDiv, path)
  }

  updateBrowserCrumbs = async(el: HTMLDivElement, d: string[]): Promise<void> => {
    el.innerHTML = ""
    const icon = createElement('span', 'ROOT', 'jp-BreadCrumbs-home jp-BreadCrumbs-item')
    var self = this;
    icon.addEventListener('click', function() {
      self.changePath([])
    })
    el.append(icon)
    el.append(createElement("span"), "/")
    if (d && d.length > 0) {
      for (let i = 0; i < d.length; i++) {
        const p = d[i]
        const o = createElement("span", p, 'jp-BreadCrumbs-item')
        if (i < d.length) {
          o.addEventListener('click', function() {
            const path = d.slice();
            self.changePath(d.slice(0, i + 1))
          })
        }
        el.append(o);
        el.append(createElement("span"), "/")
      }
      /*
      el.append(createElement("span", "...", 'jp-BreadCrumbs-item'));
      el.append(createElement("span"), "/")
      el.append(createElement("span", "node_modules", 'jp-BreadCrumbs-item'));
      el.append(createElement("span"), "/")
      */
    }
  }

  updateDirListing = async(a: EssData.IDataItem[]): Promise<void> =>  {
    this.dirItems = a;
    const el = this.dirListingDiv;
    el.textContent = ''
    const ulContent = document.createElement('ul')
    ulContent.setAttribute('class', 'jp-DirListing-content')
  
    const divHeader = createElement('div', '', 'jp-DirListing-header')
    const divH1 = createElement('div', '', 'jp-DirListing-headerItem jp-id-name jp-mod-selected jp-mod-descending')
    divH1.append(createElement('span', 'Name', 'jp-DirListing-headerItemText'))
    //add icon
    const divH2 = createElement('div', '', 'jp-DirListing-headerItem jp-id-name')
    divH2.append(createElement('span', 'Description', 'jp-DirListing-headerItemText'))
    divHeader.append(divH1);
    divHeader.append(divH2);
    el.append(divHeader);
    var self = this;
    a.forEach(value => {
      const item = makeItem(value);
      //'jp-mod-selected'
      //item.onclick = {(ev: MouseEvent) => {}}
      item.addEventListener('dblclick', function() {
        if (value.type == 'datasource' || value.type == 'path' || value.type == 'folder') {
          console.log('change path ', value)
          self.changePath(value.path);
        } else if (value.type == 'file') {
          console.log('get item ', value)
          const wut = self.dataAPI.getDatasourceItem(value.id, value.path);
          wut.then(items => {
            if (self.fnSaveFile) {
              self.fnSaveFile(items[0].data, value.id).then(result => {alert(result)});
            }
          });
          
        } else {
          throw new Error('Not sure what to do with type ' + value.type);
        }
      });
      item.addEventListener('click', function() {
        if (self.selectedItem) {
          self.selectedItem.setAttribute('class', 'jp-DirListing-item');
        }
        self.selectedItem = this;
        this.setAttribute('class', 'jp-DirListing-item jp-mod-selected');
      })
      ulContent.append(item);
    });
  
    function makeItem(essDataItem:EssData.IDataItem): HTMLLIElement {
      const item = document.createElement('li')
      item.setAttribute('class', 'jp-DirListing-item')
      item.setAttribute('title', `Name: ${essDataItem.id} \
      Path: test/ess_notebook_browser/node_modules \
      Created: ${essDataItem.t?essDataItem.t:'na'} \
      Writable: false`)
      item.setAttribute('data-file-type', 'directory')
      item.setAttribute('data-isdir', 'true')
      let iconSymbol = '?'
      if (essDataItem.type == 'datasource') {
        iconSymbol = 'X'
      } else if (essDataItem.type == 'path' || essDataItem.type == 'folder') {
        iconSymbol = 'D'
      } else if (essDataItem.type == 'file') {
        iconSymbol = 'F'
      }
      const itemIcon = createElement('span', iconSymbol, 'jp-DirListing-itemIcon')
      item.append(itemIcon)
  
      const itemLabel = createElement('span', '', 'jp-DirListing-itemText')
      itemLabel.append(createElement('span', essDataItem.id))
      item.append(itemLabel)
  
      const itemMod = createElement('span', '', 'jp-DirListing-itemText')
      itemMod.append(createElement('span', essDataItem.d?essDataItem.d:essDataItem.id))
      item.append(itemMod)
  
      return item;
    }
  
    el.append(ulContent);
  }
/*
  get listDataSources(): Promise<EssData.IDataSourceList> {
    return new MockIDataSourceList()
  }
  */
  /*
  get ready(): Promise<void> {
    return void;
    //return this._readyPromise;
  }*/
}

export async function requestAPI<T>(url: string, method='GET'): Promise<T> {
  const response = await window.fetch(url, {
    method: method,
    headers: {
      'content-type': 'application/json;charset=UTF-8',
    }
  })

  const data = await response.json()

  if (response.ok) {
    return data;
  } else {
    const error = new Error('');
    return Promise.reject(error)
  }
  /*
  data.then{

  }
  if (data.length > 0) {
    try {
      data = JSON.parse(data);
    } catch (error) {
      console.log('Not a JSON response body.', response);
    }
  }
  */
  return data;
}
