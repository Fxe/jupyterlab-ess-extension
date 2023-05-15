import {EssData} from './essFileBrowser.js';

// Make the `request` function generic
// to specify the return data type:
async function request<TResponse>(
  url: string,
  // `RequestInit` is a type for configuring 
  // a `fetch` request. By default, an empty object.
  config: RequestInit = {}
   
// This function is async, it will return a Promise:
): Promise<TResponse> {
    
  // Inside, we call the `fetch` function with 
  // a URL and config given:
  return fetch(url, config)
    // When got a response call a `json` method on it
    .then((response) => response.json())
    // and return the result data.
    .then((data) => data as TResponse);
    
    // We also can use some post-response
    // data-transformations in the last `then` clause.
}

export interface IEssDataAPI {
  //ready: Promise<void>;
  //listDataSources: Promise<EssData.IDataSourceList>;
  setAuth(datasource:string, key:string, value:string): any;
  listDatasources(): Promise<EssData.IDataItem[]>;
  listDatasourceContent(path: string[], body: any): Promise<EssData.IDataItem[]>;
  getDatasourceItem(object_id: string, path: string[]): Promise<EssData.IDataItem[]>;
}

export class EssDataAPI implements IEssDataAPI {

  private baseUrl: string;
  private auth: any;

  constructor() {
    this.auth = {}
    this.baseUrl = 'http://sequoia.mcs.anl.gov:30015';
  }

  setAuth(datasource:string, key:string, value:string) {
    if (!this.auth[datasource]) {
      this.auth[datasource] = {}
    }
    this.auth[datasource][key] = value
  }

  listDatasourceContent = async(path: string[], body: any): Promise<EssData.IDataItem[]> => {
    try {
      let headers = {
        'Content-Type': 'application/json',
        'accept': 'application/json'
      }

      if (this.auth[path[0]]) {
        headers = {...headers, ...this.auth[path[0]]}
      }

      console.log('POST HEADERS', headers)

      const response = await fetch(this.baseUrl + '/data2/' + path.slice(0, 2).join('/'), {
        method: 'POST',
        body: JSON.stringify(body),
        headers: headers
      });
      if (!response.ok) {
        throw new Error(`Error! status: ${response.status}`);
      }
      const result = (await response.json()) as EssData.IDataItem[];
      result.forEach(o => {
        if (!o.path) {
          o.path = [...path]
          o.path.push(o.id)
        }
      })
      return result;
    } catch (error) {
      if (error instanceof Error) {
        console.log('error message: ', error.message);
      } else {
        console.log('unexpected error: ', error);
      }
    }

    throw new Error('Error');
  }

  getDatasourceItem = async(object_id: string, path: string[]): Promise<EssData.IDataItem[]> => {
    console.log(path);
    try {
      let headers = {
        'Content-Type': 'application/json',
        'accept': 'application/json'
      }

      if (this.auth[path[0]]) {
        headers = {...headers, ...this.auth[path[0]]}
      }

      const body = {'object_id': object_id};

      const response = await fetch(this.baseUrl + '/data2/' + path.slice(0, 2).join('/'), {
        method: 'POST',
        body: JSON.stringify(body),
        headers: headers
      });
      if (!response.ok) {
        throw new Error(`Error! status: ${response.status}`);
      }
      const result = (await response.json()) as EssData.IDataItem[];

      return result;
    } catch (error) {
      if (error instanceof Error) {
        console.log('error message: ', error.message);
      } else {
        console.log('unexpected error: ', error);
      }
    }

    throw new Error('Error');
  }

  listDatasources = async(): Promise<EssData.IDataItem[]> => {
    const response = await request<string[]>(this.baseUrl + '/data2')

    const items: EssData.IDataItem[] =  [];
    //const response = await window.fetch('http://192.168.1.15:7777/data', {method: 'GET'}).json<string[]>()
    response.forEach(s => {
      items.push({id: s, type: 'datasource', path: [s]})
    })
    //response.for

    return items;
  }
}

export class EssDataMOCK implements IEssDataAPI  {

  constructor() {

  }

  setAuth(datasource:string, key:string, value:string) {
    console.log('MOCK ignore auth');
  }

