self.onmessage = async ({ data }) => {
  console.time('query worker');
  try {
    if (!data) throw new Error('No data');

    const { IndexedDbContext } = await import('./idx.db.js');
    const { dbContextConfig, id } = data;
    const { DB_NAME, OBJECT_STORES, DB_OPERATIONS } = dbContextConfig;
    const dbContext = await IndexedDbContext.init({
      dbName: DB_NAME,
      stores: [
        {
          name: OBJECT_STORES.USERS,
          options: IndexedDbContext.OBJECT_STORE_OPTIONS.keyPath('id'),
        },
        {
          name: OBJECT_STORES.CREDENTIALS,
          options: IndexedDbContext.OBJECT_STORE_OPTIONS.keyPath('id'),
        },
      ],
    });

    const { result: usersResult } = await dbContext
      .store({ name: OBJECT_STORES.USERS })
      .get({ key: id });
    const { result: credentialsResult } = await dbContext
      .store({ name: OBJECT_STORES.CREDENTIALS })
      .get({ key: id });
    self.postMessage({
      done: true,
      user: { ...usersResult, ...credentialsResult },
    });
  } catch (error) {
    self.postMessage({ done: false, error });
    console.error(error);
  }
  console.timeEnd('query worker');
};
