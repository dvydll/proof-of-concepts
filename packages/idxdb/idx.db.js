/**
 * @typedef {Object} ObjectStoreConfig
 * @property {string} [name='store'] - Nombre del almacén de objetos.
 * @property {Readonly<>} [options={ autoIncrement: true }] - Configuración del almacén de objetos.
 */

/**
 * @typedef {Object} IndexedDbContextConfig
 * @property {string} [dbname='db'] - Nombre de la base de datos.
 * @property {string} [version=1] - Versión de la base de datos.
 * @property {Iterable<>} [stores=[]] - Coleccion de almacenes de objetos.
 */

/**
 * Crea un contexto de una base de datos en indexedDB con las operaciones CRUD básicas
 * @class
 */
export class IndexedDbContext {
  /**
   * @type {IDBDatabase}
   * @private
   */
  #db

  /**
   * @type {string}
   * @private
   */
  #currentStoreName

  /**
   * Tipos de transacciones para IndexedDB.
   * @readonly
   * @static
   * @enum {string}
   */
  static get TRANSACTION_TYPES() {
    return Object.freeze({
      /**
       * Una transacción que permite solo operaciones de lectura (consultas).
       */
      readonly: 'readonly',
      /**
       * Una transacción que permite operaciones de lectura y escritura.
       */
      readwrite: 'readwrite',
      /**
       * Utilizada durante el proceso de actualización de la versión de la base de datos.
       * Esta transacción solo se utiliza en el evento onupgradeneeded.
       */
      versionchange: 'versionchange'
    })
  }

  /**
   * Opciones para configurar un almacén de objetos en IndexedDB.
   * @readonly
   * @static
   * @enum {ObjectStoreOptions}
  */
  static get OBJECT_STORE_OPTIONS() {
    return Object.freeze({
      /**
       * Un booleano que indica si se debe crear un campo de clave autoincrementable.
       */
      autoIncrement: { autoIncrement: true },
      /**
       * Especifica el nombre del campo que servirá como clave primaria del almacén de objetos.
       * @type {(keyPath:string)=>({keyPath:string})}
       */
      keyPath: (keyPath) => ({ keyPath }),
      /**
       * Un booleano que indica si se deben permitir claves duplicadas en el almacén de objetos.
       */
      unique: { unique: true },
      /**
       * Un booleano que indica si se deben permitir valores de entrada múltiple para un mismo campo en los índices.
       */
      multiEntry: { multiEntry: true }
    })
  }

  get currentStore() {
    const getCurrentStore = () => ({
      name: this.#currentStoreName,
    });
    return getCurrentStore;
  }