  listDatasourceContent = async(path: string[], body: any): Promise<EssData.IDataItem[]> => {
    const DUMMY_ITEMS: EssData.IDataItem[] =  [];
    if (path.length == 1 && path[0] == 'ModelSEED') {
      DUMMY_ITEMS.push({id: 'Compounds', type: 'path', path: ['ModelSEED', 'Compounds']})
      DUMMY_ITEMS.push({id: 'Reactions', type: 'path', path: ['ModelSEED', 'Reactions']})
    } else if (path.length == 2 && path[0] == 'ModelSEED' && path[1] == 'Compounds') {
      DUMMY_ITEMS.push({id: 'cpd00001', type: 'file', path: ['ModelSEED', 'Compounds']})
      DUMMY_ITEMS.push({id: 'cpd00002', type: 'file', path: ['ModelSEED', 'Reactions']})
    } else if (path.length == 2 && path[0] == 'ModelSEED' && path[1] == 'Reactions') {
      DUMMY_ITEMS.push({id: 'rxn00001', type: 'file', path: ['ModelSEED', 'Compounds']})
      DUMMY_ITEMS.push({id: 'rxn00002', type: 'file', path: ['ModelSEED', 'Reactions']})
    } else {
      DUMMY_ITEMS.push({id: 'aaaa', type: 'item', path: ['KBase', 'X', 'gggg']})
      DUMMY_ITEMS.push({id: 'bbb', type: 'item', path: ['ARM', 'X', 'gggg']})
      DUMMY_ITEMS.push({id: 'ccc', type: 'item', path: ['ESG', 'X', 'gggg']})
      DUMMY_ITEMS.push({id: 'zzzz', type: 'item', path: ['ModelSEED', 'X', 'gggg']})
      DUMMY_ITEMS.push({id: 'xxxx', type: 'item', path: ['Pokemon', 'X', 'gggg']})
      DUMMY_ITEMS.push({id: 'gggg', type: 'item', path: ['Pokemon', 'X', 'gggg']})
    }

    return DUMMY_ITEMS;
  }

  getDatasourceItem(object_id: string, path: string[]): Promise<EssData.IDataItem[]> {
    throw new Error('Method not implemented.');
  }

  listDatasources = async(): Promise<EssData.IDataItem[]> => {
    const DUMMY_ITEMS: EssData.IDataItem[] =  [];
    DUMMY_ITEMS.push({id: 'KBase', type: 'datasource', path: ['KBase']})
    DUMMY_ITEMS.push({id: 'ARM', type: 'datasource', path: ['ARM']})
    DUMMY_ITEMS.push({id: 'ESG', type: 'datasource', path: ['ESG']})
    DUMMY_ITEMS.push({id: 'ModelSEED', type: 'datasource', path: ['ModelSEED']})
    DUMMY_ITEMS.push({id: 'Pokemon', type: 'datasource', path: ['Pokemon']})
    return DUMMY_ITEMS;
  }
}

export async function fetchPokemon(name: string) {
  const pokemonQuery = `
    query PokemonInfo($name: String) {
      pokemon(name: $name) {
        id
        number
        name
        image
        attacks {
          special {
            name
            type
            damage
          }
        }
      }
    }
  `

  const response = await window.fetch('https://graphql-pokemon2.vercel.app/', {
    // learn more about this API here: https://graphql-pokemon2.vercel.app/
    method: 'POST',
    headers: {
      'content-type': 'application/json;charset=UTF-8',
    },
    body: JSON.stringify({
      query: pokemonQuery,
      variables: {name: name.toLowerCase()},
    }),
  })

  const {data, errors} = await response.json()
  if (response.ok) {
    const pokemon = data?.pokemon
    if (pokemon) {
      // add fetchedAt helper (used in the UI to help differentiate requests)
      //pokemon.fetchedAt = formatDate(new Date())
      return pokemon
    } else {
      return Promise.reject(new Error(`No pokemon with the name "${name}"`))
    }
  } else {
    // handle the graphql errors
    const error = new Error('unknown')
    return Promise.reject(error)
  }
}
