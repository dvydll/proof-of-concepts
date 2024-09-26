import * as appConfig from './app.config.json' with { type: 'json' };

// global config
const { database } = appConfig.default;
const DB_OPERATIONS = Object.freeze({
  CREATE: 'create',
  READ: 'read',
  UPDATE: 'update',
  DELETE: 'delete',
})
const DB_NAME = database.name
const OBJECT_STORES = Object.freeze({
  USERS: database.stores.users,
  CREDENTIALS: database.stores.credentials,
})

const workers = {
  query: new Worker('./query.worker.js'),
  command: new Worker('./command.worker.js')
}

const getUserById = (id = crypto.randomUUID()) => workers.query.postMessage({ dbContextConfig: { DB_NAME, OBJECT_STORES, DB_OPERATIONS }, id })
const createUser = ({ name = '', password = '123456' }) => workers.command.postMessage({
  dbContextConfig: { DB_NAME, OBJECT_STORES, DB_OPERATIONS },
  operation: DB_OPERATIONS.CREATE,
  post: { name, password }
})

const user = { name: 'david', password: '123456' }
let id = null

document.getElementById('get-user').onclick = (evt) => getUserById(id)
document.getElementById('post-user').onclick = (evt) => createUser(user)
workers.query.onmessage = ({ data }) => console.log(data)
workers.command.onmessage = ({ data }) => id = data.id