  get db() {
    const getDb = () => ({
      name: this.#db.name,
      version: this.#db.version,
      stores: Array.from(this.#db.objectStoreNames)
    });
    return getDb;
  }

  constructor(db) { this.#db = db }

  static async init({ dbName = 'db', version = undefined, stores = [] } = {}) { 
    const openRequest = indexedDB.open(dbName, version);
    try {
      const db = await new Promise((resolve, reject) => {
        openRequest.onupgradeneeded = (event) => {
          const db = event.target.result;

          stores.forEach(({ name, options }) => {
            if (!db.objectStoreNames.contains(name))
             db.createObjectStore(name, options);
          });

          resolve(db);
        };
        openRequest.onsuccess = (event) => resolve(event.target.result);
        openRequest.onerror = (event) => reject(event.target.error);
      })
      return new IndexedDbContext(db);
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async create(data = [], {
    name = this.#currentStoreName,
    options = IndexedDbContext.TRANSACTION_TYPES.readwrite,
  } = {}) {
    // Para mantener la consistencia en el procesamiento de datos. (forEach al guardar)
    if (!data[Symbol.iterator] || typeof data[Symbol.iterator] !== 'function')
      data = [data];

    let response, tx;
    try {
      if (!this.#db.objectStoreNames.contains(name))
        throw new Error(`El objecStore ${name} no existe.`)

      if (!data || data.length === 0)
        throw new Error('No hay datos para guardar')

      tx = this.#db.transaction(name, options);
      const objStore = tx.objectStore(name);
      data.forEach(item => {
        const dbReq = objStore.add(item);
        dbReq.onerror = (event) => { throw new Error(`Error al guardar ${JSON.stringify(item)}.`) }
      });
      const result = await new Promise((resolve, reject) => {
        tx.oncomplete = (event) => resolve(event.target.result);
        tx.onerror = (event) => reject(event.target.error);
      });
      response = this.#createResponse({ success: true, result, message: 'Crear datos completado.', input: { data } });
    } catch (error) {
      response = this.#createResponse({ message: 'Error al crear datos.', input: { data }, error });
    } finally {
      //this.#txAbort(tx)
    }
    return response
  }

  async get({ key = undefined } = {}, {
    name = this.#currentStoreName,
    options = IndexedDbContext.TRANSACTION_TYPES.readonly
  } = {}) {
    let response, tx;
    try {
      if (!this.#db.objectStoreNames.contains(name))
        throw new Error(`El objecStore ${name} no existe.`)

      tx = this.#db.transaction(name, options);
      const objStore = tx.objectStore(name);
      const dbReq = key ? objStore.get(key) : objStore.getAll();
      const result = await new Promise((resolve, reject) => {
        dbReq.onsuccess = (event) => resolve(event.target.result)
        dbReq.onerror = (event) => reject(event.target.error);
      });
      response = this.#createResponse({ success: true, result, message: 'Obtener datos completado.', input: { key } });
    } catch (error) {
      response = this.#createResponse({ message: 'Error al obtener datos.', input: { key }, error });
    } finally {
     // this.#txAbort(tx)
    }
    return response
  }

  /**
   * Realiza una operación definida por el callback proporcionado por cada elemento del almacén de objetos.
   * @param {() => unknown} recordHandler 
   * @param {{name = this.#currentStoreName,options = IndexedDbContext.TRANSACTION_TYPES.readonly}} [param1={}] 
   * @returns 
   */
  async cursor(recordHandler = (record) => { }, {
    name = this.#currentStoreName,
    options = IndexedDbContext.TRANSACTION_TYPES.readonly
  } = {}) {
    let response, tx;
    try {
      if (!this.#db.objectStoreNames.contains(name))
        throw new Error(`El objecStore ${name} no existe.`)

      tx = this.#db.transaction(name, options);
      const objStore = tx.objectStore(name);
      const cursor = objStore.openCursor();

      while (cursor) {
        const result = recordHandler(cursor.value)

        if (result instanceof Promise)
          await result

        cursor = await cursor.continue();
      }
      response = this.#createResponse({ success: true, result, message: 'Manejar datos completado.', input: { key } });
    } catch (error) {
      response = this.#createResponse({ message: 'Error al manejar datos.', input: { key }, error });
    } finally {
      this.#txAbort(tx)
    }
    return response
  }

  async update({ data, key = undefined }, {
    name = this.#currentStoreName,
    options = IndexedDbContext.TRANSACTION_TYPES.readwrite
  } = {}) {
    let response, tx;

    try {
      if (!this.#db.objectStoreNames.contains(name))
        throw new Error(`El objecStore ${name} no existe.`)

      tx = this.#db.transaction(name, options);
      const objStore = tx.objectStore(name);
      const dbReq = objStore.put(data, key);
      const result = await new Promise((resolve, reject) => {
        dbReq.onsuccess = (event) => resolve(event.target.result)
        dbReq.onerror = (event) => reject(event.target.error);
      });
      response = this.#createResponse({ success: true, result, message: 'Actualizar datos completado.', input: { data, key } });
    } catch (error) {
      response = this.#createResponse({ message: 'Error al actualizar datos.', input: { data, key }, error });
    } finally {
      this.#txAbort(tx)
    }
    return response
  }

  async delete({ key }, {
    name = this.#currentStoreName,
    options = IndexedDbContext.TRANSACTION_TYPES.readwrite
  } = {}) {
    let response, tx;
    try {
      if (!this.#db.objectStoreNames.contains(name))
        throw new Error(`El objecStore ${name} no existe.`)

      if (!key)
        throw new Error('No se especifico la clave para eliminar.')

      tx = this.#db.transaction(name, options);
      const store = tx.objectStore(name);
      const request = store.delete(key);
      const result = await new Promise((resolve, reject) => {
        request.onsuccess = (event) => resolve(event.target.result)
        request.onerror = (event) => reject(event.target.error);
      });
      response = this.#createResponse({ success: true, result, message: 'Eliminar datos completado.', input: { key } });
    } catch (error) {
      response = this.#createResponse({ message: 'Error al eliminar datos.', input: { key }, error });
    } finally {
      this.#txAbort(tx)
    }
    return response
  }

  async createStore({ name, options = IndexedDbContext.OBJECT_STORE_OPTIONS.autoIncrement }) {
    let response, db;
    try {
      if (this.#db.objectStoreNames.contains(name))
        throw new Error(`El objectStore ${name} ya existe.`);

      // Comprueba si hay transacciones activas en la base de datos actual
      if (this.#db.transactionNames.length > 0) {
        // Si hay transacciones activas, espera a que se completen
        await Promise.all(Array.from(this.#db.transactionNames).map(async txName => {
          const tx = this.#db.transaction(txName);
          await new Promise((resolve) => tx.oncomplete = resolve);
        }));
      }

      this.#db.close();
      const newVersion = this.#db.version + 1;
      const openRequest = indexedDB.open(this.#db.name, newVersion);
      db = await new Promise((resolve, reject) => {
        openRequest.onupgradeneeded = (event) => {
          const upgradedDb = event.target.result;
          if (!upgradedDb.objectStoreNames.contains(name))
            upgradedDb.createObjectStore(name, options);
        };
        openRequest.onsuccess = (event) => resolve(event.target.result);
        openRequest.onerror = (event) => reject(event.target.error);
      });
      response = this.#createResponse({ success: true, message: `El objectStore ${name} ha sido creado.`, input: { name, options } });
    } catch (error) {
      response = this.#createResponse({ message: 'Error al crear el objectStore.', input: { name }, error });
    } finally {
      this.#db = db;
    }
    return response
  }

  store({ name = '' } = {}) {
    if (this.#db.objectStoreNames.contains(name))
      this.#currentStoreName = name;
    else
      throw new Error(`El objectStore ${name} no existe.`);

    return this
  }

  /**
   * @method
   * @private
   * @param {{ success:boolean, result:unknown, message:string, input:{}, error:unknown }} [param0={}] Plantilla del objeto de respuesta genérica
   * @returns 
   */
  #createResponse({ success = false, result = null, message = '', input = {}, error = null } = {}) {
    return { success, result, details: { message, input, error } }
  }

  /**
   * @method
   * @private
   * @param {IDBTransaction} [tx]
   */
  #txAbort(tx) {
    tx && tx.db && tx.abort();
  }
}